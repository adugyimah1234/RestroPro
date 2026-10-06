'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('password123', 10);

    await queryInterface.bulkInsert('users', [{
      username: 'testuser',
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
      role: 'user'
    }], { ignoreDuplicates: true });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', { username: 'testuser' }, {});
  }
};
