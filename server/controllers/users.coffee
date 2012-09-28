mysql = require 'mysql'
con = mysql.createConnection mysql.con
model = ["userId","username","password","firstName","lastName","email","admin"]
modelStr = model.join(',')

module.exports =
  options:
    name: 'resources/users'
    id: 'user'
  all: (req, res, next) ->
    console.log req.session
    if req.session.user and (req.session.user.admin is 1 or req.session.user.id is req.params.user) then next() else res.send(401)
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
  login: (req, res) ->
    if req.session.user then res.send req.session.user else # quick exit for already authed users
      con.query "SELECT #{modelStr} FROM users WHERE username = ? AND password = ?", [req.body.username, req.body.password], (err, results) ->
        if results.length
          user = results[0]
          req.session.user =
            id: user.userId
            admin: user.admin
          res.send req.session.user
        else
          res.send(401)
  logout: (req, res) ->
    req.session.user = null
    res.send(200)
