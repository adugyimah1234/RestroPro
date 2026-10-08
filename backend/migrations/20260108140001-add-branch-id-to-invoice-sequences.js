'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('invoice_sequences', 'branch_id', {
      type: Sequelize.INTEGER,
      allowNull: true, // or false if every sequence must have a branch
      references: {
        model: 'Branches',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('invoice_sequences', 'branch_id');
  }
};