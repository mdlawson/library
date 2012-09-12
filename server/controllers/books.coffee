db = require('sequelize').db
Book = db.models.Book
User = db.models.User

module.exports =
  index: (req, res) ->
    unless req.params.user
      Book.all().success (books) ->
        res.send books
    else
      User.find(Number req.params.user).success (user) ->
        user.getBooks().success (books) -> res.send books
  show: (req, res) ->
    Book.find(Number req.params.book).success (book) ->
      res.send book
  new: (req, res) ->
    res.send "new book"
  create: (req, res) ->
    Book.create(
      title: req.body.title
      author: req.body.author
      date: Date req.body.date
      description: req.body.description 
    ).success (book) ->
      res.send book
  edit: (req, res) ->
    res.send "edit book: " + req.params.book
  update: (req, res) ->
    Book.find(Number req.params.book).success (book) ->
      if book
        book.title = req.body.title or book.title
        book.author = req.body.author or book.author
        book.date = Date req.body.date or book.date
        book.description = req.body.description or book.description
        book.save().success ->
          res.send book
  destroy: (req, res) ->
    Book.find(Number req.params.book).success (book) ->
      if book then book.destroy().success ->
        res.send('')