const { Sequelize } = require('sequelize');
const { CONFIG } = require("./index");

const sequelize = new Sequelize(CONFIG.DATABASE_URL, {
  dialect: 'mysql',
  logging: false,
});

sequelize.authenticate()
  .then(() => {
    console.log('Sequelize connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database with Sequelize:', err);
  });

module.exports = sequelize;
