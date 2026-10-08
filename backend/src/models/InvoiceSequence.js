const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const InvoiceSequence = sequelize.define('InvoiceSequence', {
    tenant_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
    },
    branch_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    sequence_no: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    tableName: 'invoice_sequences',
    timestamps: false,
});

module.exports = InvoiceSequence;