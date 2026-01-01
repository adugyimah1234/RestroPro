const { DataTypes } = require('sequelize');
const sequelize = require('../../config/mysql.db'); // Adjust path as needed

const SubscriptionPlan = sequelize.define('SubscriptionPlan', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  duration_unit: {
    type: DataTypes.STRING, // e.g., 'month', 'year'
    allowNull: false,
  },
  duration_value: {
    type: DataTypes.INTEGER, // e.g., 1 for 1 month
    allowNull: false,
  },
  features: {
    type: DataTypes.JSON, // Store features as a JSON object or array
    allowNull: true,
  },
  paystack_plan_id: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'SubscriptionPlans', // Ensure this matches your table name
  timestamps: true,
});

module.exports = SubscriptionPlan;
