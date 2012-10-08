mysql = require 'mysql'
con = mysql.createConnection mysql.con
model = ["id","title","author","description","date","ISBN"]
modelStr = model.join(',')

module.exports =
  options:
    name: 'resources/books'
    id: 'book'
#    before:
#      create: auth
#      update: auth
#      destroy: auth

  index: (req, res) ->
    con.query "SELECT #{modelStr} FROM books", (err, results) ->
      res.send err or results
  show: (req, res) ->
    con.query "SELECT #{modelStr} FROM books WHERE id = ?", Number(req.params.book), (err, results) ->
      res.send err or results[0]
  create: (req, res) ->
    req.body.date = new Date req.body.date
    delete req.body.id
    con.query "INSERT INTO books SET ?", req.body, (err, results) ->
      unless err then con.query "SELECT #{modelStr} FROM books WHERE id = ?", results.insertId, (err, results) ->
        res.send err or results[0]
      else res.send err
  update: (req, res) ->
    if req.body.date then req.body.date = new Date req.body.date
    con.query "UPDATE books SET ? WHERE id = ?", [req.body, Number req.params.book], (err, results) ->
      unless err then con.query "SELECT #{modelStr} FROM books WHERE id = ?", Number(req.params.book), (err, results) ->
        res.send err or results[0]
      else res.send err
  destroy: (req, res) ->
    con.query "DELETE FROM books WHERE id = ?", Number(req.params.book), (err, results) ->
      res.send err or 200

auth = (req, res, next) ->
  if req.session.user and req.session.user.admin is 1 then next() else res.send(401)