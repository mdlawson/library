module.exports = Ember.ObjectController.extend
  getReservations: (cb) ->
    $.post "/resources/reservations/query",{userId: @get "id"},(data) => 
      @set("reservations",data)
      if cb then cb(data)
  getLoans: (cb) ->
    $.post "/resources/loans/query",{userId: @get "id"},(data) =>
      @set("loans",data)
      if cb then cb(data)
