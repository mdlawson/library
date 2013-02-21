mysql = require 'mysql'
con = mysql.createConnection mysql.con
model = ["id","title","author","description","date","dewey"]
modelStr = model.join(',')


auth = (req, res, next) ->
  if req.session.user and req.session.user.admin is 1 then next() else res.send(401)

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
      res.send err or results
  show: (req, res) ->
    con.query "SELECT #{modelStr} FROM books WHERE id = ?", req.params.book, (err, results) ->
      res.send err or results[0]
  create: (req, res) ->
    if req.body.title is "" and req.body.isbn isnt ""
      console.log "not implemented"
    req.body.date = new Date req.body.date
    con.query "INSERT INTO books SET ?", req.body, (err, results) ->
      unless err then con.query "SELECT #{modelStr} FROM books WHERE id = ?", results.insertId, (err, results) ->
        res.send err or results[0]
      else res.send err
  update: (req, res) ->
    if req.body.date then req.body.date = new Date req.body.date
    con.query "UPDATE books SET ? WHERE id = ?", [req.body, req.params.book], (err, results) ->
      unless err then con.query "SELECT #{modelStr} FROM books WHERE id = ?", req.params.book, (err, results) ->
        res.send err or results[0]
      else res.send err
  destroy: (req, res) ->
    con.query "DELETE FROM books WHERE id = ?", req.params.book, (err, results) ->
      res.send err or 200
  return: (req, res) ->
    con.query "UPDATE loans SET returned = 1 WHERE bookId = ? AND returned = 0", [Number req.params.book], (err, results) ->
      res.send err or 200