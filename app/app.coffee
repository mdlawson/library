require 'views/helpers'
SessionManager = require 'controllers/session'
CatalogueManager = require 'controllers/catalogue'
UserManager = require 'controllers/users'
Issuer = require 'controllers/issue'
Returner = require 'controllers/return'

class App extends Spine.Stack
  el: "#container"

  constructor: ->
    super

    @menu = $("#menu")

    Spine.Route.bind "navigate", (path) =>
      $("[id^=menu-]",@menu).removeClass("active")
      $("#menu-"+path.split("/")[1],@menu).addClass("active")
    
    @session.bind "login", (user) =>
      @render()
      @catalogue.basic = if user.admin is 0 then true else false
      unless user.reauth then @navigate "/catalogue"
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
    "/catalogue": 'catalogue'
    "/users": "user"
    "/issue": "issue"
    "/return": "return"

  controllers:
    session: SessionManager
    catalogue: CatalogueManager
    user: UserManager
    issue: Issuer
    return: Returner

$ ->
  window.app = new App
  $(window).resize fill
  fill()
  Spine.Route.setup history:true

fill = ->
  $("#container").height($(window).height()-41)
  inner = $("#container").height()-70
  $(".list").height(inner-30)
  $(".panel").height(inner-40)