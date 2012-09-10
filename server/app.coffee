# Imports
express = require "express"
path = require "path"
Sequelize = require "sequelize"
require "express-resource-new"

# Express
app = express()
app.configure ->
  app.set "port", process.env.PORT or 3000
  app.set "views", __dirname + "/views"
  app.set "controllers", __dirname + "/controllers"
  app.set "view engine", "jade"
  app.use express.favicon()
  app.use express.logger("dev")
  app.use express.bodyParser()
  app.use express.methodOverride()
  app.use express.cookieParser("your secret here")
  app.use express.session()
  app.use app.router
  app.use express.static(path.join(__dirname, "public"))

app.configure "development", ->
  app.use express.errorHandler()

# Database

db = Sequelize.db = new Sequelize 'db', 'root'
db.models =
  User: Sequelize.db.define 'User', require "./models/user"
  Book: Sequelize.db.define 'Book', require "./models/book"
  Reservation: Sequelize.db.define 'Reservation', require "./models/reservation.coffee"

# Associations
User = db.models.User
Book = db.models.Book
Reservation = db.models.Reservation

# Rentals
User.hasMany Book, as: "Books"
Book.belongsTo User

# Reservations
User.hasMany Reservation, as: "Reservations"
Book.hasMany Reservation, as: "Reservations"
Reservation.hasOne Book

# Sync

db.sync().success -> console.log "Database is ready!"

# Resource mapping

app.resource 'users', ->
  @resource 'books'
  @resource 'reservations'
app.resource 'books'

# Start server

app.listen(app.get("port"))
console.log "Express server listening on port " + app.get("port")
