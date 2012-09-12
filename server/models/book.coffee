Sequelize = require 'sequelize'

module.exports = 
  title: 
    type: Sequelize.STRING
    allowNull: false
  author: 
    type: Sequelize.STRING
    allowNull: false
  date:
    type: Sequelize.DATE
    allowNull: false
  description:
    type: Sequelize.TEXT
  id:
    type: Sequelize.INTERGER
    autoIncrement: true