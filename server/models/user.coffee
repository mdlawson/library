Sequelize = require 'sequelize'

module.exports = 
  username: 
    type: Sequelize.STRING
    allowNull: false
  password: 
    type: Sequelize.STRING
    allowNull: false
  admin:
    type: Sequelize.BOOLEAN
    allowNull: false 
  id:
    type: Sequelize.INTERGER
    autoIncrement: true