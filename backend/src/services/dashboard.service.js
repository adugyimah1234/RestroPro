const { Order, Customer, MenuItem, OrderItem, sequelize, Op } = require("../models");

exports.getTodaysOrdersCountDB = async (tenantId, branchId) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todaysOrders = await Order.count({
            where: {
                date: {
                    [Op.gte]: today,
                    [Op.lt]: tomorrow,
                },
                tenant_id: tenantId,
                branch_id: branchId
            },
        });
        return todaysOrders;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.getTodaysNewCustomerCountDB = async (tenantId, branchId) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const newCustomersCount = await Customer.count({
            where: {
                created_at: {
                    [Op.gte]: today,
                    [Op.lt]: tomorrow,
                },
                tenant_id: tenantId,
                branch_id: branchId
            },
        });
        return newCustomersCount;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.getTodaysRepeatCustomerCountDB = async (tenantId, branchId) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todaysRepeatCustomers = await Order.count({
            distinct: true,
            col: 'customer_id',
            where: {
                date: {
                    [Op.gte]: today,
                    [Op.lt]: tomorrow,
                },
                customer_type: 'CUSTOMER',
                tenant_id: tenantId,
                branch_id: branchId
            },
        });

        return todaysRepeatCustomers;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.getTodaysTopSellingItemsDB = async (tenantId, branchId) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const topSellingItems = await OrderItem.findAll({
            attributes: [
                'item_id',
                [sequelize.fn('SUM', sequelize.col('quantity')), 'orders_count']
            ],
            where: {
                tenant_id: tenantId,
                branch_id: branchId,
                date: {
                    [Op.gte]: today,
                    [Op.lt]: tomorrow,
                },
                status: { [Op.ne]: 'cancelled' },
            },
            group: ['item_id'],
            order: [[sequelize.literal('orders_count'), 'DESC']],
            limit: 50,
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
