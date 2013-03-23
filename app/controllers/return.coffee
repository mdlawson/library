module.exports = Ember.ObjectController.extend
  bookId: ""
  bookError: null
  book: {}
  returnBook: ->
    $.post "/resources/books/return",{book: @get 'bookId'},(book) => # make a post to the server to return the book
      unless book.isbn is undefined 
        book.id = @get 'bookId' # set book id to input id
        @set("bookError",null) # null error
        @set("book",book) # set book
      else # if the server response isnt a book, something went wrong
        @set("book",null)
        @set("bookError","Book not found!") # set error
