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
    @book = Book.find Number @bookInput.val()
    if @book then @book.return()
    @render()
    @bookInput.focus()

  render: ->
    @html require("views/return")(@book or {})
    @bookInput.keyup @inputBook

module.exports = Returner