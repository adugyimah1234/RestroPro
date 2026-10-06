const bcrypt = require("bcrypt");
const { CONFIG } = require("../config/index");
const { RefreshToken, sequelize, User, Tenant, StoreDetails, ResetPasswordToken, SubscriptionHistory, Op } = require("../models");


exports.signInDB = async (username, password) => {
    try {
        const user = await User.findOne({
            where: { username: username },
            include: [{
                model: Tenant,
                attributes: ['is_active']
            }]
        });

        if (!user) {
            return null;
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (passwordMatch) {
            const userWithTenantStatus = {
                username: user.username,
                password: user.password,
                name: user.name,
                role: user.role,
                photo: user.photo,
                designation: user.designation,
                phone: user.phone,
                location: user.location,
                email: user.email,
                scope: user.scope || "",
                tenant_id: user.tenant_id,
                branch_id: user.branch_id !== undefined ? user.branch_id : null,
                is_active: user.Tenant ? user.Tenant.is_active : null
            };
            return userWithTenantStatus;
        } else {
            return null;
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
};

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

        if (!user) {
            return null;
        }

        const userWithTenantStatus = {
            username: user.username,
            name: user.name,
            role: user.role,
            photo: user.photo,
            designation: user.designation,
            phone: user.phone,
            location: user.location,
            email: user.email,
            scope: user.scope || "",
            tenant_id: user.tenant_id,
            branch_id: user.branch_id !== undefined ? user.branch_id : null,
            is_active: user.Tenant ? user.Tenant.is_active : null
        };
        return userWithTenantStatus;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.checkEmailExistsDB = async (email) => {
    try {
        const user = await User.findOne({
            where: { username: email },
            attributes: ['username']
        });

        return !!user;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.checkEmailExistsSuperadminDB = async (email, tenantId) => {
    try {
        const user = await User.findOne({
            where: {
                username: email,
                tenant_id: {
                    [Op.ne]: tenantId
                }
            },
            attributes: ['username']
        });

        return !!user;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.signUpDB = async (bizName, username, password, phone, location) => {
    try {
        const tenant = await Tenant.create({
            name: bizName,
            is_active: 0,
            subscription_id: null
        });

        await User.create({
            username: username,
            password: password,
            name: bizName,
            role: 'admin',
            phone: phone || null,
            location: location || null,
            tenant_id: tenant.id
        });

        try {
            await StoreDetails.create({
                tenant_id: tenant.id,
                store_name: bizName,
                address: location || null,
                phone: phone || null,
                email: username,
                currency: 'GHS'
            });
        } catch (stErr) {
            console.log("StoreDetails creation on signup note:", stErr.message);
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.addRefreshTokenDB = async (username, refreshToken, expiry, deviceIP, deviceName, deviceLocation, tenantId) => {
    try {
        const result = await RefreshToken.create({
            username: username,
            refresh_token: refreshToken,
            device_ip: deviceIP,
            device_name: deviceName,
            device_location: deviceLocation,
            expiry: expiry.toISOString(),
            tenant_id: tenantId
        });
        return result.id;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.removeRefreshTokenDB = async (username, refreshToken) => {
    try {
        await RefreshToken.destroy({
            where: {
                username: username,
                refresh_token: refreshToken
            }
        });
        await RefreshToken.destroy({
            where: {
                username: username,
                expiry: {
                    [Op.lt]: new Date()
                }
            }
        });
        return;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.removeRefreshTokenByDeviceIdDB = async (username, deviceId) => {
    try {
        await RefreshToken.destroy({
            where: {
                username: username,
                device_id: deviceId
            }
        });
        await RefreshToken.destroy({
            where: {
                username: username,
                expiry: {
                    [Op.lt]: new Date()
                }
            }
        });
        return;
    } catch (error) {
        console.error(error);
        throw error;
    }
};


exports.getDevicesDB = async (username) => {
    try {
        const results = await RefreshToken.findAll({
            where: { username: username },
            attributes: ['device_id', 'refresh_token', 'device_ip', 'device_name', 'device_location', 'createdAt']
        });
        return results;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.verifyRefreshTokenDB = async (refreshToken) => {
    try {
        const result = await RefreshToken.findOne({
            where: { refresh_token: refreshToken },
            attributes: ['username', 'refresh_token']
        });
        return result;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.forgotPasswordDB = async (email, token, tokenValidity) => {
    try {
        await ResetPasswordToken.upsert({
            username: email,
            reset_token: token,
            expires_at: tokenValidity
        });
        return;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.deleteForgotPasswordTokenDB = async (token) => {
    try {
        await ResetPasswordToken.destroy({
            where: { reset_token: token }
        });
        return;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.checkForgotPasswordTokenDB = async (token, date) => {
    try {
        const result = await ResetPasswordToken.findOne({
            where: {
                reset_token: token,
                expires_at: {
                    [Op.gt]: date
                }
            },
            include: [{
                model: User,
                attributes: ['tenant_id']
            }],
            attributes: ['username', 'reset_token', 'expires_at']
        });

        if (!result) {
            return null;
        }

        const tokenDetails = {
            username: result.username,
            tenant_id: result.User ? result.User.tenant_id : null,
            reset_token: result.reset_token,
            expires_at: result.expires_at
        };
        return tokenDetails;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.getSubscriptionDetailsDB = async (tenantId) => {
    try {
        const results = await Tenant.findOne({
            where: { id: tenantId },
            attributes: ['id', 'is_active', 'subscription_id', 'payment_customer_id', 'subscription_start', 'subscription_end']
        });
        return results;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.updateTenantSubscriptionAccess = async (email, status, subscriptionId, paymentCustomerId, subscriptionStartTimestamp, subscriptionEndTimestamp) => {
    try {
        const user = await User.findOne({
            where: { username: email },
            attributes: ['tenant_id']
        });

        if (!user || !user.tenant_id) {
            throw new Error('User or tenant_id not found for the given email.');
        }

        await Tenant.update(
            {
                is_active: status,
                subscription_id: subscriptionId,
                payment_customer_id: paymentCustomerId,
                subscription_start: subscriptionStartTimestamp,
                subscription_end: subscriptionEndTimestamp
            },
            {
                where: { id: user.tenant_id }
            }
        );
        return;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.updateSubscriptionHistory = async (tenantId, starts_on , expires_on , status) => {
    try {
        await SubscriptionHistory.create({
            tenant_id: tenantId,
            created_at: new Date(),
            starts_on: starts_on,
            expires_on: expires_on,
            status: status
        });
        return;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

exports.getTenantIdFromCustomerEmail = async (customerEmail) => {
    try {
        const user = await User.findOne({
            where: { username: customerEmail },
            attributes: ['tenant_id']
        });
        return user ? user.tenant_id : null;
    } catch (error) {
        console.error(error);
        throw error;
    }
};
