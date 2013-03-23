SessionManager = Em.StateManager.create
  initialState: 'loggedOut' # start in logged out state
  loggedOut: Em.State.create
    login: (manager, data={}) -> # when in logged out state, we can log in with data
      $.post "/login",data, (user) -> # post data to server
        App.set "user",user # if server responds with user, set that as current user
        manager.trigger "login",user.reauth,user.admin # trigger login even with new info
        manager.transitionTo(if user.admin then 'admin' else 'user') # transition to right state for what we logged in as
      .error ->
        manager.trigger "error"
        manager.transitionTo 'loggedOut'

  admin: Em.State.create()
  user: Em.State.create()

module.exports = SessionManager