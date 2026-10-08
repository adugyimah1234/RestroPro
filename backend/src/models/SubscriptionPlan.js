const sequelize = require('../config/sequelize');
const { DataTypes } = require('sequelize');

const SubscriptionPlan = sequelize.define('SubscriptionPlan', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    plan_code: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    currency: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'GH₵',
    },
    frequency: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'monthly',
    },
    duration_days: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 30,
    },
    duration_unit: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'month',
    },
    duration_value: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1,
    },
    features: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    paystack_plan_id: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    badge: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    tableName: 'subscription_plans',
    timestamps: true,
});

module.exports = SubscriptionPlan;
