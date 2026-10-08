const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Feedback = sequelize.define('Feedback', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    invoice_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    created_by: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    average_rating: {
        type: DataTypes.DECIMAL(2, 1),
        allowNull: true,
    },
    food_quality_rating: {
        type: DataTypes.DOUBLE(10, 2),
        allowNull: true,
    },
    service_rating: {
        type: DataTypes.DOUBLE(10, 2),
        allowNull: true,
    },
    staff_behavior_rating: {
        type: DataTypes.DOUBLE(10, 2),
        allowNull: true,
    },
    ambiance_rating: {
        type: DataTypes.DOUBLE(10, 2),
        allowNull: true,
    },
    recommend_rating: {
        type: DataTypes.DOUBLE(10, 2),
        allowNull: true,
    },
    remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    tenant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    branch_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
        field: 'date',
    },
}, {
    tableName: 'feedbacks',
    timestamps: false,
});

module.exports = Feedback;