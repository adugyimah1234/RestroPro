const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const QrOrderItem = sequelize.define('QrOrderItem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    item_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    variant_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('created', 'preparing', 'completed', 'cancelled', 'delivered'),
        allowNull: true,
        defaultValue: 'created',
    },
    date: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
    },
    notes: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    addons: {
        type: DataTypes.JSON, // Assuming addons are stored as JSON
        allowNull: true,
    },
    tenant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    tableName: 'qr_order_items',
    timestamps: false,
});

module.exports = QrOrderItem;