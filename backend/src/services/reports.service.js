const { Order, Customer, Invoice, PaymentType, MenuItem, OrderItem, sequelize, Op } = require("../models");

exports.getOrdersCountDB = async (type, from, to, tenantId) => {
    try {
        const { where: filterCondition } = getFilterCondition('date', type, from, to);

        const ordersCount = await Order.count({
            where: {
                tenant_id: tenantId,
                ...filterCondition,
            },
        });
        return ordersCount;
    } catch (error) {
        console.error(error);
        throw error;
    }
};


exports.getNewCustomerCountDB = async (type, from, to, tenantId) => {
    try {
        const { where: filterCondition } = getFilterCondition('created_at', type, from, to);

        const newCustomersCount = await Customer.count({
            where: {
                tenant_id: tenantId,
                ...filterCondition,
            },
        });
        return newCustomersCount;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.getRepeatCustomerCountDB = async (type, from, to, tenantId) => {
    try {
        const { where: filterCondition } = getFilterCondition('date', type, from, to);

        const repeatCustomersCount = await Order.count({
            distinct: true,
            col: 'customer_id',
            where: {
                tenant_id: tenantId,
                ...filterCondition,
                customer_type: 'CUSTOMER',
            },
        });
        return repeatCustomersCount;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.getAverageOrderValueDB = async (type, from, to, tenantId) => {
    try {
        const { where: filterCondition } = getFilterCondition('created_at', type, from, to);

        const result = await Invoice.findOne({
            attributes: [
                [sequelize.fn('AVG', sequelize.col('total')), 'avg_order_value']
            ],
            where: {
                tenant_id: tenantId,
                ...filterCondition,
            },
            raw: true,
        });
        return result?.avg_order_value;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.getTotalPaymentsByPaymentTypesDB = async (type, from, to, tenantId) => {
    try {
        const { where: filterCondition } = getFilterCondition('created_at', type, from, to);

        const payments = await Invoice.findAll({
            attributes: [
                'payment_type_id',
                [sequelize.col('PaymentType.title'), 'title'],
                [sequelize.fn('SUM', sequelize.col('total')), 'total']
            ],
            include: [
                {
                    model: PaymentType,
                    as: 'PaymentType', // Assuming Invoice belongsTo PaymentType
                    attributes: [],
                    required: true, // INNER JOIN
                }
            ],
            where: {
                tenant_id: tenantId,
                ...filterCondition,
            },
            group: ['payment_type_id', 'PaymentType.title'],
            raw: true,
        });
        return payments;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.getTotalCustomersDB = async (tenantId) => {
    try {
        const totalCustomers = await Customer.count({
            where: { tenant_id: tenantId },
        });
        return totalCustomers;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.getRevenueDB = async (type, from, to, tenantId) => {
    try {
        const { where: filterCondition } = getFilterCondition('created_at', type, from, to);

        const result = await Invoice.findOne({
            attributes: [
                [sequelize.fn('SUM', sequelize.col('total')), 'total_revenue']
            ],
            where: {
                tenant_id: tenantId,
                ...filterCondition,
            },
            raw: true,
        });
        return result?.total_revenue;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.getTotalTaxDB = async (type, from, to, tenantId) => {
    try {
        const { where: filterCondition } = getFilterCondition('created_at', type, from, to);

        const result = await Invoice.findOne({
            attributes: [
                [sequelize.fn('SUM', sequelize.col('tax_total')), 'total_tax']
            ],
            where: {
                tenant_id: tenantId,
                ...filterCondition,
            },
            raw: true,
        });
        return result?.total_tax;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.getTotalServiceChargeDB = async (type, from, to, tenantId) => {
    try {
        const { where: filterCondition } = getFilterCondition('created_at', type, from, to);

        const result = await Invoice.findOne({
            attributes: [
                [sequelize.fn('SUM', sequelize.col('service_charge_total')), 'total_service_charge']
            ],
            where: {
                tenant_id: tenantId,
                ...filterCondition,
            },
            raw: true,
        });
        return result?.total_service_charge;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.getTotalNetRevenueDB = async (type, from, to, tenantId) => {
    try {
        const { where: filterCondition } = getFilterCondition('created_at', type, from, to);

        const result = await Invoice.findOne({
            attributes: [
                [sequelize.fn('SUM', sequelize.col('sub_total')), 'total_net_revenue']
            ],
            where: {
                tenant_id: tenantId,
                ...filterCondition,
            },
            raw: true,
        });
        return result?.total_net_revenue;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.getTopSellingItemsDB = async (type, from, to, tenantId) => {
    try {
        const { where: filterCondition } = getFilterCondition('date', type, from, to);

        const topSellingItems = await OrderItem.findAll({
            attributes: [
                'item_id',
                [sequelize.fn('SUM', sequelize.col('quantity')), 'orders_count']
            ],
            where: {
                tenant_id: tenantId,
                status: { [Op.ne]: 'cancelled' },
                ...filterCondition,
            },
            group: ['item_id'],
            order: [[sequelize.literal('orders_count'), 'DESC']],
            include: [{
                model: MenuItem,
                as: 'MenuItem',
                attributes: ['title', 'price', 'image']
            }]
        });
        return topSellingItems;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const getFilterCondition = (field, type, from, to) => {
  let where = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  switch (type) {
      case 'custom': {
          where[field] = {
              [Op.between]: [new Date(from), new Date(to)]
          };
          break;
      }
      case 'today': {
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          where[field] = {
              [Op.gte]: today,
              [Op.lt]: tomorrow
          };
          break;
      }
      case 'this_month': {
          const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
          where[field] = {
              [Op.gte]: startOfMonth,
              [Op.lte]: endOfMonth
          };
          break;
      }
      case 'last_month': {
          const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);
          where[field] = {
              [Op.gte]: startOfLastMonth,
              [Op.lte]: endOfLastMonth
          };
          break;
      }
      case 'last_7days': {
          const sevenDaysAgo = new Date(today);
          sevenDaysAgo.setDate(today.getDate() - 7);
          where[field] = {
              [Op.gte]: sevenDaysAgo,
              [Op.lte]: today
          };
          break;
      }
      case 'yesterday': {
          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);
          const endOfYesterday = new Date(yesterday);
          endOfYesterday.setHours(23, 59, 59, 999);
          where[field] = {
              [Op.gte]: yesterday,
              [Op.lt]: endOfYesterday
          };
          break;
      }
      case 'tomorrow': {
          const tomorrow = new Date(today);
          tomorrow.setDate(today.getDate() + 1);
          const endOfTomorrow = new Date(tomorrow);
          endOfTomorrow.setHours(23, 59, 59, 999);
          where[field] = {
              [Op.gte]: tomorrow,
              [Op.lt]: endOfTomorrow
          };
          break;
      }
      default: {
          // No specific date filter
      }
  }

  return { where };
}
