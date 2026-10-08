const { CONFIG } = require("../config");
const { Order, OrderItem, MenuItem, MenuItemVariant, Customer, StoreTable, MenuItemAddon, Tax, Invoice, InvoiceSequence, Tenant, sequelize, Op } = require("../models");
const { recordInvoice, writeActivity } = require("./accountability.service");

exports.getOrdersDB = async (tenantId, branchId) => {
  try {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const oneDayFromNow = new Date();
    oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);

    const kitchenOrders = await Order.findAll({
      where: {
        date: {
          [Op.gte]: oneDayAgo,
          [Op.lte]: oneDayFromNow,
        },
        status: { [Op.notIn]: ['completed', 'cancelled'] },
        tenant_id: tenantId,
        branch_id: branchId
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
        'token_no',
      ],
    });

    let kitchenOrdersItems = [];
    let addons = [];

    if (kitchenOrders.length > 0) {
      const orderIds = kitchenOrders.map((o) => o.id);
      kitchenOrdersItems = await OrderItem.findAll({
        where: {
          order_id: { [Op.in]: orderIds },
        },
        include: [
          {
            model: MenuItem,
            as: 'MenuItem',
            attributes: [['title', 'item_title'], 'price'],
            required: false, // LEFT JOIN
          },
          {
            model: MenuItemVariant,
            as: 'MenuItemVariant',
            attributes: [['title', 'variant_title']],
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
          attributes: ['id', 'item_id', 'title', 'price'],
        });
      }
    }

    return {
      kitchenOrders: kitchenOrders.map(order => order.get({ plain: true })),
      kitchenOrdersItems: kitchenOrdersItems.map(item => item.get({ plain: true })),
      addons: addons.map(addon => addon.get({ plain: true })),
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.updateOrderItemStatusDB = async (orderItemId, status, tenantId, branchId) => {
  try {
    const orderItem = await OrderItem.findOne({
      where: { id: orderItemId, tenant_id: tenantId },
      attributes: ['id', 'order_id', 'status'],
    });
    if (!orderItem) return false;

    const parentOrder = await Order.findOne({
      where: {
        id: orderItem.order_id,
        tenant_id: tenantId,
        ...(branchId == null ? {} : { branch_id: branchId }),
      },
      attributes: ['id'],
    });
    if (!parentOrder) return false;
    if (orderItem.status === status) return true;

    const [updatedCount] = await OrderItem.update(
      { status },
      { where: { id: orderItem.id, tenant_id: tenantId } }
    );
    return updatedCount > 0;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.cancelOrderDB = async (orderIds, tenantId, branchId, actor = {}) => {
  try {
    return await sequelize.transaction(async (transaction) => {
      const [cancelledCount] = await Order.update(
        { status: 'cancelled' },
        {
          where: { id: { [Op.in]: orderIds }, tenant_id: tenantId, branch_id: branchId },
          transaction,
        }
      );
      if (cancelledCount > 0) {
        await writeActivity({
          tenant_id: tenantId,
          branch_id: branchId ?? null,
          actor_username: actor.username || null,
          actor_name: actor.name || actor.username || null,
          action: 'orders_cancelled',
          entity_type: 'order',
          details: { orderIds: orderIds.slice(0, 100), count: cancelledCount },
        }, transaction);
      }
      return cancelledCount;
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};


exports.completeOrderDB = async (orderIds, tenantId, branchId) => {
  try {
    await Order.update(
      { status: 'completed' },
      { where: { id: { [Op.in]: orderIds }, tenant_id: tenantId, branch_id: branchId } }
    );
    return;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.getInvoiceIdFromOrderIdsDB = async (orderIds, tenantId, branchId) => {
  try {
    const order = await Order.findOne({
      where: { id: { [Op.in]: orderIds }, tenant_id: tenantId, branch_id: branchId },
      attributes: [
        'customer_id',
        [sequelize.literal(`HEX(AES_ENCRYPT(HEX(invoice_id), '${CONFIG.ENCRYPTION_KEY}'))`), 'invoice_id']
      ],
    });
    return order;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.getEncryptedInvoiceIdDB = async (invoiceId, tenantId, branchId) => {
  try {
    const order = await Order.findOne({
      where: { invoice_id: invoiceId, tenant_id: tenantId, branch_id: branchId },
      attributes: [
        'customer_id',
        [sequelize.literal(`HEX(AES_ENCRYPT(HEX(invoice_id), '${CONFIG.ENCRYPTION_KEY}'))`), 'invoice_id']
      ],
    });
    return order;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.checkInvoiceIdDB = async (encryptedInvoiceId) => {
  try {
    const order = await Order.findOne({
      where: sequelize.literal(`AES_DECRYPT(UNHEX('${encryptedInvoiceId}'), '${CONFIG.ENCRYPTION_KEY}') = HEX(invoice_id)`),
      attributes: ['invoice_id', 'customer_id'],
    });
    return order;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.getOrdersPaymentSummaryDB = async (orderIdsToFindSummary, tenantId, branchId) => {
  try {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const oneDayFromNow = new Date();
    oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);

    const kitchenOrders = await Order.findAll({
      where: {
        date: {
          [Op.gte]: oneDayAgo,
          [Op.lte]: oneDayFromNow,
        },
        status: { [Op.notIn]: ['completed', 'cancelled'] },
        id: { [Op.in]: orderIdsToFindSummary },
        tenant_id: tenantId,
        branch_id: branchId
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
        'token_no',
      ],
    });

    let kitchenOrdersItems = [];
    let addons = [];

    if (kitchenOrders.length > 0) {
      const orderIds = kitchenOrders.map((o) => o.id);
      kitchenOrdersItems = await OrderItem.findAll({
        where: {
          order_id: { [Op.in]: orderIds },
          status: { [Op.ne]: 'cancelled' },
        },
        include: [
          {
            model: MenuItem,
            as: 'MenuItem',
            attributes: [['title', 'item_title'], 'price', 'tax_id'],
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
          attributes: ['id', 'item_id', 'title', 'price'],
        });
      }
    }

    return {
      kitchenOrders: kitchenOrders.map(order => order.get({ plain: true })),
      kitchenOrdersItems: kitchenOrdersItems.map(item => item.get({ plain: true })),
      addons: addons.map(addon => addon.get({ plain: true })),
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

exports.createInvoiceDB = async (subtotal, taxTotal, serviceChargeTotal, total, date, selectedPaymentType, tenantId, branchId, actor = {}) => {
  const t = await sequelize.transaction();
  try {
    const tenant = await Tenant.findByPk(tenantId, {
      attributes: ['id'],
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} was not found while creating an invoice.`);
    }

    let invoiceId = 0;

    const invoiceSequence = await InvoiceSequence.findOne({
      where: { tenant_id: tenantId },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (invoiceSequence) {
      invoiceId = Number(invoiceSequence.sequence_no);
    }
    invoiceId += 1;

    await Invoice.create({
      id: invoiceId,
      sub_total: subtotal,
      tax_total: taxTotal,
      service_charge_total: serviceChargeTotal,
      total: total,
      created_at: date,
      payment_type_id: selectedPaymentType,
      tenant_id: tenantId,
      branch_id: branchId ?? null,
      created_by: actor.username || null,
    }, { transaction: t });

    if (actor.username) {
      await recordInvoice({
        tenantId,
        branchId,
        username: actor.username,
        name: actor.name,
        invoiceId,
        paymentTypeId: selectedPaymentType,
      }, t);
    }

    await InvoiceSequence.upsert(
      {
        tenant_id: tenantId,
        sequence_no: invoiceId,
      },
      { transaction: t }
    );

    await t.commit();

    return invoiceId;
  } catch (error) {
    console.error(error);
    await t.rollback();
    throw error;
  }
}

exports.completeOrdersAndSaveInvoiceIdDB = async (orderIds, invoiceId, tenantId, branchId) => {
  try {
    await Order.update(
      { status: 'completed', payment_status: 'paid', invoice_id: invoiceId },
      { where: { id: { [Op.in]: orderIds }, tenant_id: tenantId, branch_id: branchId } }
    );
    return;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
