
window.App = require 'app'

# Templates

require 'templates/application'
require 'templates/login'

require 'templates/catalogue'
require 'templates/book'

require 'templates/users'
require 'templates/user'

require 'templates/issue'
require 'templates/return'


# Models

App.Book = require 'models/book'
App.User = require 'models/user'

# Controllers

App.SessionManager = require 'controllers/session'
App.SessionManager.on "login", (reauth) -> # when we login, unless we were already logged in, go to index
  unless reauth then App.Router.router.transitionTo "index"
App.SessionManager.on "error", -> # if we fail to login, redirect to login page
  App.Router.router.transitionTo "login"
App.SessionManager.send "login" # try to log in

matchers = require "matchers"

App.CatalogueController = require "controllers/catalogue"
App.BookController = require 'controllers/book'

App.UsersController = require 'controllers/users'
App.UserController = require 'controllers/user'

App.IssueController = require "controllers/issue"
App.ReturnController = require "controllers/return"

# Views

App[key] = value for key,value of require "views/views" # import all views into app

$(window).resize -> App.fill() # fill the window on resize

# Routes

App.IndexRoute = Ember.Route.extend
  redirect: -> @transitionTo 'catalogue' # when someone visits index, redirect to catalogue 
App.LoginRoute = Ember.Route.extend
  events:
    login: -> # when login button pressed, send the input to the session manager
      App.SessionManager.send "login",
        username: $("input.username").val() # gets the value of the username input field
        password: $("input.password").val() # gets value of the password input field

App.IssueRoute = Ember.Route.extend
  setupController: ->
    App.User.find() # load all our users when on issue page

App[key] = value for key,value of require "routes/users"  # import user routes into app
App[key] = value for key,value of require "routes/books" # import book routes into app

# Store

App.Store = DS.Store.extend # setup the data store
  revision: 11
  adapter: DS.RESTAdapter.create
    url: "/resources"
    
# Router

App.Router.reopen
   location: 'history' # save route changes to history
App.Router.map -> # describe all the route path mappings
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

key = window.key # set up key bindings
key "1", -> App.Router.router.transitionTo "issue"
key "2", -> App.Router.router.transitionTo "return"
key "3", -> App.Router.router.transitionTo "catalogue.index"
key "4", -> App.Router.router.transitionTo "users.index"

App.notify = (options) -> $(".notifications").notify(options).show() # shortcut to make a notification

App.initialize() # set up the app




