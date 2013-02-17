class Book extends Spine.Model
  @configure "Book","title","description","author","date","ISBN","dewey"

  @extend Spine.Model.Ajax

  @url: "/resources/books"

  getReservations: (cb) ->
    $.get "/resources/reservations", cb
  makeReservation: (user,cb) ->
    $.post "/resources/reservations", {userId: user, ISBN: @ISBN}, cb
  cancelReservation: (id, cb) ->
    $.delete "/resources/reservations/#{id}", cb
  getLoans: (cb) ->
    $.get "#{@url()}/loans", cb
  makeLoan: (book,cb) ->
    $.post "#{@url()}/loans", {userId: user}, cb
  return: (cb) ->
    $.post "#{@url()}/return", cb


module.exports = Book