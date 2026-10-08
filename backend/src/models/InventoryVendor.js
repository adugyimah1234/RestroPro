const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const InventoryVendor = sequelize.define('InventoryVendor', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    contact_person: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    address_line1: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    address_line2: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    city: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    state: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    country: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    zipcode: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    tax_id_no: {
        type: DataTypes.STRING,
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
    tableName: 'inventory_vendors',
    timestamps: false, // Explicitly manage created_at and updated_at
});

module.exports = InventoryVendor;