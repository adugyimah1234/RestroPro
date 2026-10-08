const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const InventoryPurchaseOrderItem = sequelize.define('InventoryPurchaseOrderItem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    purchase_order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
    inventory_item_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    inventory_item_unit: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    quantity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
}, {
    tableName: 'inventory_purchase_order_items',
    timestamps: false,
});

module.exports = InventoryPurchaseOrderItem;