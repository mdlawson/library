mysql = require 'mysql'
con = mysql.createConnection mysql.con
model = ["bookId","title","author","description","date"]
modelStr = model.join(',')

module.exports =
  options:
    name: 'resources/books'
    id: 'book'
  index: (req, res) ->
    unless req.params.user
      con.query "SELECT #{modelStr} FROM books", (err, results) ->
        res.send err or results
    else
      con.query "SELECT #{modelStr} FROM books WHERE loanedTo = ?", Number(req.params.user), (err, results) ->
        res.send err or results
  show: (req, res) ->
    con.query "SELECT #{modelStr} FROM books WHERE bookId = ?", Number(req.params.book), (err, results) ->
      res.send err or results[0]
  create: (req, res) ->
    unless req.params.user
      req.body.date = new Date req.body.date
      con.query "INSERT INTO books SET ?", req.body, (err, results) ->
        res.send err or results
    else
      con.query "UPDATE books SET ? WHERE bookId = ?", [{loanedTo: Number(req.params.user)},Number(req.body.bookId)], (err, results) ->
        res.send err or results
  update: (req, res) ->
    req.body.date = new Date req.body.date
    con.query "UPDATE books SET ? WHERE bookId = ?", [req.body, Number req.params.book], (err, results) ->
      res.send err or results
  destroy: (req, res) ->
    con.query "DELETE FROM books WHERE bookId = ?", Number(req.params.book), (err, results) ->
      res.send err or results