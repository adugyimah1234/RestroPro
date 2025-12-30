'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'tenant_id', {
      type: Sequelize.INTEGER,
      allowNull: true, // Assuming a user can exist without a tenant initially, or will be assigned later
      references: {
        model: 'tenants', // Name of the target table
        key: 'id',        // Key in the target table that we're referencing
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', // Or 'CASCADE' depending on desired behavior
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'tenant_id');
  }
};
