const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const RefreshToken = sequelize.define('RefreshToken', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    refresh_token: {
        type: DataTypes.STRING(500), // Increased length for JWT
        allowNull: false,
        unique: true,
        primaryKey: true,
    },
    expiry: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    device_ip: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    device_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    device_location: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    tenant_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
}, {
    tableName: 'refresh_tokens',
    timestamps: false,
    id: false, // Disable the default 'id' column
});

module.exports = RefreshToken;