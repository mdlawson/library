class Book extends Spine.Model
  @configure "Book","title","description","author","date","ISBN","dewey"

  @extend Spine.Model.Ajax

  @url: "/resources/books"

  getReservations: (cb) ->
    $.get "#{@url()}/reservations", cb
  makeReservation: (user,cb) ->
    $.post "#{@url()}/reservations", {userId: user}, cb
  getLoans: (cb) ->
    $.get "#{@url()}/loans", cb
  makeLoan: (book,cb) ->
    $.post "#{@url()}/loans", {userId: user}, cb
  return: (cb) ->
    $.post "#{@url()}/return", cb


module.exports = Book