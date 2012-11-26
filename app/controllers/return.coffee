Book = require "models/book"

class Returner extends Spine.Controller
  el: "#return"

  elements:
    '.column': 'column'
    ".bookInput": 'bookInput'

  constructor: ->
    super
    @render()

  activate: ->
    @el.addClass("visible")
    @bookInput.focus()
    Book.fetch()

  deactivate: ->
    @el.removeClass("visible")

  inputBook: (e) =>
    unless e.which is 13 then return
    try
      @book = Book.find Number @bookInput.val()
      if @book then @book.return()
    catch error
      @book = {alert: "Book not found!"}
    @render()
    @bookInput.focus()

  render: ->
    @html require("views/return")(@book or {})
    @bookInput.keyup @inputBook

module.exports = Returner