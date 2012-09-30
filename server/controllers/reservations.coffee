mysql = require 'mysql'
con = mysql.createConnection mysql.con
model = ["userId","bookId","id","date"]
modelStr = model.join(',')

module.exports =
  options:
    name: 'resources/reservations'
    id: 'reservation'
    before:
      create: auth
      update: auth
      destroy: auth
  index: (req, res) ->
    con.query "SELECT #{modelStr} FROM reservations", (err, results) ->
      res.send err or results
  show: (req, res) ->
    con.query "SELECT #{modelStr} FROM books WHERE id = ?", [Number req.params.reservation], (err, results) ->
      res.send err or results[0]
  create: (req, res) ->
    con.query "INSERT INTO reservations SET ?", {userId: Number(req.body.userId), bookId: Number(req.body.bookId)}, (err, results) ->
      unless err then con.query "SELECT #{modelStr} FROM reservations WHERE id = ?", results.insertId, (err, results) ->
        res.send err or results
      else res.send err
  update: (req, res) ->
    req.body.userId = Number req.body.userId
    req.body.bookId = Number req.body.bookId
    con.query "UPDATE reservations SET ? WHERE id = ? ", [req.body, Number req.params.reservation], (err, results) ->
      unless err then con.query "SELECT #{modelStr} FROM reservations WHERE id = ?", Number(req.params.reservation), (err, results) ->
        res.send err or results
      else res.send err
  destroy: (req, res) ->
    con.query "DELETE FROM reservations WHERE id = ?", [Number req.params.reservation], (err, results) ->
      res.send err or res.send(200)
      
auth = (req, res, next) ->
  if req.session.user and req.session.user.admin is 1 then next() else res.send(401)