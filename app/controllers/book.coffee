module.exports = Ember.ObjectController.extend
  admin: (->
      return if App.SessionManager.get('currentState.name') is "admin" then true else false
    ).property("App.SessionManager.currentState")
  reserve: ->
    $.post "/resources/reservations",{ISBN: @get("isbn"), userId: App.get("user.id")}, -> console.log "reserved" 
  cover: (->
    return "http://covers.openlibrary.org/b/isbn/#{@get 'isbn'}-L.jpg"
    ).property("isbn")
  getReservations: (cb) ->
    $.post "/resources/reservations/query",{ISBN: @get "isbn"},(data) => 
      @set("reservations",data)
      if cb then cb(data)
  getLoans: (cb) ->
    $.post "/resources/loans/query",{ISBN: @get "isbn"},(data) =>
      @set("loans",data)
      if cb then cb(data)
  getCopies: (cb) ->
    $.post "/resources/books/copies",{ISBN: @get "isbn"},(data) =>
      @set("copies",data)
      if cb then cb(data)
