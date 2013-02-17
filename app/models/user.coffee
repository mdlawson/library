class User extends Spine.Model
  @configure "User","username","firstName","lastName","email","admin","password"

  @extend Spine.Model.Ajax

  @url: "/resources/users"

  getReservations: (cb) ->
    $.get "#{@url()}/reservations", cb
  makeReservation: (book,cb) ->
    $.post "#{@url()}/reservations", {ISBN: book}, cb
  getLoans: (cb) ->
    $.get "#{@url()}/loans", cb
  makeLoan: (book,cb) ->
    $.post "#{@url()}/loans", {bookId: book}, cb

module.exports = User