'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const columns = await queryInterface.describeTable('tenants');
    const overrides = {
      max_users_override: { type: Sequelize.INTEGER, allowNull: true },
      max_branches_override: { type: Sequelize.INTEGER, allowNull: true },
      advanced_reporting_enabled_override: { type: Sequelize.BOOLEAN, allowNull: true },
      multi_branch_analytics_enabled_override: { type: Sequelize.BOOLEAN, allowNull: true },
      monthly_ai_queries_override: { type: Sequelize.INTEGER, allowNull: true },
    };
    for (const [name, definition] of Object.entries(overrides)) {
      if (!columns[name]) await queryInterface.addColumn('tenants', name, definition);
    }
  },

  async down(queryInterface) {
    const columns = await queryInterface.describeTable('tenants');
    for (const name of [
      'monthly_ai_queries_override',
      'multi_branch_analytics_enabled_override',
      'advanced_reporting_enabled_override',
      'max_branches_override',
      'max_users_override',
    ]) {
      if (columns[name]) await queryInterface.removeColumn('tenants', name);
    }
  },
};
