
window.App = require 'app'

# Templates

require 'templates/application'
require 'templates/login'

require 'templates/catalogue'
require 'templates/book'

require 'templates/users'
require 'templates/user'

require 'templates/issue'

fill = -> $("#container").height($(document).height()-$("#menu").height())

$(window).resize -> fill()

# Models

App.Book = require 'models/book'
App.User = require 'models/user'

# Controllers

App.SessionManager = require 'controllers/session'
App.SessionManager.on "login", (reauth) ->
  unless reauth then App.Router.router.transitionTo "index"
App.SessionManager.on "error", ->
  App.Router.router.transitionTo "login"
App.SessionManager.send "login"

matchers = require "matchers"

App.CatalogueController = require "controllers/catalogue"

App.IssueController = require "controllers/issue"
      

# Views

App[key] = value for key,value of require "views/views"

# Routes

App.IndexRoute = Ember.Route.extend
  redirect: -> @transitionTo 'catalogue'
App.LoginRoute = Ember.Route.extend
  events:
    login: ->
      App.SessionManager.send "login",
        username: $("input.username").val()
        password: $("input.password").val()

App.IssueRoute = Ember.Route.extend
  setupController: ->
    App.User.find()
    App.Book.find()

App[key] = value for key,value of require "routes/users"
App[key] = value for key,value of require "routes/books"

# Store

App.Store = DS.Store.extend
  revision: 11
  adapter: DS.RESTAdapter.create
    url: "/resources"
    
# Router

App.Router.reopen
   location: 'history'
App.Router.map ->
  @route 'index', { path: '/'}
  @route 'login', { path: '/login' }
  @route 'logout', { path: '/logout'}
  @route 'issue', { path: '/issue' }
  @route 'return', { path: '/return'}
  @resource 'catalogue', { path: '/catalogue' }, -> 
    @route 'new'
  @resource 'book', { path: '/catalogue/:book_id' }
  @resource 'users', { path: '/users' }, -> 
    @route 'new'
  @resource 'user', { path: '/users/:user_id' }

App.initialize()




