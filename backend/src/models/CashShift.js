'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

module.exports = sequelize.define('CashShift', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tenant_id: { type: DataTypes.INTEGER, allowNull: false },
  branch_id: { type: DataTypes.INTEGER, allowNull: true },
  opened_by: { type: DataTypes.STRING(191), allowNull: false },
  opened_by_name: { type: DataTypes.STRING(191), allowNull: true },
  opened_at: { type: DataTypes.DATE, allowNull: false },
  opening_cash: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
  closed_by: { type: DataTypes.STRING(191), allowNull: true },
  closed_by_name: { type: DataTypes.STRING(191), allowNull: true },
  closed_at: { type: DataTypes.DATE, allowNull: true },
  counted_cash: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
  expected_cash: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
  variance: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
  notes: { type: DataTypes.TEXT, allowNull: true },
}, { tableName: 'cash_shifts', timestamps: false });
