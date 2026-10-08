const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const StoreDetails = sequelize.define('StoreDetails', {
    tenant_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
    },
    store_image: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    store_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    address: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    currency: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    is_qr_menu_enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
    },
    unique_qr_code: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    is_qr_order_enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
    },
    is_feedback_enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
    },
    unique_id: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    tenant_slug: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    service_charge: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
}, {
    tableName: 'store_details',
    timestamps: false,
});

module.exports = StoreDetails;