const { DataTypes } = require('sequelize');
const sequelize = require('../../config/mysql.db'); // Adjust path as needed
const Tenant = require('./Tenant'); // Assuming you have a Tenant model
const SubscriptionPlan = require('./SubscriptionPlan');

const TenantSubscription = sequelize.define('TenantSubscription', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  tenant_id: {
    type: DataTypes.INTEGER, // Matches the 'id' type in the 'tenants' table
    allowNull: false,
    references: {
      model: 'tenants', // Name of the Tenants table
      key: 'id',
    },
  },
  subscription_plan_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'SubscriptionPlans', // Name of the SubscriptionPlans table
      key: 'id',
    },
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING, // e.g., 'active', 'inactive', 'cancelled'
    allowNull: false,
  },
  paystack_subscription_id: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  paystack_customer_id: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'TenantSubscriptions', // Ensure this matches your table name
  timestamps: true,
});

// Define associations
TenantSubscription.belongsTo(Tenant, { foreignKey: 'tenant_id' });
TenantSubscription.belongsTo(SubscriptionPlan, { foreignKey: 'subscription_plan_id' });

module.exports = TenantSubscription;
