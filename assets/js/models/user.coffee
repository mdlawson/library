class User extends Spine.Model
  @configure "User","username","firstName","lastName","email","admin"

  @extend Spine.Model.Ajax

  @url: "/resources/users"

  getReservations: (cb) ->
    $.get "#{@url()}/reservations", cb
  makeReservation: (book,cb) ->
    $.post "#{@url()}/reservations", {bookId: book}, cb
  getLoans: (cb) ->
    $.get "#{@url()}/loans", cb
  makeLoan: (book,cb) ->
    $.post "#{@url()}/loans", {bookId: book}, cb

module.exports = User