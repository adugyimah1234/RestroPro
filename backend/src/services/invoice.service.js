const { Op } = require('sequelize');
const {
  Invoice,
  Order,
  OrderItem,
  Customer,
  StoreTable,
  MenuItem,
  MenuItemVariant,
  MenuItemAddon,
  Tax,
} = require('../models');

function dateRange(type, from, to) {
  const now = new Date();
  const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const start = startOfDay(now);
  const nextDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

  switch (type) {
    case 'custom': {
      const startDate = new Date(`${from}T00:00:00`);
      const endDate = new Date(`${to}T00:00:00`);
      if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || startDate > endDate) {
        throw new RangeError('Invalid invoice date range.');
      }
      return { [Op.gte]: startDate, [Op.lt]: nextDay(endDate) };
    }
    case 'today':
      return { [Op.gte]: start, [Op.lt]: nextDay(start) };
    case 'this_month':
      return {
        [Op.gte]: new Date(now.getFullYear(), now.getMonth(), 1),
        [Op.lt]: new Date(now.getFullYear(), now.getMonth() + 1, 1),
      };
    case 'last_month':
      return {
        [Op.gte]: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        [Op.lt]: new Date(now.getFullYear(), now.getMonth(), 1),
      };
    case 'last_7days': {
      const sevenDaysAgo = new Date(start);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return { [Op.gte]: sevenDaysAgo, [Op.lt]: nextDay(start) };
    }
    case 'yesterday': {
      const yesterday = new Date(start);
      yesterday.setDate(yesterday.getDate() - 1);
      return { [Op.gte]: yesterday, [Op.lt]: start };
    }
    case 'tomorrow': {
      const tomorrow = nextDay(start);
      return { [Op.gte]: tomorrow, [Op.lt]: nextDay(tomorrow) };
    }
    default:
      return undefined;
  }
}

function flattenInvoiceOrder(order) {
  const row = order.get({ plain: true });
  const invoice = row.InvoiceRecord || {};
  const customer = row.Customer || {};
  const table = row.StoreTable || {};

  return {
    invoice_id: row.invoice_id,
    order_id: row.id,
    created_at: invoice.created_at,
    sub_total: invoice.sub_total,
    tax_total: invoice.tax_total,
    service_charge_total: invoice.service_charge_total,
    total: invoice.total,
    table_id: row.table_id,
    table_title: table.table_title,
    floor: table.floor,
    payment_status: row.payment_status,
    token_no: row.token_no,
    delivery_type: row.delivery_type,
    customer_type: row.customer_type,
    customer_id: row.customer_id,
    name: customer.name,
    email: customer.email,
    payment_type_id: invoice.payment_type_id,
  };
}

async function findInvoiceOrderRows({ tenantId, invoiceWhere, orderWhere = {}, limit }) {
  const orders = await Order.findAll({
    where: { tenant_id: tenantId, invoice_id: { [Op.ne]: null }, ...orderWhere },
    include: [
      {
        model: Invoice,
        as: 'InvoiceRecord',
        attributes: ['id', 'created_at', 'sub_total', 'tax_total', 'service_charge_total', 'total', 'payment_type_id'],
        where: { tenant_id: tenantId, ...invoiceWhere },
        required: true,
      },
      {
        model: Customer,
        as: 'Customer',
        attributes: ['name', 'email'],
        where: { tenant_id: tenantId },
        required: false,
      },
      {
        model: StoreTable,
        as: 'StoreTable',
        attributes: ['table_title', 'floor'],
        required: false,
      },
    ],
    attributes: [
      'id',
      'invoice_id',
      'table_id',
      'payment_status',
      'token_no',
      'delivery_type',
      'customer_type',
      'customer_id',
    ],
    order: [[{ model: Invoice, as: 'InvoiceRecord' }, 'created_at', 'DESC']],
    ...(limit ? { limit } : {}),
  });

  return orders.map(flattenInvoiceOrder);
}

exports.getInvoicesDB = async (type, from, to, tenantId) => {
  const createdAt = dateRange(type, from, to);
  return findInvoiceOrderRows({
    tenantId,
    invoiceWhere: createdAt ? { created_at: createdAt } : {},
  });
};

