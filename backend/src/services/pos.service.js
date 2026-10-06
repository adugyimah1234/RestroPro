const { Order, OrderItem, MenuItem, MenuItemVariant, MenuItemAddon, Tax, Customer, StoreTable, Invoice, InvoiceSequence, PaymentType, QrOrder, QrOrderItem, MenuItemRecipe, InventoryItem, sequelize, Op } = require("../models");
const { getMySqlPromiseConnection } = require("../config/mysql.db");

exports.createOrderDB = async (tenantId, cartItems, deliveryType, customerType, customerId, tableId, paymentStatus = 'pending', invoiceId=null, username = null) => {
  const conn = await getMySqlPromiseConnection();

  try {
    // start transaction
    await conn.beginTransaction();

    // step 1: get current token no. from table token_sequences
    // if no data found give 0
    let tokenNo = 0;

    const [tokenSequence] = await conn.query("SELECT sequence_no, DATE(last_updated) as last_updated, DATE(NOW()) as todays_date FROM token_sequences WHERE tenant_id = ? LIMIT 1 FOR UPDATE", [tenantId]);
    tokenNo = tokenSequence[0]?.sequence_no || 0;
    const tokenLastUpdated = tokenSequence[0]?.last_updated ? new Date(tokenSequence[0]?.last_updated).toISOString().substring(0, 10) : new Date().toISOString().substring(0,10);

    const today = new Date(tokenSequence[0]?.todays_date || Date.now()).toISOString().substring(0,10);

    console.log(tokenLastUpdated, today);



    if(tokenLastUpdated != today) {
      tokenNo = 0;
    }

    // step 2: increase the token no. by +1
    tokenNo += 1;

    // step 3: save data to orders table
    const [orderResult] = await conn.query(`INSERT INTO orders (delivery_type, customer_type, customer_id, table_id, token_no, payment_status, invoice_id, tenant_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [deliveryType, customerType, customerId, tableId, tokenNo, paymentStatus || 'pending', invoiceId || null, tenantId]);

    const orderId = orderResult.insertId;

    // step 4: save data to order_items
    const sqlOrderItems = `
    INSERT INTO order_items
    (order_id, item_id, variant_id, price, quantity, notes, addons, tenant_id)
    VALUES ?
    `;

    await conn.query(sqlOrderItems, [cartItems.map((item)=>[orderId, item.id, item.variant_id, item.price, item.quantity, item.notes, item?.addons_ids?.length > 0 ? JSON.stringify(item.addons_ids):null, tenantId ])]);

    // step 6: Save updated token no. to table token_sequences
    await conn.query("INSERT INTO token_sequences ( sequence_no, last_updated, tenant_id) VALUES (?, NOW(), ?) ON DUPLICATE KEY UPDATE sequence_no = VALUES(sequence_no), last_updated = VALUES(last_updated) ;", [tokenNo, tenantId]);

     // Track Recipe/Inventory Item Usuage
     const inventoryUsage = {};

     cartItems.forEach(item => {
       item.recipeItems.forEach(recipe => {
         const { inventory_item_id, recipe_quantity, ingredient_title, unit, variant_id, addon_id } = recipe;

         // Skip if variant-specific and doesn't match
         if (variant_id && variant_id != item.variant_id) return;

         // Skip if addon-specific and not included
         if (addon_id && !item.addons_ids?.map(String).includes(String(addon_id))) return;

         const invId = inventory_item_id;
         const qtyNeeded = parseFloat(recipe_quantity) * item.quantity;

         if (!inventoryUsage[invId]) {
           inventoryUsage[invId] = {
             ingredient_title,
             unit,
             total_quantity: 0
           };
         }

         inventoryUsage[invId].total_quantity += qtyNeeded;
       });
     });


      // Step 7: Update inventory_items and insert into inventory_logs
      const updateInventorySql = `
        UPDATE inventory_items
        SET quantity = ?, status = ?
        WHERE id = ? AND tenant_id = ?
      `;

      const insertLogSql = `
        INSERT INTO inventory_logs
        (tenant_id, inventory_item_id, type, quantity_change, previous_quantity, new_quantity, note, created_by)
        VALUES (?, ?, 'OUT', ?, ?, ?, ?, ?)
      `;

      for (const [inventoryItemId, usage] of Object.entries(inventoryUsage)) {
        const invId = parseInt(inventoryItemId);
        const qtyUsed = parseFloat(usage.total_quantity);

        const [[currentItem]] = await conn.query(
          'SELECT quantity, min_quantity_threshold FROM inventory_items WHERE id = ? AND tenant_id = ? FOR UPDATE',
          [invId, tenantId]
        );

        const previousQty = parseFloat(currentItem?.quantity || 0);
        const newQty = previousQty - qtyUsed;
        const minQuantityThreshold = parseFloat(currentItem?.min_quantity_threshold || 0);

        // Insert into inventory_logs
        await conn.query(insertLogSql, [
          tenantId,
          invId,
          qtyUsed,
          previousQty,
          newQty,
          invoiceId ? `Auto deduction for recipe usage in invoice #${invoiceId}` : 'Auto deduction for recipe usage in order',
          username
        ]);

        let status = 'out';
        if (newQty > 0 && newQty <= minQuantityThreshold) {
          status = 'low';
        } else if (newQty > minQuantityThreshold) {
          status = 'in';
        }

        // Update inventory_items
        await conn.query(updateInventorySql, [newQty, status, invId, tenantId]);

        // if (newQty <= 0) {
        //   const [[recipeCheck]] = await conn.query(
        //     `SELECT quantity
        //      FROM menu_item_recipes
        //      WHERE inventory_item_id = ? AND variant_id = 0 AND addon_id = 0 AND tenant_id = ?`,
        //     [invId, tenantId]
        //   );

        //   if ((recipeCheck && newQty < parseFloat(recipeCheck.quantity)) || newQty <= 0) {
        //     const [menuItemsToDisable] = await conn.query(
        //       `SELECT DISTINCT mi.id
        //        FROM menu_items mi
        //        JOIN menu_item_recipes mir ON mi.id = mir.menu_item_id
        //        WHERE mir.inventory_item_id = ?
        //          AND mir.variant_id = 0
        //          AND mir.addon_id = 0
        //          AND mi.tenant_id = ?`,
        //       [invId, tenantId]
        //     );

        //     if (menuItemsToDisable.length > 0) {
        //       const menuItemIds = menuItemsToDisable.map(row => row.id);
        //       if (menuItemIds.length > 0) {
        //         await conn.query(
        //           `UPDATE menu_items
        //            SET is_enabled = 0
        //            WHERE tenant_id = ? AND id IN (?)`,
        //           [tenantId, menuItemIds]
        //         );
        //       }
        //     }
        //   }
        // }
      }

    // step 7: commit transaction / if any exception occurs then rollback
    await conn.commit();

    return {
      tokenNo,
      orderId
    }
  } catch (error) {
    console.error(error);
    await conn.rollback();
    throw error;
  } finally {
    conn.end();
  }
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
