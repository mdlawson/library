SessionManager = Em.StateManager.create
  initialState: 'loggedOut'
  loggedOut: Em.State.create
    login: (manager, data={}) ->
      $.post "/login",data, (user) ->
        App.set "user",user
        manager.trigger "login",user.reauth
        manager.transitionTo(if user.admin then 'admin' else 'user')
      .error ->
        manager.trigger "error"
        manager.transitionTo 'loggedOut'

  admin: Em.State.create()
  user: Em.State.create()

module.exports = SessionManager