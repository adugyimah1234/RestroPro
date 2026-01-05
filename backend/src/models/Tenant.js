const { DataTypes } = require('sequelize');
const sequelize = require('../config/mysql.db'); // Adjust path as needed

const Tenant = sequelize.define('Tenant', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(95),
    allowNull: true,
  },
  is_active: {
    type: DataTypes.TINYINT, // Corresponds to tinyint in MySQL
    allowNull: true,
  },
  subscription_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  payment_customer_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  subscription_start: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  subscription_end: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: true,
  },
}, {
  tableName: 'tenants', // Ensure this matches your table name
  timestamps: false, // The SQL schema uses created_at but not updated_at, so disable Sequelize's default timestamps
  createdAt: 'created_at', // Map Sequelize's createdAt to created_at column
  updatedAt: false, // Disable updatedAt as it's not in the SQL schema
});

module.exports = Tenant;
