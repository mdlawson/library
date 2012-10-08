class Book extends Spine.Model
  @configure "Book","title","description","author","date","ISBN"

  @extend Spine.Model.Ajax

  @url: "/resources/books"

  getReservations: (cb) ->
    $.get "/resources/books/#{@id}/reservations", cb
  getLoans: (cb) ->
    $.get "/resources/books/#{@id}/loans", cb

module.exports = Book