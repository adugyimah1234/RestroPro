const { Order, OrderItem, MenuItem, MenuItemVariant, Customer, StoreTable, MenuItemAddon, sequelize, Op } = require("../models");

exports.getKitchenOrdersDB = async (tenantId) => {
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
            attributes: [['title', 'item_title']],
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

exports.updateOrderItemStatusDB = async (orderItemId, status) => {
  try {
    await OrderItem.update(
      { status: status },
      { where: { id: orderItemId } }
    );
    return;
} catch (error) {
    console.error(error);
    throw error;
}
};