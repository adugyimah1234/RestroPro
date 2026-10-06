const bcrypt = require("bcrypt");
const { Op } = require('sequelize');
const { CONFIG } = require("../config");
const { Superadmin, User, Tenant, Order, Invoice, StoreDetails, ExchangeRate, SubscriptionHistory, MenuItem, OrderItem, Customer, sequelize } = require("../models");


exports.signInDB = async (username, password) => {
    try {
        const user = await Superadmin.findOne({
            where: { email: username },
        });

        if (!user) {
            return null;
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (passwordMatch) {
            return user;
        } else {
            return null;
        }

    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.getAdminUserDB = async (username) => {
    try {
        if (!username) return null;
        const user = await Superadmin.findOne({
            where: { email: username },
        });
        return user;
    } catch (error) {
        console.error(error);
        throw error;
    }
};


exports.getOrdersProcessedTodayDB = async() => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today

        const orders = await Order.count({
            where: {
                date: {
                    [Op.gte]: today
                }
            }
        });
        return orders;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

exports.getSalesVolumeTodayDB = async() => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today

        const result = await Invoice.findOne({
            attributes: [
                [sequelize.fn('IFNULL', sequelize.fn('SUM', sequelize.literal('Invoice.total * `Tenant->StoreDetail->ExchangeRate`.rate_to_usd')), 0), 'sales_volume_today']
            ],
            where: {
                created_at: {
                    [Op.gte]: today
                }
            },
            include: [{
                model: Tenant,
                attributes: [],
                include: [{
                    model: StoreDetails,
                    as: 'StoreDetail',
                    attributes: [],
                    include: [{
                        model: ExchangeRate,
                        attributes: []
                    }]
                }]
            }],
            raw: true,
        });

        return result ? result.sales_volume_today : 0;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

exports.getMRRValueDB = async() => {
    try {
        const activeTenants = await Tenant.count({
            where: {
                is_active: true
            }
        });
        return activeTenants;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

exports.getARRValueDB = async() => {
    try {
        const activeTenants = await Tenant.count({
            where: {
                is_active: true
            }
        });
        return activeTenants;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

exports.getActiveTenantsDB = async() => {
    try {
        const activeTenants = await Tenant.count({
            where: {
                is_active: true
            }
        });
        return activeTenants;
    } catch (error) {
        console.error(error);
        throw error;
    }
}


exports.getInActiveTenantsDB = async() => {
    try {
        const inactiveTenants = await Tenant.count({
            where: {
                is_active: false
            }
        });
        return inactiveTenants;
    } catch (error) {
        console.error(error);
        throw error;
    }
}
exports.getAllTenantsDB = async() => {
    try {
        const allTenants = await Tenant.count();
        return allTenants;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

exports.getTenantSubscriptionHistoryDB = async(tenantId) => {
    try {
        const history = await SubscriptionHistory.findAll({
            where: { tenant_id: tenantId },
            attributes: ['id', 'tenant_id', 'created_at', 'starts_on', 'expires_on', 'status'],
            order: [['created_at', 'DESC']]
        });
        return history;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

exports.getTenantTotalUsersDB = async(tenantId) => {
    try {
        const totalUsers = await User.count({
            where: { tenant_id: tenantId }
        });
        return totalUsers;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

exports.getTenantDetailsDB = async(tenantId) => {
    try {
        const tenant = await Tenant.findOne({
            where: { id: tenantId },
            attributes: ['id', 'name', 'is_active', 'created_at', 'subscription_id', 'payment_customer_id', 'subscription_start', 'subscription_end']
        });
        return tenant;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

exports.getTenantStoreDetailsDB = async(tenantId) => {
    try {
        const storeDetails = await StoreDetails.findOne({
            where: { tenant_id: tenantId },
            attributes: ['tenant_id', 'store_name', 'address', 'phone', 'email', 'currency', 'is_qr_menu_enabled', 'unique_qr_code']
        });
        return storeDetails;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

exports.getTenantsDB = async (page, perPage, search, status, type , from , to) => {
    try {
        const currentPage = parseInt(page) || 1;
        const limit = parseInt(perPage) || 5;
        const offset = (currentPage - 1) * limit;
        let whereCondition = {};
        let includeCondition = [{
            model: User,
            as: 'adminUser', // Alias for the included User model
            attributes: ['username'],
            where: { role: 'admin' },
            required: false // LEFT JOIN
        }];

        if (status === 'active') {
            whereCondition.is_active = true;
        } else if (status === 'inactive') {
            whereCondition.is_active = false;
        }

        if (search) {
            whereCondition[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { '$adminUser.username$': { [Op.like]: `%${search}%` } } // Search in associated user's username
            ];
        }

        const { filter } = getFilterConditionForTenants('Tenant.created_at', type, from, to); // Note: field needs to be fully qualified for Sequelize

        if (Object.keys(filter).length > 0) {
            whereCondition.created_at = filter; // Assuming filter returns a Sequelize-compatible where clause
        }

        const { count, rows: tenants } = await Tenant.findAndCountAll({
            where: whereCondition,
            include: includeCondition,
            limit: limit,
            offset: offset,
            order: [['id', 'DESC']],
            subQuery: false // Important for correct pagination with includes
        });

        const response = {
            tenants: tenants.map(tenant => ({
                ...tenant.toJSON(),
                email: tenant.adminUser ? tenant.adminUser.username : null // Flatten email from associated user
            })),
            currentPage: currentPage,
            perPage: limit,
            totalPages: Math.ceil(count / limit),
            totalTenants: count
        };

        return response;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const getFilterConditionForTenants = (field, type, from, to) => {
    let filter = {};

    switch (type) {
        case 'custom': {
            filter = {
                [Op.between]: [from, to]
            };
            break;
        }
        case 'today': {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            filter = {
                [Op.gte]: today,
                [Op.lt]: tomorrow
            };
            break;
        }
        case 'this_month': {
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);
            const endOfMonth = new Date(startOfMonth);
            endOfMonth.setMonth(endOfMonth.getMonth() + 1);
            endOfMonth.setDate(0); // Last day of the month
            endOfMonth.setHours(23, 59, 59, 999);
            filter = {
                [Op.gte]: startOfMonth,
                [Op.lte]: endOfMonth
            };
            break;
        }
        case 'last_month': {
            const startOfLastMonth = new Date();
            startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);
            startOfLastMonth.setDate(1);
            startOfLastMonth.setHours(0, 0, 0, 0);
            const endOfLastMonth = new Date(startOfLastMonth);
            endOfLastMonth.setMonth(endOfLastMonth.getMonth() + 1);
            endOfLastMonth.setDate(0); // Last day of the month
            endOfLastMonth.setHours(23, 59, 59, 999);
            filter = {
                [Op.gte]: startOfLastMonth,
                [Op.lte]: endOfLastMonth
            };
            break;
        }
        case 'last_7days': {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            sevenDaysAgo.setHours(0, 0, 0, 0);
            const today = new Date();
            today.setHours(23, 59, 59, 999);
            filter = {
                [Op.gte]: sevenDaysAgo,
                [Op.lte]: today
            };
            break;
        }
        case 'yesterday': {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            yesterday.setHours(0, 0, 0, 0);
            const endOfYesterday = new Date(yesterday);
            endOfYesterday.setHours(23, 59, 59, 999);
            filter = {
                [Op.gte]: yesterday,
                [Op.lte]: endOfYesterday
            };
            break;
        }
        case 'tomorrow': {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            const endOfTomorrow = new Date(tomorrow);
            endOfTomorrow.setHours(23, 59, 59, 999);
            filter = {
                [Op.gte]: tomorrow,
                [Op.lt]: endOfTomorrow
            };
            break;
        }
        default: {
            filter = {};
        }
    }

    return { filter };
}


exports.addTenantDB = async ({ name, email, password, isAdmin , isActive }) => {
    let t;
    try {
        t = await sequelize.transaction(); // Start a transaction

        const tenant = await Tenant.create(
            { name: name, is_active: isActive ? 1 : 0 },
            { transaction: t }
        );

        const userExist = await User.findOne({ where: { username: email }, transaction: t });
        if(userExist) {
            throw new Error("User already exist! Try Different Email!");
        }

        const encryptedPassword = await bcrypt.hash(password, CONFIG.PASSWORD_SALT);

        const role = isAdmin ? 'admin' : 'user';

        await User.create(
            { username: email, password: encryptedPassword, name: name, role: role, tenant_id: tenant.id },
            { transaction: t }
        );

        await t.commit(); // Commit the transaction

        return { tenantId: tenant.id, name, isActive , role};
    } catch (error) {
        if (t) await t.rollback(); // Rollback on error
        console.error(error);
        throw error;
    }
};

exports.getTenantCntByIdDB = async (tenantId) => {
    try {
        const count = await Tenant.count({
            where: { id: tenantId }
        });
        return count || null;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

exports.getTenantDetailsByIdDB = async (tenantId) => {
    try {
        const tenant = await Tenant.findOne({
            where: { id: tenantId },
            include: [{
                model: User,
                attributes: ['username'],
                where: { role: 'admin' }
            }]
        });

        if (!tenant) {
            return null;
        }

        const tenantDetails = {
            is_active: tenant.is_active,
            username: tenant.User ? tenant.User.username : null
        };
        return tenantDetails;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

exports.updateTenantDB = async(tenantId , name , email , isActive, existingEmail) => {
    let t;
    try {
        t = await sequelize.transaction(); // Start a transaction

        await Tenant.update(
            { is_active: isActive, name: name },
            { where: { id: tenantId }, transaction: t }
        );

        const currentUser = await User.findOne({ where: { tenant_id: tenantId, role: 'admin' }, transaction: t });

        if (currentUser) {
            if (currentUser.name !== name) {
                await User.update(
                    { name: name },
                    { where: { id: currentUser.id }, transaction: t }
                );
            }

            if (currentUser.username !== email) {
                await User.update(
                    { username: email },
                    { where: { id: currentUser.id }, transaction: t }
                );
            }
        }
        // If no admin user, just update tenant

        await t.commit(); // Commit the transaction
        return;
    } catch (error) {
        if (t) await t.rollback(); // Rollback on error
        console.error('Error updating tenant:', error);
        throw error;
    }
}

exports.logoutAllUsersOfTenantDB = async (tenantId) => {
    try {
        await RefreshToken.destroy({
            where: { tenant_id: tenantId }
        });
    } catch (error) {
        console.error('Error logging out all users:', error);
        throw error;
    }
};

exports.deleteTenantDB = async (tenantId) => {
    try {
        await Tenant.destroy({
            where: { id: tenantId }
        });
    } catch (error) {
        console.error('Error deleting tenant : ', error);
        throw error;
    }
}

exports.getRestaurantsTotalCustomersDB = async() => {
    try {
        const totalCustomers = await Customer.count();
        return totalCustomers;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

exports.getTenantsDataByStatusDB = async (is_active) => {
    try {
        let whereCondition = {};
        let includeCondition = [{
            model: User,
            as: 'adminUser',
            attributes: ['username'],
            where: { role: 'admin' },
            required: false
        }];

        if (is_active != null) {
            whereCondition.is_active = is_active;
        }

        const tenants = await Tenant.findAll({
            where: whereCondition,
            include: includeCondition,
        });

        return tenants.map(tenant => ({
            ...tenant.toJSON(),
            email: tenant.adminUser ? tenant.adminUser.username : null
        }));
    } catch (error) {
        console.error(error);
        throw error;
    }
}

exports.getSuperAdminTopSellingItemsDB = async(type, from, to) => {
    try {
        const { filter } = getFilterCondition('OrderItem.date', type, from, to);

        const result = await OrderItem.findAll({
            attributes: [
                'tenant_id',
                'item_id',
                [sequelize.fn('COUNT', sequelize.col('item_id')), 'qty']
            ],
            where: { date: filter },
            include: [{
                model: MenuItem,
                as: 'MenuItem',
                attributes: ['title']
            }, {
                model: Tenant,
                attributes: ['name']
            }],
            group: ['tenant_id', 'item_id', 'MenuItem.title', 'Tenant.name'],
            order: [[sequelize.literal('qty'), 'DESC']],
            limit: 50,
            raw: true,
        });

        return result.map(item => ({
            tenant_id: item.tenant_id,
            tenant_name: item['Tenant.name'],
            item_id: item.item_id,
            title: item['MenuItem.title'],
            qty: item.qty
        }));
    } catch (error) {
        console.error(error);
        throw error;
    }
}

exports.getSuperAdminSalesVolumeDB = async(type, from, to) => {
    try {
        const { filter } = getFilterCondition('Invoice.created_at', type, from, to);

        const result = await Invoice.findOne({
            attributes: [
                [sequelize.fn('IFNULL', sequelize.fn('SUM', sequelize.literal('Invoice.total * `Tenant->StoreDetail->ExchangeRate`.rate_to_usd')), 0), 'sales_volume_today']
            ],
            where: { created_at: filter },
            include: [{
                model: Tenant,
                attributes: [],
                include: [{
                    model: StoreDetails,
                    as: 'StoreDetail',
                    attributes: [],
                    include: [{
                        model: ExchangeRate,
                        attributes: []
                    }]
                }]
            }],
            raw: true,
        });

        return result ? result.sales_volume_today : 0;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

exports.getSuperAdminOrdersProcessedDB = async(type, from, to) => {
    try {
        const { filter } = getFilterCondition('Order.date', type, from, to);

        const orders = await Order.count({
            where: { date: filter }
        });
        return orders;
    } catch (error) {
        console.error(error);
        throw error;
    }
};


const getFilterCondition = (field, type, from, to) => {
    let filter = {};

    switch (type) {
        case 'custom': {
            filter = {
                [Op.between]: [from, to]
            };
            break;
        }
        case 'today': {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            filter = {
                [Op.gte]: today,
                [Op.lt]: tomorrow
            };
            break;
        }
        case 'this_month': {
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);
            const endOfMonth = new Date(startOfMonth);
            endOfMonth.setMonth(endOfMonth.getMonth() + 1);
            endOfMonth.setDate(0); // Last day of the month
            endOfMonth.setHours(23, 59, 59, 999);
            filter = {
                [Op.gte]: startOfMonth,
                [Op.lte]: endOfMonth
            };
            break;
        }
        case 'last_month': {
            const startOfLastMonth = new Date();
            startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);
            startOfLastMonth.setDate(1);
            startOfLastMonth.setHours(0, 0, 0, 0);
            const endOfLastMonth = new Date(startOfLastMonth);
            endOfLastMonth.setMonth(endOfLastMonth.getMonth() + 1);
            endOfLastMonth.setDate(0); // Last day of the month
            endOfLastMonth.setHours(23, 59, 59, 999);
            filter = {
                [Op.gte]: startOfLastMonth,
                [Op.lte]: endOfLastMonth
            };
            break;
        }
        case 'last_7days': {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            sevenDaysAgo.setHours(0, 0, 0, 0);
            const today = new Date();
            today.setHours(23, 59, 59, 999);
            filter = {
                [Op.gte]: sevenDaysAgo,
                [Op.lte]: today
            };
            break;
        }
        case 'yesterday': {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            yesterday.setHours(0, 0, 0, 0);
            const endOfYesterday = new Date(yesterday);
            endOfYesterday.setHours(23, 59, 59, 999);
            filter = {
                [Op.gte]: yesterday,
                [Op.lte]: endOfYesterday
            };
            break;
        }
        case 'tomorrow': {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            const endOfTomorrow = new Date(tomorrow);
            endOfTomorrow.setHours(23, 59, 59, 999);
            filter = {
                [Op.gte]: tomorrow,
                [Op.lt]: endOfTomorrow
            };
            break;
        }
        default: {
            filter = {};
        }
    }

    return { filter };
}

exports.updateTenantSubscriptionDB = async (tenantId, subscriptionId, paymentCustomerId, subscriptionStart, subscriptionEnd, isActive) => {
    try {
        await Tenant.update(
            {
                subscription_id: subscriptionId,
                payment_customer_id: paymentCustomerId,
                subscription_start: subscriptionStart,
                subscription_end: subscriptionEnd,
                is_active: isActive
            },
            {
                where: { id: tenantId }
            }
        );
        return;
    } catch (error) {
        console.error(error);
        throw error;
    }
};