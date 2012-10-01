class Book extends Spine.Model
  @configure "Book","title","description","author","date","ISBN"

  @extend Spine.Model.Ajax

  @url: "/resources/books"

  @fromJSON: (data) ->
    console.log data

module.exports = Book