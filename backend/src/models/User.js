const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    role: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    photo: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    designation: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    location: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    scope: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    tenant_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    branch_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
}, {
    tableName: 'users',
    timestamps: false,
});

module.exports = User;