const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const StoreTable = sequelize.define('StoreTable', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    table_title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    floor: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    seating_capacity: {
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
}, {
    tableName: 'store_tables',
    timestamps: false,
});

module.exports = StoreTable;