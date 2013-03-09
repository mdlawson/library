module.exports = Ember.ObjectController.extend
  admin: (->
      return if App.SessionManager.get('currentState.name') is "admin" then true else false
    ).property("App.SessionManager.currentState")
  reserve: ->
    $.post "/resources/reservations",{ISBN: @get("isbn"), userId: App.get("user.id")}, -> console.log "reserved" 
  cover: (->
    return "http://covers.openlibrary.org/b/isbn/#{@get 'isbn'}-L.jpg"
    ).property("isbn")
  getReservations: ->
    $.post "/resources/reservations/query",{ISBN: @get "isbn"},(data) => 
      @set("reservations",data)
  getLoans: ->
    $.post "/resources/loans/query",{ISBN: @get "isbn"},(data) =>
      @set("loans",data)
  getCopies: ->
    $.post "/resources/books/copies",{ISBN: @get "isbn"},(data) =>
      @set("copies",data)
