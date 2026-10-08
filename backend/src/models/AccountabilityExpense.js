'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

module.exports = sequelize.define('AccountabilityExpense', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tenant_id: { type: DataTypes.INTEGER, allowNull: false },
  branch_id: { type: DataTypes.INTEGER, allowNull: true },
  amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  category: { type: DataTypes.STRING(100), allowNull: false },
  description: { type: DataTypes.STRING(500), allowNull: false },
  spent_on: { type: DataTypes.DATEONLY, allowNull: false },
  created_by: { type: DataTypes.STRING(191), allowNull: false },
  created_by_name: { type: DataTypes.STRING(191), allowNull: true },
  created_at: { type: DataTypes.DATE, allowNull: false },
}, { tableName: 'accountability_expenses', timestamps: false });
