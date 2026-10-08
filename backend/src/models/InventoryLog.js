const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const InventoryLog = sequelize.define('InventoryLog', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    tenant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    branch_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    inventory_item_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    quantity_change: {
        type: DataTypes.DECIMAL(10, 4),
        allowNull: false,
    },
    previous_quantity: {
        type: DataTypes.DECIMAL(10, 4),
        allowNull: true,
    },
    new_quantity: {
        type: DataTypes.DECIMAL(10, 4),
        allowNull: true,
    },
    note: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    created_by: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: true,
    },
}, {
    tableName: 'inventory_logs',
    timestamps: false,
});

module.exports = InventoryLog;