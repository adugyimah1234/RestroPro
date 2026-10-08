'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

module.exports = sequelize.define('AccountabilityActivity', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  tenant_id: { type: DataTypes.INTEGER, allowNull: false },
  branch_id: { type: DataTypes.INTEGER, allowNull: true },
  actor_username: { type: DataTypes.STRING(191), allowNull: true },
  actor_name: { type: DataTypes.STRING(191), allowNull: true },
  action: { type: DataTypes.STRING(80), allowNull: false },
  entity_type: { type: DataTypes.STRING(80), allowNull: false },
  entity_id: { type: DataTypes.STRING(191), allowNull: true },
  details: { type: DataTypes.JSON, allowNull: true },
  occurred_at: { type: DataTypes.DATE, allowNull: false },
}, { tableName: 'accountability_activity', timestamps: false });
