mysql = require 'mysql'
con = mysql.createConnection mysql.con
model = ["userId","bookId","id","date"]
modelStr = model.join(',')

module.exports =
  all: (req, res, next) ->
    req.context = if req.params.user then "user" else "book"
    next()
  index: (req, res) ->
    con.query "SELECT #{modelStr} FROM reservations WHERE #{req.context}Id = ?", [Number req.params[req.context]], (err, results) ->
      res.send err or results
  show: (req, res) ->
    con.query "SELECT #{modelStr} FROM reservations WHERE id = ? AND #{req.context}Id = ?", [Number(req.params.reservation),Number(req.params[req.context])], (err, results) ->
      res.send err or results[0]
  create: (req, res) ->
    payload = if req.params.user then {userId: Number(req.params.user), bookId: Number(req.body.bookId)} else {userId: Number(req.body.userId), bookId: Number(req.params.book)}
    con.query "INSERT INTO reservations SET ?", payload, (err, results) ->
      unless err then con.query "SELECT #{modelStr} FROM reservations WHERE id = ?", results.insertId, (err, results) ->
        res.send err or results[0]
      else res.send err
  update: (req, res) ->
    res.send 200
  destroy: (req, res) ->
    con.query "DELETE FROM reservations WHERE id = ? AND #{req.context}Id = ?", [Number(req.params.reservation),Number(req.params[req.context])], (err, results) ->
      res.send err or res.send(200)
      
auth = (req, res, next) ->
  if req.session.user and req.session.user.admin is 1 then next() else res.send(401)