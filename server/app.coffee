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

  app.get "/", (req, res) ->
    res.render "index"

  app.get "/partials/*", (req, res) ->
    res.render "partials/"+req.params[0].split(".")[0]

  # Database

  mysql.con =
    host: 'localhost'
    user: 'root'
    database: 'library'

  # Resource mapping

  app.resource 'users', ->
    @resource 'books', {name: "books"}
  app.resource 'reservations'
  app.resource 'books'

  # Login routing

  app.post "/login", require("./controllers/users").login

  # Start server

  app.listen(app.get("port"))
  console.log "Express server listening on port " + app.get("port")
