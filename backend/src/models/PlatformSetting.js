'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const PlatformSetting = sequelize.define('PlatformSetting', {
  setting_key: {
    type: DataTypes.STRING(100),
    primaryKey: true,
    allowNull: false,
  },
  encrypted_value: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  tableName: 'platform_settings',
  timestamps: true,
});

module.exports = PlatformSetting;
