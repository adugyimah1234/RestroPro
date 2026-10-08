const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const TokenSequence = sequelize.define('TokenSequence', {
    tenant_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
    },
    sequence_no: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    last_updated: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
}, {
    tableName: 'token_sequences',
    timestamps: false,
});

module.exports = TokenSequence;
