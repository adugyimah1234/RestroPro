const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Reservation = sequelize.define('Reservation', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    customer_id: {
        type: DataTypes.STRING, // Assuming customer_id can be phone number or actual ID
        allowNull: false,
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    table_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    people_count: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    unique_code: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    tenant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: true,
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: true,
    },
}, {
    tableName: 'reservations',
    timestamps: false, // Explicitly manage created_at and updated_at
});

module.exports = Reservation;