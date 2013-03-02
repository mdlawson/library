module.exports = Ember.ObjectController.extend
  bookId: ""
  book: {}
  returnBook: ->
    $.post "resources/books/return",{book: @get 'bookId'},(book) =>
      book.id = @get 'bookId'
      @set("book",book)