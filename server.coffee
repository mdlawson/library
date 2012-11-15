express =        require 'express'
engines =        require 'consolidate'
mysql   =        require "mysql"
routes  =        require './routes'

require "express-resource-new"

exports.startServer = (config) ->

  app = express()
  
  app.configure ->
    app.set 'port', config.server.port
    app.set 'views', config.server.views.path
    app.set "controllers", __dirname + "/controllers"
    app.engine config.server.views.extension, engines[config.server.views.compileWith]
    app.set 'view engine', config.server.views.extension
    app.use express.favicon()
    app.use express.bodyParser()
    app.use express.methodOverride()
    app.use express.compress()
    app.use config.server.base, app.router
    app.use express.static(config.watch.compiledDir)

  app.configure 'development', ->
    app.use express.errorHandler()

    mysql.con =
    host: '172.16.4.200'
    password: 'cat'
    user: '06lawsonm'
    database: '06lawsonm'

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

  server = app.listen config.server.port, ->
    console.log "Express server listening on port %d in %s mode", server.address().port, app.settings.env

  server
