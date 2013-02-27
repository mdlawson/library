
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

attr = DS.attr
App.Book = DS.Model.extend
  isbn: attr "string"
  title: attr "string"
  author: attr "string"
  description: attr "string"
  date: attr "string"
  dewey: attr "string"
.reopen
  url: "resources/books"

App.User = DS.Model.extend
  username: attr "string"
  password: attr "string"
  firstname: attr "string"
  lastname: attr "string"
  email: attr "string"
  admin: attr "boolean"
.reopen
  url: "resources/users"

# Controllers

App.SessionManager = require 'controllers/session'
App.SessionManager.on "login", (reauth) ->
  unless reauth then App.Router.router.transitionTo "index"
App.SessionManager.on "error", ->
  App.Router.router.transitionTo "login"
App.SessionManager.send "login"

matchers = require "matchers"

App.CatalogueController = Ember.ArrayController.extend
  query: ""
  filtered: (->
    val = @get("query")
    content = @get("content")
    #rankings = []
    results = []
    unless val then return content
    if val.length is 13 and not isNaN(parseInt val) and isFinite val
      content.forEach (item) ->
        if item.get("isbn") is val then results.push item
    else
      content.forEach (item) ->
        author = item.get("author").split(" ")
        if item.get("title") is val or author[0] is val or author[1] is val then results.push item
    # else if val.length > 10 then matcher = matchers.levenshtein else matcher = matchers.strScore
    # content.forEach (item) ->
    #   score = []
    #   author = item.get("author").split " "
    #   for string in author.concat item.get("title")
    #     score.push matcher.score string, val
    #   score.sort matcher.sort
    #   if matcher.valid score[0] then rankings.push [score[0],item]
    # rankings.sort (a,b) -> matcher.sort a[0],b[0]
    # for item in rankings
    #   results.push item[1]
    return results
    #@get("content")
  ).property 'content.isLoaded','query'

App.IssueController = Ember.ObjectController.extend
  userId: ""
  user: {}
  userError: ""
  bookId: ""
  uncommitted: Ember.A()
  bookError: ""
  selectUser: ->
    @set 'user', App.User.find Number @get 'userId'
    if @get("user").get("username") is null 
      @set("user",null)
      @set("userError","User not found!")
    else
      @set("uncommitted",Ember.A())
      @set 'userError',null
  selectBook: ->
    book = App.Book.find Number @get 'bookId'
    if book.get("title") is null
      @set("bookError","Book not found!")
    else 
      @set("bookError",null)
      @uncommitted.pushObject book
  issue: ->
    url = "#{@user.get('url')}/#{@user.get('id')}/loans"
    for book in @uncommitted
      $.post url, {bookId: book.get("id")},-> console.log "loaned"
  cancel: ->
    @set("user",null)
      

# Views

App.ApplicationView = Ember.View.extend
  templateName: 'application'
  didInsertElement: -> fill()

App.DateView = Ember.TextField.extend
  classNames: ['date-picker']
  didInsertElement: -> @$().datepicker format: "dd-mm-yyyy"

App.SubmitText = Ember.TextField.extend
  insertNewline: ->
    controller = @get "controller"
    window.stc = controller
    controller[@get "method"]()

# Routes
newBook = -> 
  App.Book.createRecord
    title: "Untitled"
    author: "Unauthored"
App.IndexRoute = Ember.Route.extend
  redirect: -> @transitionTo 'catalogue'
App.LoginRoute = Ember.Route.extend
  events:
    login: ->
      App.SessionManager.send "login",
        username: $("input.username").val()
        password: $("input.password").val()

App.CatalogueRoute = Ember.Route.extend
  model: -> App.Book.find()
  renderTemplate: ->
    @render()
    #$("list").children(":first").click()

  events:
    new: -> newBook()

App.BookRoute = Ember.Route.extend
  renderTemplate: ->
    @render 'catalogue'
      controller: @controllerFor "catalogue"
    @render
     into: 'catalogue'
      
  model: (params) -> App.Book.find(params.book_id);
  events:
    save: ->
      @get("controller.model").transaction.commit()
    delete: ->
      model = @get("controller.model")
      model.deleteRecord()
      model.transaction.commit()
    new: -> newBook()

newUser = -> 
  App.User.createRecord
    firstname: "Joe"
    lastname: "Bloggs"

App.UsersRoute = Ember.Route.extend
  model: -> App.User.find()
  renderTemplate: ->
    @render()
    #$("list").children(":first").click()

  events:
    new: -> newUser()

App.UserRoute = Ember.Route.extend
  renderTemplate: ->
    @render 'users'
      controller: @controllerFor "users"
    @render
     into: 'users'
      
  model: (params) -> App.User.find(params.user_id);
  events:
    save: ->
      @get("controller.model").transaction.commit()
    delete: ->
      model = @get("controller.model")
      model.deleteRecord()
      model.transaction.commit()
    new: -> newUser()

App.IssueRoute = Ember.Route.extend
  setupController: ->
    App.User.find()
    App.Book.find()

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




