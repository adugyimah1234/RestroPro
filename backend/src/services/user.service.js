const { User, RefreshToken, Op, Tenant } = require("../models");


exports.getUserDB = async (username, tenantId) => {
    try {
        if (!tenantId) return null;
        const user = await User.findOne({
            where: { username: username, tenant_id: tenantId },
            include: [{
                model: Tenant,
                attributes: ['is_active']
            }]
        });

        if (!user) return null;

        const userObj = user.toJSON();
        userObj.is_active = user.Tenant ? user.Tenant.is_active : null;
        return userObj;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.getAllUsersDB = async (tenantId) => {
    try {
        const users = await User.findAll({
            where: { tenant_id: tenantId },
            attributes: ['username', 'name', 'role', 'photo', 'designation', 'phone', 'email', 'scope'],
            order: [['role', 'ASC'], ['name', 'ASC']]
        });
        return users;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.doUserExistDB = async (username) => {
    try {
        const user = await User.findOne({
            where: { username: username },
            attributes: ['username']
        });
        return !!user;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.addUserDB = async (tenantId, username, encryptedPassword, name, role, photo, designation, phone, email, scope) => {
    try {
        await User.create({
            username: username,
            password: encryptedPassword,
            name: name,
            role: role,
            photo: photo,
            designation: designation,
            phone: phone,
            email: email,
            scope: scope,
            tenant_id: tenantId
        });
        return;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.deleteUserDB = async (username, tenantId) => {
    try {
        await RefreshToken.destroy({
            where: { username: username, tenant_id: tenantId }
        });
        await User.destroy({
            where: { username: username, tenant_id: tenantId }
        });
        return;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.deleteUserRefreshTokensDB = async (username, tenantId) => {
    try {
        await RefreshToken.destroy({
            where: { username: username, tenant_id: tenantId }
        });
        return;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.updateUserDB = async (username, name, photo, designation, phone, email, scope, tenantId) => {
    try {
        await User.update(
            {
                name: name,
                photo: photo,
                designation: designation,
                phone: phone,
                email: email,
                scope: scope
            },
            {
                where: { username: username, tenant_id: tenantId }
            }
        );
        return;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.updateUserPasswordDB = async (username, password, tenantId) => {
    try {
        await User.update(
            {
                password: password
            },
            {
                where: { username: username, tenant_id: tenantId }
            }
        );
        return;
    } catch (error) {
        console.error(error);
        throw error;
    }
};