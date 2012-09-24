mysql = require 'mysql'
con = mysql.createConnection mysql.con
model = ["userId","bookId","reservationId","date"]
modelStr = model.join(',')

module.exports =
  index: (req, res) ->
    con.query "SELECT #{modelStr} FROM reservations", (err, results) ->
      res.send err or results
  show: (req, res) ->
    con.query "SELECT #{modelStr} FROM books WHERE reservationId = ?", [Number req.params.reservation], (err, results) ->
      res.send err or results[0]
  create: (req, res) ->
    con.query "INSERT INTO reservations SET ?", {userId: Number(req.body.userId), bookId: Number(req.body.bookId)}, (err, results) ->
      res.send err or results
  update: (req, res) ->
    req.body.userId = Number req.body.userId
    req.body.bookId = Number req.body.bookId
    con.query "UPDATE reservations SET ? WHERE reservationId = ? ", [req.body, Number req.params.reservation], (err, results) ->
      res.send err or results
  destroy: (req, res) ->
    con.query "DELETE FROM reservations WHERE reservationId = ?", [Number req.params.reservation], (err, results) ->
      res.send err or results