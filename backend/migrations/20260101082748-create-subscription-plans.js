'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('SubscriptionPlans', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      currency: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      duration_unit: {
        type: Sequelize.STRING, // e.g., 'month', 'year'
        allowNull: false,
      },
      duration_value: {
        type: Sequelize.INTEGER, // e.g., 1 for 1 month
        allowNull: false,
      },
      features: {
        type: Sequelize.JSON, // Store features as a JSON object or array
        allowNull: true,
      },
      paystack_plan_id: { // Changed from flutterwave_plan_id
        type: Sequelize.STRING,
        allowNull: true, // Nullable if not all plans are recurring or managed by Paystack
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('SubscriptionPlans');
  }
};
