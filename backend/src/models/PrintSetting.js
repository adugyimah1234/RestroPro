const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const PrintSetting = sequelize.define('PrintSetting', {
    tenant_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
    },
    page_format: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    header: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    footer: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    show_notes: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
    },
    is_enable_print: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
    },
    show_store_details: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
    },
    show_customer_details: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
    },
    print_token: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    tableName: 'print_settings',
    timestamps: false,
});

module.exports = PrintSetting;