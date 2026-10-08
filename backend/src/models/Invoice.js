const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Invoice = sequelize.define('Invoice', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    sub_total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    tax_total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    service_charge_total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    tenant_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
    },
    payment_type_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    branch_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    created_by: {
        type: DataTypes.STRING(191),
        allowNull: true,
    },
    cash_shift_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    cash_tender: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    tableName: 'invoices',
    timestamps: false,
});

module.exports = Invoice;