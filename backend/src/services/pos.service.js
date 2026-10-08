const { Order, OrderItem, MenuItem, MenuItemVariant, MenuItemAddon, Tax, Customer, StoreTable, Invoice, InvoiceSequence, PaymentType, QrOrder, QrOrderItem, MenuItemRecipe, InventoryItem, InventoryLog, TokenSequence, Tenant, sequelize, Op } = require("../models");

exports.createOrderDB = async (tenantId, cartItems, deliveryType, customerType, customerId, tableId, paymentStatus = 'pending', invoiceId=null, username = null, branchId = null) => {
  return sequelize.transaction(async (transaction) => {
    const tenant = await Tenant.findByPk(tenantId, {
      attributes: ['id', [sequelize.fn('CURDATE'), 'today']],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} was not found while creating an order.`);
    }

    const today = String(tenant.get('today')).slice(0, 10);
    const tokenSequence = await TokenSequence.findOne({
      where: { tenant_id: tenantId },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    let tokenNo = tokenSequence && String(tokenSequence.last_updated).slice(0, 10) === today
      ? Number(tokenSequence.sequence_no || 0)
      : 0;
    tokenNo += 1;

    const order = await Order.create({
      delivery_type: deliveryType,
      customer_type: customerType,
      customer_id: customerId,
      table_id: tableId,
      token_no: tokenNo,
      payment_status: paymentStatus || 'pending',
      invoice_id: invoiceId || null,
      tenant_id: tenantId,
      branch_id: branchId,
    }, { transaction });

    await OrderItem.bulkCreate(cartItems.map((item) => ({
      order_id: order.id,
      item_id: item.id,
      variant_id: item.variant_id,
      price: item.price,
      quantity: item.quantity,
      notes: item.notes,
      addons: item?.addons_ids?.length > 0 ? JSON.stringify(item.addons_ids) : null,
      tenant_id: tenantId,
      branch_id: branchId,
    })), { transaction });

    await TokenSequence.upsert({
      tenant_id: tenantId,
      sequence_no: tokenNo,
      last_updated: today,
    }, { transaction });

    const inventoryUsage = new Map();
    for (const item of cartItems) {
      for (const recipe of item.recipeItems || []) {
        const variantId = Number(recipe.variant_id || 0);
        if (variantId && variantId !== Number(item.variant_id)) continue;

        const addonId = Number(recipe.addon_id || 0);
        const selectedAddons = (item.addons_ids || []).map(Number);
        if (addonId && !selectedAddons.includes(addonId)) continue;

        const inventoryItemId = Number(recipe.inventory_item_id);
        const quantity = Number(recipe.recipe_quantity) * Number(item.quantity);
        if (!Number.isInteger(inventoryItemId) || !Number.isFinite(quantity) || quantity < 0) {
          throw new Error('Order contains an invalid inventory recipe quantity.');
        }

        inventoryUsage.set(inventoryItemId, (inventoryUsage.get(inventoryItemId) || 0) + quantity);
      }
    }

    for (const [inventoryItemId, quantityUsed] of inventoryUsage) {
      const inventoryWhere = { id: inventoryItemId, tenant_id: tenantId };
      if (branchId != null) inventoryWhere.branch_id = branchId;

      const inventoryItem = await InventoryItem.findOne({
        where: inventoryWhere,
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!inventoryItem) {
        throw new Error(`Inventory item ${inventoryItemId} was not found for this tenant and branch.`);
      }

      const previousQuantity = Number(inventoryItem.quantity);
      const newQuantity = previousQuantity - quantityUsed;
      const minimumThreshold = Number(inventoryItem.min_quantity_threshold || 0);
      const status = newQuantity <= 0 ? 'out' : newQuantity <= minimumThreshold ? 'low' : 'in';

      await InventoryLog.create({
        tenant_id: tenantId,
        branch_id: branchId,
        inventory_item_id: inventoryItemId,
        type: 'OUT',
        quantity_change: quantityUsed,
        previous_quantity: previousQuantity,
        new_quantity: newQuantity,
        note: invoiceId
          ? `Auto deduction for recipe usage in invoice #${invoiceId}`
          : 'Auto deduction for recipe usage in order',
        created_by: username,
      }, { transaction });

      await inventoryItem.update({
        quantity: newQuantity,
        status,
      }, { transaction });
    }

    return { tokenNo, orderId: order.id };
  });
};

