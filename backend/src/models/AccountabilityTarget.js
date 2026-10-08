'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

module.exports = sequelize.define('AccountabilityTarget', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tenant_id: { type: DataTypes.INTEGER, allowNull: false },
  branch_id: { type: DataTypes.INTEGER, allowNull: true },
  target_type: { type: DataTypes.STRING(20), allowNull: false },
  amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  starts_on: { type: DataTypes.DATEONLY, allowNull: false },
  ends_on: { type: DataTypes.DATEONLY, allowNull: false },
  created_by: { type: DataTypes.STRING(191), allowNull: false },
  created_at: { type: DataTypes.DATE, allowNull: false },
}, { tableName: 'accountability_targets', timestamps: false });
