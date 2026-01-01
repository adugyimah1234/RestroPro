'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('store_details');
    if (!tableInfo.tenant_slug) {
      await queryInterface.addColumn('store_details', 'tenant_slug', {
        type: Sequelize.STRING(255),
        allowNull: true, // Allow null initially for existing records
        unique: true,   // Ensure uniqueness for new tenant slugs
        after: 'tenant_id' // Position it after tenant_id for logical grouping
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('store_details', 'tenant_slug');
  }
};