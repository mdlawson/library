mysql = require 'mysql'
con = mysql.createConnection mysql.con
model = ["userId","ISBN","id","date"]
modelStr = model.join(',')

auth = (req, res, next) ->
  if req.session.user and req.session.user.admin is 1 then next() else res.send(401)

module.exports =
  options:
    name: 'resources/reservations'
    id: 'reservation'
    # before:
    #   create: auth
    #   update: auth
    #   destroy: auth
  index: (req, res) ->
    con.query "SELECT #{modelStr} FROM reservations", (err, results) ->
      res.send err or results
  show: (req, res) ->
    con.query "SELECT #{modelStr} FROM reservations WHERE id = ?", Number(req.params.reservation), (err, results) ->
      res.send err or results[0]
  create: (req, res) ->
    con.query "INSERT INTO reservations SET ?", {userId: Number(req.body.userId), ISBN: req.body.ISBN}, (err, results) ->
      unless err then con.query "SELECT #{modelStr} FROM reservations WHERE id = ?", results.insertId, (err, results) ->
        res.send err or results[0]
      else res.send err
  update: (req, res) ->
    res.send 200
  destroy: (req, res) ->
    con.query "DELETE FROM reservations WHERE id = ?", Number(req.params.reservation), (err, results) ->
      res.send err or res.send(200)
  query: (req,res) ->
    column = if req.body.ISBN then "ISBN" else "userId"
    query = if req.body.ISBN then req.body.ISBN else Number req.body.userId
    con.query "SELECT #{modelStr} FROM reservations WHERE #{column} = ?", query, (err, results) ->
      res.send err or results   

      
