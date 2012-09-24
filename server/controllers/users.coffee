mysql = require 'mysql'
con = mysql.createConnection mysql.con
model = ["userId","username","password","firstName","lastName","email","admin"]
modelStr = model.join(',')

module.exports =
  index: (req, res) ->
    con.query "SELECT #{modelStr} FROM users", (err, results) ->
      res.send err or results
  show: (req, res) ->
    con.query "SELECT #{modelStr} FROM users WHERE userId = ?", [Number req.params.user], (err, results) ->
      res.send err or results[0]
  create: (req, res) ->
    req.body.admin = Number req.body.admin
    con.query "INSERT INTO users SET ?", req.body, (err, results) ->
      res.send err or results
  update: (req, res) ->
    req.body.admin = Number req.body.admin
    con.query "UPDATE users SET ? WHERE userId = ? ", [req.body, Number req.params.user], (err, results) ->
      res.send err or results
  destroy: (req, res) ->
    con.query "DELETE FROM users WHERE userId = ?", [Number req.params.user], (err, results) ->
      res.send err or results