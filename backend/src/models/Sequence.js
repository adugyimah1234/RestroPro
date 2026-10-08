const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Sequence = sequelize.define('Sequence', {
    tenant_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
    },
    table_name: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
    },
    current_value: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    tableName: 'sequences',
    timestamps: false,
});

module.exports = Sequence;