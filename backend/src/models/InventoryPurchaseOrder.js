const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const InventoryPurchaseOrder = sequelize.define('InventoryPurchaseOrder', {
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
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: true,
    },
    fullfilled_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    vendor_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    vendor_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    contact_person: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    tax_id_no: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    created_by: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    tableName: 'inventory_purchase_orders',
    timestamps: false, // Explicitly manage created_at and updated_at
});

module.exports = InventoryPurchaseOrder;