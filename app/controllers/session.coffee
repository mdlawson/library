class SessionManager extends Spine.Controller
  el: "#content"

  events:
    'click #submit': 'submit'

  activate: ->
    @html require("views/login")()

  login: (data={}) ->
    $.post("/login",data,(user) => 
      @user = user
      @trigger "login", user
    )
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