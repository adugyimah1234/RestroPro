'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const email = process.env.SUPERADMIN_EMAIL || 'admin@restropro.com';
    const rawPassword = process.env.SUPERADMIN_PASSWORD || 'RestroPro#SuperAdmin$2025!';
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // Delete non-production / test superadmin account if present
    await queryInterface.bulkDelete('superadmins', { email: 'superadmin@example.com' }, {});

    // Delete existing account if re-seeding to ensure updated password
    await queryInterface.bulkDelete('superadmins', { email }, {});

    await queryInterface.bulkInsert('superadmins', [{
      email,
      password: hashedPassword,
      name: 'System Super Admin'
    }], { ignoreDuplicates: true });
  },

  async down (queryInterface, Sequelize) {
    const email = process.env.SUPERADMIN_EMAIL || 'admin@restropro.com';
    await queryInterface.bulkDelete('superadmins', { email }, {});
  }
};
