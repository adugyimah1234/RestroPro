'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('SuperAdmin@123', 10); // Use a strong, unique password for production

    await queryInterface.bulkInsert('Users', [{
      username: 'superadmin',
      email: 'superadmin@example.com',
      password: hashedPassword,
      role: 'superadmin', // Set the role to 'superadmin'
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', { email: 'superadmin@example.com' }, {});
  }
};
