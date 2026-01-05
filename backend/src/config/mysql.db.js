const { CONFIG } = require("./index");
const { Sequelize, DataTypes } = require('sequelize'); // Import Sequelize and DataTypes

// Initialize Sequelize
const sequelize = new Sequelize(CONFIG.DATABASE_URL, {
  dialect: 'mysql', // Specify the dialect
  logging: false, // Disable logging SQL queries to console
});

// Test the connection
sequelize.authenticate()
  .then(() => {
    console.log('Sequelize connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database with Sequelize:', err);
  });

// Export the sequelize instance
module.exports = sequelize;