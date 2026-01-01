'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('Users');
    if (!tableInfo.tenant_id) {
      await queryInterface.addColumn('Users', 'tenant_id', {
        type: Sequelize.INTEGER, // Changed to INTEGER
        allowNull: true,
        references: {
          model: 'tenants', // Name of the target table (lowercase)
          key: 'id',        // Key in the target table that we're referencing
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      });
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'tenant_id');
  }
};
