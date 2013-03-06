module.exports = Ember.ObjectController.extend
  bookId: ""
  bookError: null
  book: {}
  returnBook: ->
    $.post "resources/books/return",{book: @get 'bookId'},(book) =>
      unless book.isbn is undefined
        book.id = @get 'bookId'
        @set("bookError",null)
        @set("book",book)
      else
        @set("book",null)
        @set("bookError","Book not found!")
