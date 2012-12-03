module.exports.startServer = (port, path) ->

  # Imports
  express = require "express"
  path = require "path"
  mysql = require "mysql"
  require "express-resource-new"

  # Express
  app = express()
  app.configure ->
    app.set "port", port
    app.set "views", __dirname + "/public"
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
    host: '172.16.4.200'
    password: 'cat'
    user: '06lawsonm'
    database: '06lawsonm'

  # mysql.con = 
  #   host: 'localhost'
  #   user: 'root'
  #   database: 'library'

  # Resource mapping

  app.resource 'users', ->
    @resource 'loans'
    @resource 'reservations'
  app.resource 'books', ->
    @resource 'loans'
    @resource 'reservations'
    @member.post 'return'

  # Login routing

  app.post "/login", require("./controllers/users").login
  app.get "/logout", require("./controllers/users").logout

  app.use (req, res) ->
    res.render "index"

  # Start server

  app.listen(app.get("port"))
  console.log "Express server listening on port " + app.get("port")
