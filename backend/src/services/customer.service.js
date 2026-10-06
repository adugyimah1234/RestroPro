const { Customer, sequelize, Op } = require("../models");
exports.doCustomerExistDB = async (phone, tenantId, branchId) => {
    try {
        const count = await Customer.count({
            where: { phone: phone, tenant_id: tenantId, branch_id: branchId }
        });
        return count > 0;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.addCustomerDB = async (phone, name, email, birthDate, gender, isMember, tenantId, branchId) => {
    try {
        const customer = await Customer.create({
            phone: phone,
            name: name,
            email: email,
            birth_date: birthDate,
            gender: gender,
            is_member: isMember,
            tenant_id: tenantId,
            branch_id: branchId
        });
        return customer.id;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.getCustomersDB = async(page, perPage, sort, filter, tenantId, branchId) => {
    try {
        const currentPage = parseInt(page) || 1;
        const limit = parseInt(perPage) || 10;
        const offset = (currentPage - 1) * limit;

        let order = [['created_at', 'DESC']];
        if (sort) {
            // Assuming sort is in format "columnName:direction" e.g., "name:ASC"
            const [column, direction] = sort.split(':');
            order = [[column, direction || 'ASC']];
        }

        let whereCondition = { tenant_id: tenantId, branch_id: branchId };
        if (filter) {
            whereCondition = {
                ...whereCondition,
                [Op.or]: [
                    { name: { [Op.like]: `${filter}%` } },
                    { phone: filter }
                ]
            };
        }

        const { count, rows: customers } = await Customer.findAndCountAll({
            where: whereCondition,
            attributes: ['phone', 'name', 'email', 'birth_date', 'gender', 'is_member', 'created_at'],
            order: order,
            limit: limit,
            offset: offset,
        });

        const response = {
            customers,
            currentPage,
            perPage,
            totalPages: Math.ceil(count / limit),
            totalCustomers: count
        };

        return response;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

exports.getAllCustomersDB = async(tenantId, branchId) => {
    try {
        const customers = await Customer.findAll({
            where: { tenant_id: tenantId, branch_id: branchId },
            attributes: ['phone', 'name', 'email', 'birth_date', 'gender', 'is_member', 'created_at'],
            order: [['created_at', 'DESC']]
        });
        return customers;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

exports.uploadBulkCustomersDB = async(customers, branchId) => {
    try {
        await Customer.bulkCreate(customers.map(customer => ({...customer, branch_id: branchId})), {
            updateOnDuplicate: ['name', 'email', 'birth_date', 'gender']
        });
        return;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.getCustomerDB = async(phone, tenantId, branchId) => {
    try {
        const customer = await Customer.findOne({
            where: { phone: phone, tenant_id: tenantId, branch_id: branchId },
            attributes: ['phone', 'name', 'email', 'birth_date', 'gender', 'is_member', 'created_at']
        });
        return customer;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

exports.searchCustomerDB = async(searchString, tenantId, branchId) => {
    try {
        const customers = await Customer.findAll({
            where: {
                [Op.or]: [
                    { phone: { [Op.like]: `${searchString}%` } },
                    { name: { [Op.like]: `%${searchString}%` } }
                ],
                tenant_id: tenantId,
                branch_id: branchId
            },
            attributes: ['phone', 'name', 'email', 'birth_date', 'gender', 'is_member', 'created_at'],
            limit: 10
        });
        return customers;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

exports.updateCustomerDB = async (phone, name, email, birthDate, gender, tenantId, branchId) => {
    try {
        await Customer.update(
            { name: name, email: email, birth_date: birthDate, gender: gender },
            { where: { phone: phone, tenant_id: tenantId, branch_id: branchId } }
        );
        return;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.deleteCustomerDB = async (phone, tenantId, branchId) => {
    try {
        await Customer.destroy({
            where: { phone: phone, tenant_id: tenantId, branch_id: branchId }
        });
        return;
    } catch (error) {
        console.error(error);
        throw error;
    }
};
