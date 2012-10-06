SessionManager = require 'controllers/session'
CatalogueManager = require 'controllers/catalogue'
UserManager = require 'controllers/users'

class App extends Spine.Stack
  el: "#container"

  constructor: ->
    super

    @$("#menu-issue").click => @navigate "/issue"
    @$("#menu-return").click => @navigate "/return"
    @$("#menu-catalogue").click => @navigate "/catalogue"
    @$("#menu-users").click => @navigate "/users"

    @session.bind "login", => 
      @navigate "/catalogue"
      @render()
    @session.bind "failure", => @navigate "/login"
    @session.login()

  render: ->
    $("#menu").html require("views/header")(@session.user)

  routes:
    "/login": 'session'
    "/catalogue": 'catalogue'
    "/users": "user"    

  controllers:
    session: SessionManager
    catalogue: CatalogueManager
    user: UserManager

$ ->
  window.app = new App
  $(window).resize fill
  fill()
  Spine.Route.setup history:true

fill = ->
  $("#container").height($(window).height()-41)