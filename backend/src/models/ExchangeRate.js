const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const ExchangeRate = sequelize.define('ExchangeRate', {
    currency_code: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
    },
    rate_to_usd: {
        type: DataTypes.DECIMAL(10, 4),
        allowNull: false,
    },
}, {
    tableName: 'exchange_rates',
    timestamps: false,
});

module.exports = ExchangeRate;