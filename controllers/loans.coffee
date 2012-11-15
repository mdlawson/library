mysql = require 'mysql'
con = mysql.createConnection mysql.con
model = ["userId","bookId","id","date","due","returned"]
modelStr = model.join(',')

module.exports =
  all: (req, res, next) ->
    req.context = if req.params.user then "user" else "book"
    next()
  index: (req, res) ->
    con.query "SELECT #{modelStr} FROM loans WHERE #{req.context}Id = ? AND returned = 0", [Number req.params[req.context]], (err, results) ->
      res.send err or results
  show: (req, res) ->
    con.query "SELECT #{modelStr} FROM loans WHERE id = ? AND #{req.context}Id = ?", [Number(req.params.loan),Number(req.params[req.context])], (err, results) ->
      res.send err or results[0]
  create: (req, res) ->
    payload = if req.params.user then {userId: Number(req.params.user), bookId: Number(req.body.bookId)} else {userId: Number(req.body.userId), bookId: Number(req.params.book)}
    con.query "INSERT INTO loans SET ?", payload, (err, results) ->
      unless err then con.query "SELECT #{modelStr} FROM loans WHERE id = ?", results.insertId, (err, results) ->
        res.send err or results[0]
      else res.send err
  update: (req, res) ->
    con.query "UPDATE loans SET ? WHERE id = ?", [req.body, Number req.params.loan], (err, results) ->
      unless err then con.query "SELECT #{modelStr} FROM loans WHERE id = ?", Number(req.params.loan), (err, results) ->
        res.send err or results[0]
      else res.send err
  destroy: (req, res) ->
    con.query "DELETE FROM loans WHERE id = ? AND #{req.context}Id = ?", [Number(req.params.loan),Number(req.params[req.context])], (err, results) ->
      res.send err or res.send(200)
      
auth = (req, res, next) ->
  if req.session.user and req.session.user.admin is 1 then next() else res.send(401)