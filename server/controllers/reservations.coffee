mysql = require 'mysql'
con = mysql.createConnection mysql.con
model = ["bookId","title","author","description","date"]
modelStr = model.join(',')

module.exports =
  index: (req, res) ->
    con.query "SELECT #{modelStr} FROM books", (err, results) ->
      res.send err or results
  show: (req, res) ->
    con.query "SELECT #{modelStr} FROM books WHERE bookId = ?", [Number req.params.book], (err, results) ->
      res.send err or results[0]
  new: (req, res) ->
    res.send "new book"
  create: (req, res) ->
    req.body.date = new Date req.body.date
    con.query "INSERT INTO books SET ?", req.body, (err, results) ->
      res.send err or results
  edit: (req, res) ->
    res.send "edit book: " + req.params.book
  update: (req, res) ->
    req.body.date = new Date req.body.date
    q = con.query "UPDATE books SET ? WHERE bookId = ? ", [req.body, Number req.params.book], (err, results) ->
      res.send err or results
  destroy: (req, res) ->
    con.query "DELETE FROM books WHERE bookID = ?", [Number req.params.book], (err, results) ->
      res.send err or results