module.exports = Ember.ObjectController.extend
  getReservations: (cb) -> # make a post request to get all the reservations for this user, run function cb when done
    $.post "/resources/reservations/query",{userId: @get "id"},(data) => 
      @set("reservations",data)
      if cb then cb(data)
  getLoans: (cb) -> # make a post request to get all the loans for this user, run function cb when done
    $.post "/resources/loans/query",{userId: @get "id"},(data) =>
      @set("loans",data)
      if cb then cb(data)
