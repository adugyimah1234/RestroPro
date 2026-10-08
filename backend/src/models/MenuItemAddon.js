const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const MenuItemAddon = sequelize.define('MenuItemAddon', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    item_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
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
}, {
    tableName: 'menu_item_addons',
    timestamps: false,
});

module.exports = MenuItemAddon;