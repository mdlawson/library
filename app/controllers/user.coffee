module.exports = Ember.ObjectController.extend
  getReservations: ->
    $.post "/resources/reservations/query",{userId: @get "id"},(data) => 
      @set("reservations",data)
  getLoans: ->
    $.post "/resources/loans/query",{userId: @get "id"},(data) =>
      @set("loans",data)
