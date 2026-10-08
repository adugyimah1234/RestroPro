const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const InventoryItem = sequelize.define('InventoryItem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    unit: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    quantity: {
        type: DataTypes.DECIMAL(10, 4),
        allowNull: false,
    },
    min_quantity_threshold: {
        type: DataTypes.DECIMAL(10, 4),
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('low', 'in', 'out'),
        allowNull: true,
    },
    tenant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    branch_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
}, {
    tableName: 'inventory_items',
    timestamps: false,
});

module.exports = InventoryItem;