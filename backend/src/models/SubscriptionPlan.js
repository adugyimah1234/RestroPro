const sequelize = require('../config/sequelize'); // Import sequelize from the new file
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
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    currency: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    frequency: {
        type: DataTypes.STRING,
        allowNull: false, // e.g., 'monthly', 'annually'
    },
    features: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    duration_days: {
        type: DataTypes.INTEGER,
        allowNull: true, // e.g., 30 for monthly, 365 for annually
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