exports.getPOSQROrdersCountDB = async (tenantId) => {
    try {
        const totalOrders = await QrOrder.count({
            where: {
                tenant_id: tenantId,
                status: { [Op.notIn]: ['completed', 'cancelled'] },
            },
        });
        return totalOrders ?? 0;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.getPOSQROrdersDB = async (tenantId) => {
    try {
        const kitchenOrders = await QrOrder.findAll({
            where: {
                status: { [Op.notIn]: ['completed', 'cancelled'] },
                tenant_id: tenantId,
            },
            include: [
                {
                    model: Customer,
                    as: 'Customer',
                    attributes: [['name', 'customer_name']],
                    required: false, // LEFT JOIN
                },
                {
                    model: StoreTable,
                    as: 'StoreTable',
                    attributes: [['table_title', 'table_title'], ['floor', 'floor']],
                    required: false, // LEFT JOIN
                },
            ],
            attributes: [
                'id',
                'date',
                'delivery_type',
                'customer_type',
                'customer_id',
                'table_id',
                'status',
                'payment_status',
            ],
        });

        let kitchenOrdersItems = [];
        let addons = [];
        let recipeItems = [];

        if (kitchenOrders.length > 0) {
            const orderIds = kitchenOrders.map((o) => o.id);
            kitchenOrdersItems = await QrOrderItem.findAll({
                where: {
                    order_id: { [Op.in]: orderIds },
                },
                include: [
                    {
                        model: MenuItem,
                        as: 'MenuItem',
                        attributes: [['title', 'item_title'], 'tax_id'],
                        required: false, // LEFT JOIN
                        include: [
                            {
                                model: Tax,
                                as: 'Tax',
                                attributes: [['title', 'tax_title'], ['rate', 'tax_rate'], ['type', 'tax_type']],
                                required: false, // LEFT JOIN
                            },
                        ],
                    },
                    {
                        model: MenuItemVariant,
                        as: 'MenuItemVariant',
                        attributes: [['title', 'variant_title'], ['price', 'variant_price']],
                        required: false, // LEFT JOIN
                    },
                ],
                attributes: [
                    'id',
                    'order_id',
                    'item_id',
                    'variant_id',
                    'price',
                    'quantity',
                    'status',
                    'date',
                    'addons',
                    'notes',
                ],
            });

            const allAddonIds = [...new Set(kitchenOrdersItems.flatMap((o) => (o.addons ? JSON.parse(o.addons) : [])))];
            if (allAddonIds.length > 0) {
                addons = await MenuItemAddon.findAll({
                    where: { id: { [Op.in]: allAddonIds } },
                    attributes: ['id', 'item_id', 'title'],
                });
            }

            recipeItems = await MenuItemRecipe.findAll({
                where: { tenant_id: tenantId },
                include: [
                    { model: MenuItem, as: 'MenuItem', attributes: [['title', 'menu_item_title']] },
                    { model: MenuItemVariant, as: 'MenuItemVariant', attributes: [['title', 'variant_title']] },
                    { model: MenuItemAddon, as: 'MenuItemAddon', attributes: [['title', 'addon_title']] },
                    {
                        model: InventoryItem,
                        as: 'Ingredient',
                        attributes: [['title', 'ingredient_title'], 'unit', ['quantity', 'current_quantity'], 'min_quantity_threshold'],
                    },
                ],
                attributes: [
                    'id',
                    'menu_item_id',
                    'variant_id',
                    'addon_id',
                    'inventory_item_id',
                    ['quantity', 'recipe_quantity'],
                ],
            });
        }

        // Attach recipeItems to each kitchenOrderItem
        kitchenOrdersItems = kitchenOrdersItems.map(oi => {
            const relevantRecipeItems = recipeItems.filter(ri =>
                ri.menu_item_id === oi.item_id &&
                (ri.variant_id == 0 || ri.variant_id === oi.variant_id) &&
                (ri.addon_id === 0 || oi.addons?.includes(ri.addon_id))
            );
            return {
                ...oi.toJSON(), // Convert to plain object to add new properties
                recipeItems: relevantRecipeItems
            };
        });

        return {
            kitchenOrders: kitchenOrders.map(order => order.get({ plain: true })),
            kitchenOrdersItems,
            addons: addons.map(addon => addon.get({ plain: true })),
        };
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.updateQROrderStatusDB = async (tenantId, orderId, status) => {
    try {
        await QrOrder.update(
            { status: status },
            { where: { tenant_id: tenantId, id: orderId } }
            );
        return;
    } catch (error) {
        console.error(error);
        throw error;
    }
};


exports.cancelAllQROrdersDB = async (tenantId, status) => {
    try {
        await QrOrder.update(
            { status: status },
            { where: { tenant_id: tenantId } }
        );
        return;
    } catch (error) {
        console.error(error);
        throw error;
    }
};
