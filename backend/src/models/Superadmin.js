const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Superadmin = sequelize.define('Superadmin', {
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    tableName: 'superadmins',
    timestamps: false,
});

module.exports = Superadmin;