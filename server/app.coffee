module.exports.startServer = (port, path) ->

  # Imports
  express = require "express"
  path = require "path"
  mysql = require "mysql"
  require "express-resource-new"

  # Express
  app = express()
  app.configure ->
    app.set "port", port # set the port
    app.set "views", __dirname + "/public" # directory where views are located
    app.set "controllers", __dirname + "/controllers" # directory where controllers are located
    app.set "view engine", "jade" # use jade to process views
    app.use express.favicon() # use favicons
    #app.use express.logger("dev") # log in dev mode
    app.use express.bodyParser() # parse incomming body data to js objects
    app.use express.methodOverride() 
    app.use express.cookieParser("your secret here") # encrypt cookies with this
    app.use express.session() # use sessions
    app.use app.router # use our router
    app.use express.static(path.join(__dirname, "public")) # serve static files from here

  app.configure "development", -> # when in development, handle errors nicely
    app.use express.errorHandler()

  # Database

  mysql.con = require './db' # import the db connection settings

  # Resource mapping

  app.resource 'users' # set up user resource from controllers/users
  app.resource 'books', -> # set up book resource from controllers/books
    @collection.post 'return' # handle posts to return
    @collection.post 'lookup' # handle posts to lookup
    @collection.post 'copies' # handle posts to copies
    @collection.post 'add' # handle posts to add
  app.resource 'reservations', -> # set up reservations resource from controllers/reservations
    @collection.post "query" # handle posts to query
  app.resource 'loans', -> # set up loans resource from controllers/loans
    @collection.post "query" # handle posts to query
  # Login routing

  app.post "/login", require("./controllers/users").login # handle posts to login
  app.get "/logout", require("./controllers/users").logout # handle gets of logout

  app.use (req, res) ->
    res.render "index" # render the index on any request not addressed by the above

  # Start server

  app.listen(app.get("port")) # listen on port
  console.log "Express server listening on port " + app.get("port")

  return app
