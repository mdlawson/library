User = require "models/user"
Book = require "models/book"

class Issuer extends Spine.Controller
  el: "#issue"

  elements:
    '.column': 'column'
    '.userInput': 'userInput'
    ".bookInput": 'bookInput'
    '.books':'books'

  constructor: ->
    super
    @render()

  activate: ->
    @el.addClass("visible")
    @userInput.focus()
    User.fetch()
    Book.fetch()

  deactivate: ->
    @el.removeClass("visible")

  inputUser: (e) =>
    unless e.which is 13 then return
    try
      @user = User.find Number @userInput.val()
      @user.uncommitted ?= [] 
      @user.userAlert = null
    catch error
      @user = {userAlert:"User not found!"}
    @render()
    if @user.id then @bookInput.focus()

  inputBook: (e) =>
    unless e.which is 13 then return
    try
      book = Book.find Number @bookInput.val()
      @user.bookAlert = null
      if book not in @user.uncommitted then @user.uncommitted.push book
      else
        @user.bookAlert = "You have already added this book!"
    catch error
      @user.bookAlert = "Book not found!"
    @render()
    @bookInput.focus()

  removeBook: (e) =>
    @user.uncommitted.pop(@books.index $(e.target).parent())
    @render()

  cancel: =>
    @user = undefined
    @render()

  commit: =>
    for book in @user.uncommitted
      @user.makeLoan book.id
    @cancel()

  render: ->
    @html require("views/issue")(@user or {})
    @userInput.keyup @inputUser
    @bookInput?.keyup @inputBook
    $(".removeBook",@book).click @removeBook
    $(".commit",@column).click @commit
    $(".cancel",@column).click @cancel


module.exports = Issuer