mysql = require 'mysql'
bcrypt = require 'bcrypt'
con = mysql.createConnection mysql.con
model = ["id","username","password","firstName","lastName","email","admin"]
modelStr = model.join(',')

module.exports =
  options:
    name: 'resources/users'
    id: 'user'
  all: (req, res, next) ->
    if req.session.user and (req.session.user.admin is 1 or req.session.user.id is req.params.user) then next() else res.send(401)
  index: (req, res) ->
    con.query "SELECT #{modelStr} FROM users", (err, results) ->
      res.send err or results
  show: (req, res) ->
    con.query "SELECT #{modelStr} FROM users WHERE id = ?", [Number req.params.user], (err, results) ->
      res.send err or results[0]
  create: (req, res) ->
    req.body.admin = Number req.body.admin
    req.body.password = bcrypt.hashSync req.body.password, 10
    console.log req.body
    con.query "INSERT INTO users SET ?", req.body, (err, results) ->
      unless err then con.query "SELECT #{modelStr} FROM users WHERE id = ?", results.insertId, (err, results) ->
        res.send err or results[0]
      else res.send err
  update: (req, res) ->
    if req.body.admin then req.body.admin = Number req.body.admin
    if req.body.password then req.body.password = bcrypt.hashSync req.body.password, 10
    console.log req.body
    con.query "UPDATE users SET ? WHERE id = ? ", [req.body, Number req.params.user], (err, results) ->
      unless err then con.query "SELECT #{modelStr} FROM users WHERE id = ?", Number(req.params.user), (err, results) ->
        res.send err or results[0]
      else res.send err
  destroy: (req, res) ->
    con.query "DELETE FROM users WHERE id = ?", [Number req.params.user], (err, results) ->
      res.send err or res.send(200)
  login: (req, res) ->
    if req.session.user
      req.session.user.reauth = true
      res.send req.session.user 
    else # quick exit for already authed users
      con.query "SELECT #{modelStr} FROM users WHERE username = ?", [req.body.username], (err, results) ->
        if results.length #and bcrypt.compareSync req.body.password, results[0].password
          user = results[0]
          req.session.user =
            id: user.id
            admin: user.admin
          res.send req.session.user
        else
          res.send(401)
  logout: (req, res) ->
    req.session.user = null
    res.render("index")
