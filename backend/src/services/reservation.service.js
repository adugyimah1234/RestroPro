const { Reservation, Customer, StoreTable, sequelize, Op } = require("../models");

exports.addReservationDB = async (customerId, date, tableId, status, notes, peopleCount, uniqueCode, tenantId) => {
    try {
        const reservation = await Reservation.create({
            customer_id: customerId,
            date: date,
            table_id: tableId,
            status: status,
            notes: notes,
            people_count: peopleCount,
            unique_code: uniqueCode,
            tenant_id: tenantId,
        });
        return reservation.id;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.updateReservationDB = async (reservationId, date, tableId, status, notes, peopleCount, tenantId) => {
    try {
        await Reservation.update(
            {
                date: date,
                table_id: tableId,
                status: status,
                notes: notes,
                people_count: peopleCount,
                updated_at: new Date(),
            },
            {
                where: { id: reservationId, tenant_id: tenantId }
            }
        );
        return;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.cancelReservationDB = async (reservationId, status, tenantId) => {
    try {
        await Reservation.update(
            { status: status },
            { where: { id: reservationId, tenant_id: tenantId } }
        );
        return;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.deleteReservationDB = async (reservationId, tenantId) => {
    try {
        await Reservation.destroy({
            where: { id: reservationId, tenant_id: tenantId }
        });
        return;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.searchReservationsDB = async (search, tenant_id) => {
    try {
        const reservations = await Reservation.findAll({
            where: {
                tenant_id: tenant_id,
                [Op.or]: [
                    { id: search },
                    { customer_id: search },
                    { unique_code: search }
                ]
            },
            include: [
                {
                    model: Customer,
                    as: 'Customer', // Alias for Customer model
                    attributes: ['name'],
                    where: { tenant_id: tenant_id }, // Ensure customer belongs to the same tenant
                    required: true // INNER JOIN
                },
                {
                    model: StoreTable,
                    as: 'StoreTable', // Alias for StoreTable model
                    attributes: ['table_title'],
                    required: false // LEFT JOIN
                }
            ],
            attributes: [
                'id',
                'customer_id',
                [sequelize.col('Customer.name'), 'customer_name'], // Access aliased customer name
                'date',
                'table_id',
                [sequelize.col('StoreTable.table_title'), 'table_title'], // Access aliased table title
                'status',
                'notes',
                'people_count',
                'unique_code',
                'created_at',
                'updated_at'
            ],
            order: [['created_at', 'DESC']],
            limit: 20,
        });

        return reservations;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.getReservationsDB = async (type, from, to, tenantId) => {
    try {
        const { where } = getFilterConditionForReservationSearch(type, from, to, tenantId);

        const reservations = await Reservation.findAll({
            where: where,
            include: [
                {
                    model: Customer,
                    as: 'Customer',
                    attributes: ['name'],
                    where: { tenant_id: tenantId },
                    required: true
                },
                {
                    model: StoreTable,
                    as: 'StoreTable',
                    attributes: ['table_title'],
                    required: false
                }
            ],
            attributes: [
                'id',
                'customer_id',
                [sequelize.col('Customer.name'), 'customer_name'],
                'date',
                'table_id',
                [sequelize.col('StoreTable.table_title'), 'table_title'],
                'status',
                'notes',
                'people_count',
                'unique_code',
                'created_at',
                'updated_at'
            ],
            order: [['created_at', 'DESC']]
        });

        return reservations;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const getFilterConditionForReservationSearch = (type, from, to, tenantId) => {
    let where = { tenant_id: tenantId };
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (type) {
        case 'custom': {
            where.date = {
                [Op.between]: [new Date(from), new Date(to)]
            };
            break;
        }
        case 'today': {
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            where.date = {
                [Op.gte]: today,
                [Op.lt]: tomorrow
            };
            break;
        }
        case 'this_month': {
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
            where.date = {
                [Op.gte]: startOfMonth,
                [Op.lte]: endOfMonth
            };
            break;
        }
        case 'last_month': {
            const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);
            where.date = {
                [Op.gte]: startOfLastMonth,
                [Op.lte]: endOfLastMonth
            };
            break;
        }
        case 'last_7days': {
            const sevenDaysAgo = new Date(today);
            sevenDaysAgo.setDate(today.getDate() - 7);
            where.date = {
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
            where.date = {
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
            where.date = {
                [Op.gte]: tomorrow,
                [Op.lt]: endOfTomorrow
            };
            break;
        }
    }

    return { where };
}
