const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const QrOrder = sequelize.define('QrOrder', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    date: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
    },
    delivery_type: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    customer_type: {
        type: DataTypes.ENUM('WALKIN', 'CUSTOMER'),
        allowNull: true,
        defaultValue: 'WALKIN',
    },
    customer_id: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    table_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    payment_status: {
        type: DataTypes.ENUM('pending', 'paid'),
        allowNull: false,
        defaultValue: 'pending',
    },
    status: {
        type: DataTypes.ENUM('created', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'created',
    },
    tenant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    tableName: 'qr_orders',
    timestamps: false,
});

module.exports = QrOrder;