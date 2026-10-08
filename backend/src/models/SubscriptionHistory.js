const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const SubscriptionHistory = sequelize.define('SubscriptionHistory', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    tenant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    starts_on: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    expires_on: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    tableName: 'subscription_history',
    timestamps: false,
});

module.exports = SubscriptionHistory;