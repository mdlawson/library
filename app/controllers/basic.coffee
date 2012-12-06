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
  render: ->
    if @list
      books = @filter()
      @list.empty()
      @addBook book for book in books
  addBook: (book) =>
    view = new BasicBookView book: book
    el = view.render().el
    el.click =>
      $('#bookModal').html(panel book).modal()
      reserve = $('.reserve','#bookModal')
      reserve.click =>
        reserve.button "loading"
        book.makeReservation @user.id, ->
          reserve.button "complete"
    @list.append el
    el

class BasicBookView extends BookView
  render: =>
    @html require("views/book/basicList")(@book)
    @
module.exports = BasicCatalogue