class Book extends Spine.Model
  @configure "Book","title","description","author","date","ISBN"

  @extend Spine.Model.Ajax

  @url: "/resources/books"

  getReservations: (cb) ->
    $.get "#{@url()}/reservations", cb
  makeReservation: (book,cb) ->
    $.post "#{@url()}/reservations", {bookId: book}, cb
  getLoans: (cb) ->
    $.get "#{@url()}/loans", cb
  makeLoan: (book,cb) ->
    $.post "#{@url()}/loans", {bookId: book}, cb
  return: (cb) ->
    $.post "#{@url()}/return", cb


module.exports = Book