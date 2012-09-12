Sequelize = require 'sequelize'

module.exports = 
  date:
    type: Sequelize.DATE
    allowNull: false
  id:
    type: Sequelize.INTERGER
    autoIncrement: true