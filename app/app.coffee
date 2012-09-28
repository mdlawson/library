SessionManager = require 'controllers/session'
CatalogueManager = require 'controllers/catalogue'
UserManager = require 'controllers/users'

class App extends Spine.Stack
  el: "#container"

  constructor: ->
    super
    @routes =
      "/login": 'session'
      "/catalogue": 'catalogue'
      "/users": "user"
    @session.login()
    @session.bind "login", => @catalogue.active()
  controllers:
    session: SessionManager
    catalogue: CatalogueManager
    user: UserManager

  default: 'session'

$ ->
  Spine.Route.setup history:true
  window.app = new App el: $("#container")