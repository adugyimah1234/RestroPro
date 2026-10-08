const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Customer = sequelize.define('Customer', {
    phone: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    birth_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    gender: {
        type: DataTypes.ENUM('male', 'female', 'other'),
        allowNull: true,
    },
    is_member: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
    },
    update_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
    },
    tenant_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
    },
    branch_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
}, {
    tableName: 'customers',
    timestamps: false,
});

module.exports = Customer;