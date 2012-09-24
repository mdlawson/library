# Imports
express = require "express"
path = require "path"
mysql = require "mysql"
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

mysql.con =
  host: 'localhost'
  user: 'root'
  database: 'library'

# Sync

#db.sync().success -> console.log "Database is ready!"

# Resource mapping

app.resource 'users', ->
  @resource 'books'
#  @resource 'reservations'
app.resource 'books'

# Start server

app.listen(app.get("port"))
console.log "Express server listening on port " + app.get("port")
