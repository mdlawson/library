module.exports = Ember.ObjectController.extend
  admin: (->
      return if App.SessionManager.get('currentState.name') is "admin" then true else false
    ).property("App.SessionManager.currentState")
  reserve: ->
    $.post "/resources/users/#{App.get("user.id")}/reservations",{ISBN: @get "isbn"},() -> console.log "reserved" 