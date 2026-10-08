const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Tax = sequelize.define('Tax', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    rate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    tenant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    tableName: 'taxes',
    timestamps: false,
});

module.exports = Tax;