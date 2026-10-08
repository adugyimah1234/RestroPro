const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const InventoryPurchaseOrderDraft = sequelize.define('InventoryPurchaseOrderDraft', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    item_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    quantity: {
        type: DataTypes.DECIMAL(10, 2),
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
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: true,
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: true,
    },
}, {
    tableName: 'inventory_purchase_orders_drafts',
    timestamps: false, // Explicitly manage created_at and updated_at
});

module.exports = InventoryPurchaseOrderDraft;