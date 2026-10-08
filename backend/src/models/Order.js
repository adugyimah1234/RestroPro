const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    delivery_type: {
        type: DataTypes.STRING(90),
        allowNull: true,
    },
    customer_type: {
        type: DataTypes.ENUM('WALKIN', 'CUSTOMER'),
        allowNull: true,
        defaultValue: 'WALKIN',
    },
    customer_id: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    table_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    tenant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('created', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'created',
    },
    token_no: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    payment_status: {
        type: DataTypes.ENUM('pending', 'paid'),
        allowNull: true,
        defaultValue: 'pending',
    },
    invoice_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    branch_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    }
}, {
    tableName: 'orders',
    timestamps: false,
});

module.exports = Order;