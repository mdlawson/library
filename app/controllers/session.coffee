class SessionManager extends Spine.Controller
  el: "#content"
  #className: "row-fluid"

  events:
    'click #submit': 'submit'

  activate: ->
    @html require("views/login")()
    @el.addClass("login")
    $("#menu")[0].style.display = "none"
  deactivate: ->
    @el.removeClass("login")
    $("#menu")[0].style.display = "block"

  login: (data={}) ->
    $.post("/login",data,(user) => 
      @user = user
      @trigger "login", user
    ).error =>
      @trigger "failure"
  logout: ->
    $.post("/logout",->
      @user = null
      @trigger "logout"
    )
  submit: (e) ->
    e.preventDefault()
    @login 
      username: @$("input#username").val()
      password: @$("input#password").val()



module.exports = SessionManager