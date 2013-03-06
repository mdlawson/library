mysql = require 'mysql'
con = mysql.createConnection mysql.con
model = ["id","isbn","title","author","description","date","dewey"]
modelStr = model.join(',')


auth = (req, res, next) ->
  if req.session.user and req.session.user.admin is 1 then next() else res.send(401)

lookup = (req,res) ->
  con.query "SELECT ISBN FROM libraryBooks WHERE id = ?",Number(req.body.book),(err,results) ->
    unless err or not results.length then con.query "SELECT #{modelStr} FROM books WHERE isbn = ?",results[0].ISBN,(err,results) ->
      unless err then res.send results[0]
      else res.send err
    else 
      res.send err

module.exports =
  options:
    name: 'resources/books'
    id: 'book'
    before:
      create: auth
      update: auth
      destroy: auth

  index: (req, res) ->
    con.query "SELECT #{modelStr} FROM books", (err, results) ->
      res.send err or {books: results}
  show: (req, res) ->
    con.query "SELECT #{modelStr} FROM books WHERE id = ?", Number(req.params.book), (err, results) ->
      res.send err or {book: results[0]}
  create: (req, res) ->
    if req.body.book.title is "" and req.body.book.isbn isnt ""
      console.log "not implemented"
    console.log req.body.book
    req.body.book.date = new Date req.body.book.date
    con.query "INSERT INTO books SET ?", req.body.book, (err, results) ->
      unless err then con.query "SELECT #{modelStr} FROM books WHERE isbn = ?", req.body.book.isbn, (err, results) ->
        unless err then con.query "INSERT INTO libraryBooks SET ?",{ISBN:req.body.book.isbn},(err,results2) ->
          res.send err or {book: results[0]}
        else
          res.send err
      else 
        console.log err
        res.send err
  update: (req, res) ->
    if req.body.book.date then req.body.book.date = new Date req.body.book.date
    console.log req.body.book
    con.query "UPDATE books SET ? WHERE id = ?", [req.body.book, Number req.params.book], (err, results) ->
      unless err then con.query "SELECT #{modelStr} FROM books WHERE id = ?", Number(req.params.book), (err, results) ->
        console.log err
        res.send err or 200#results[0]
      else 
        console.log err
        res.send err
  destroy: (req, res) ->
    con.query "DELETE FROM books WHERE id = ?", Number(req.params.book), (err, results) ->
      res.send err or 200
  return: (req, res) ->
    con.query "UPDATE loans SET returned = 1 WHERE bookId = ? AND returned = 0", [Number req.body.book], (err, results) ->
      unless err then lookup req,res
      else res.send err
  lookup: lookup
