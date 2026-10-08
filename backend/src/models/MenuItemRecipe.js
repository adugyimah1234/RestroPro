const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const MenuItemRecipe = sequelize.define('MenuItemRecipe', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    menu_item_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    variant_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    addon_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    inventory_item_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    quantity: {
        type: DataTypes.DECIMAL(10, 4),
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
}, {
    tableName: 'menu_item_recipes',
    timestamps: false,
});

module.exports = MenuItemRecipe;