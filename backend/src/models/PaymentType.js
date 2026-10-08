const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const PaymentType = sequelize.define('PaymentType', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    is_cash: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    tenant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    icon: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    tableName: 'payment_types',
    timestamps: false,
});

module.exports = PaymentType;