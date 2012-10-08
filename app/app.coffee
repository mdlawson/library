SessionManager = require 'controllers/session'
CatalogueManager = require 'controllers/catalogue'
UserManager = require 'controllers/users'

class App extends Spine.Stack
  el: "#container"

  constructor: ->
    super

    @menu = $("#menu")

    Spine.Route.bind "navigate", (path) =>
      for i in ["issue","return","catalogue","users"]
        @menu.find("#menu-#{i}").removeClass("active")
      $("#menu-"+path.split("/")[1],@menu).addClass("active")
    
    @session.bind "login", => 
      @navigate "/catalogue"
      @render()
    @session.bind "failure", => @navigate "/login"
    @session.login()

  render: ->
    that = @
    items = 
    @menu.html require("views/header")(@session.user)

    $("#menu-issue",@menu).click => @navigate "/issue"
    $("#menu-return",@menu).click => @navigate "/return"
    $("#menu-catalogue",@menu).click => @navigate "/catalogue"
    $("#menu-users",@menu).click => @navigate "/users"

  routes:
    "/login": 'session'
    "/catalogue*blob": 'catalogue'
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