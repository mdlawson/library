Book = require "models/book"
BookView = require "controllers/book"
Catalogue = require "controllers/catalogue"
panel = require "views/book/basicPanel"

class BasicCatalogue extends Catalogue
  activate: ->
    @el.addClass("visible basic")
    Book.fetch()
    @html require("views/basic")()
    @render()
  deactivate: ->
    @el.removeClass("visible basic")
  constructor: (options) ->
    super
    @user = options.user
    @render()
  refresh: ->
    @user.getLoans (data) => 
      @user.loans = data
      for loan in data
        Book.find(loan.bookId).loaned = true
    @user.getReservations (data) => 
      @user.reservations = data
      console.log data
      for reservation in data
        Book.find(reservation.bookId).reserved = true
  render: ->
    if @list
      books = @filter()
      @refresh()
      @list.empty()
      @addBook book for book in books
  addBook: (book) =>
    view = new BasicBookView book: book
    el = view.render().el
    booker = =>       
      $('#bookModal').html(panel book).modal()
      button = $('.reserve','#bookModal')
      button.click => 
        button.button "loading"
        book[if book.loaned then "renew" else if book.reserved then "cancelReservation" else "makeReservation"] @user.id, =>
          button.button "complete"
          @refresh()
          setTimeout booker, 2000
    el.click booker

    @list.append el
    el

class BasicBookView extends BookView
  render: =>
    @html require("views/book/basicList")(@book)
    @
module.exports = BasicCatalogue