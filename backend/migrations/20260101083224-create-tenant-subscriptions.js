'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('TenantSubscriptions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      tenant_id: {
        type: Sequelize.INTEGER, // Changed to INTEGER
        allowNull: false,
        references: {
          model: 'tenants', // Name of the Tenants table (lowercase)
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      subscription_plan_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'SubscriptionPlans', // Name of the SubscriptionPlans table
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING, // e.g., 'active', 'inactive', 'cancelled'
        allowNull: false,
      },
      flutterwave_subscription_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      flutterwave_customer_id: {
        type: Sequelize.STRING,
        allowNull: true,
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
    await queryInterface.dropTable('TenantSubscriptions');
  }
};