exports.searchInvoicesDB = async (search, tenantId) => {
  return findInvoiceOrderRows({
    tenantId,
    invoiceWhere: {},
    orderWhere: {
      [Op.or]: [
        { invoice_id: search },
        { id: search },
        { customer_id: { [Op.like]: `${search}%` } },
        { '$Customer.name$': { [Op.like]: `%${search}%` } },
      ],
    },
    limit: 20,
  });
};

exports.getInvoiceOrdersDB = async (orderIds, tenantId, invoiceId) => {
  const kitchenOrders = await Order.findAll({
    where: {
      id: { [Op.in]: orderIds },
      tenant_id: tenantId,
      invoice_id: invoiceId,
      status: { [Op.ne]: 'cancelled' },
    },
    include: [
      {
        model: Customer,
        as: 'Customer',
        attributes: [['name', 'customer_name']],
        where: { tenant_id: tenantId },
        required: false,
      },
      {
        model: StoreTable,
        as: 'StoreTable',
        attributes: [['table_title', 'table_title'], ['floor', 'floor']],
        required: false,
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

  const orderIdsFound = kitchenOrders.map((order) => order.id);
  if (orderIdsFound.length === 0) {
    return { kitchenOrders: [], kitchenOrdersItems: [], addons: [] };
  }

  const kitchenOrdersItems = await OrderItem.findAll({
    where: {
      order_id: { [Op.in]: orderIdsFound },
      tenant_id: tenantId,
      status: { [Op.ne]: 'cancelled' },
    },
    include: [
      {
        model: MenuItem,
        as: 'MenuItem',
        attributes: [['title', 'item_title'], 'price', 'tax_id'],
        required: false,
        include: [
          {
            model: Tax,
            as: 'Tax',
            attributes: [['title', 'tax_title'], ['rate', 'tax_rate'], ['type', 'tax_type']],
            required: false,
          },
        ],
      },
      {
        model: MenuItemVariant,
        as: 'MenuItemVariant',
        attributes: [['title', 'variant_title'], ['price', 'variant_price']],
        required: false,
      },
    ],
    attributes: ['id', 'order_id', 'item_id', 'variant_id', 'price', 'quantity', 'status', 'date', 'addons', 'notes'],
  });

  const addonIds = [...new Set(kitchenOrdersItems.flatMap((item) => {
    if (!item.addons) return [];
    const value = typeof item.addons === 'string' ? JSON.parse(item.addons) : item.addons;
    return Array.isArray(value) ? value.map(Number).filter(Number.isInteger) : [];
  }))];
  const addons = addonIds.length
    ? await MenuItemAddon.findAll({
      where: { id: { [Op.in]: addonIds }, tenant_id: tenantId },
      attributes: ['id', 'item_id', 'title', 'price'],
    })
    : [];

  return {
    kitchenOrders: kitchenOrders.map((order) => {
      const row = order.get({ plain: true });
      return {
        ...row,
        customer_name: row.Customer?.customer_name,
        table_title: row.StoreTable?.table_title,
        floor: row.StoreTable?.floor,
      };
    }),
    kitchenOrdersItems: kitchenOrdersItems.map((item) => {
      const row = item.get({ plain: true });
      const menuItem = row.MenuItem || {};
      const tax = menuItem.Tax || {};
      const variant = row.MenuItemVariant || {};
      const itemAddonIds = row.addons
        ? (typeof row.addons === 'string' ? JSON.parse(row.addons) : row.addons)
          .map(Number)
          .filter(Number.isInteger)
        : [];

      return {
        ...row,
        item_title: menuItem.item_title,
        variant_title: variant.variant_title,
        variant_price: variant.variant_price,
        price: row.price ?? menuItem.price,
        tax_title: tax.tax_title,
        tax_rate: tax.tax_rate,
        tax_type: tax.tax_type,
        addons: addons.filter((addon) => itemAddonIds.includes(addon.id)),
      };
    }),
    addons: addons.map((addon) => addon.get({ plain: true })),
  };
};

exports.getInvoiceByIdDB = async (id, tenantId) => {
  return Invoice.findOne({
    where: { id, tenant_id: tenantId },
    attributes: ['id', 'created_at', 'sub_total', 'tax_total', 'service_charge_total', 'total', 'payment_type_id'],
    raw: true,
  });
};
