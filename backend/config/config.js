require('dotenv').config(); // Load environment variables from .env file

module.exports = {
  development: {
    url: process.env.DATABASE_URL,
    dialect: 'mysql',
    seederStorage: '', // Store seeder information in the database
    migrationStorage: 'sequelize', // Store migration information in the database
  },
  // You can add test and production configurations here
};