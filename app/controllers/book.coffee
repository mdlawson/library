module.exports = Ember.ObjectController.extend
  admin: (->
      return if App.SessionManager.get('currentState.name') is "admin" then true else false # return true if the current state is admin, else false
    ).property("App.SessionManager.currentState") # property depends on the current state of the session manager
  reserve: -> # makes a post to the reservations url with the current userid and this books isbn
    $.post "/resources/reservations",{ISBN: @get("isbn"), userId: App.get("user.id")}, -> console.log "reserved" 
  cover: (->
    return "http://covers.openlibrary.org/b/isbn/#{@get 'isbn'}-L.jpg"
    ).property("isbn") # generates a cover url, depends on the isbn
  getReservations: (cb) -> # makes a post to get all the reservations for this book, runs function cb when done
    $.post "/resources/reservations/query",{ISBN: @get "isbn"},(data) => 
      @set("reservations",data)
      if cb then cb(data)
  getLoans: (cb) -> # makes a post to get all the loans for this book, runs function cb when done
    $.post "/resources/loans/query",{ISBN: @get "isbn"},(data) =>
      @set("loans",data)
      if cb then cb(data)
  getCopies: (cb) -> # makes a post to get the ids of all the copies of this book, runs function cb when done
    $.post "/resources/books/copies",{ISBN: @get "isbn"},(data) =>
      @set("copies",data)
      if cb then cb(data)
