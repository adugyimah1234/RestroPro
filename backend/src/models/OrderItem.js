const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const OrderItem = sequelize.define('OrderItem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    item_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    variant_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    tenant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('created', 'preparing', 'completed', 'cancelled', 'delivered'),
        allowNull: true,
        defaultValue: 'created',
    },
    branch_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    date: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
    },
    notes: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    addons: {
        type: DataTypes.TEXT('medium'),
        allowNull: true,
    },
}, {
    tableName: 'order_items',
    timestamps: false,
});

module.exports = OrderItem;