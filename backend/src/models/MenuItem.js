const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const MenuItem = sequelize.define('MenuItem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING(500),
        allowNull: true,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    net_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    tax_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    image: {
        type: DataTypes.STRING(2000),
        allowNull: true,
    },
    category: {
        type: DataTypes.INTEGER,
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
    is_enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    tableName: 'menu_items',
    timestamps: false,
});

module.exports = MenuItem;