mysql = require 'mysql'
con = mysql.createConnection mysql.con # create the mysql connection
model = ["userId","ISBN","id","date"] # columns of table
modelStr = model.join(',')

auth = (req, res, next) ->
  if req.session.user and req.session.user.admin is 1 then next() else res.send(401)

module.exports =
  options:
    name: 'resources/reservations' # url this resource is found on
    id: 'reservation' # name given to query ids
  all: (req, res, next) ->
    if req.session.user and (req.session.user.admin is 1 or req.session.user.id is Number req.body.userId) then next() else res.send(401)
  index: (req, res) -> # index: return all reservations or any error
    con.query "SELECT #{modelStr} FROM reservations", (err, results) ->
      res.send err or results
  show: (req, res) -> # show: select a reservation given by the id in the parameters, sends the found reservation or any error
    con.query "SELECT #{modelStr} FROM reservations WHERE id = ?", Number(req.params.reservation), (err, results) ->
      res.send err or results[0]
  create: (req, res) -> # create: create a reservation from the data in the request 
    con.query "INSERT INTO reservations SET ?", {userId: Number(req.body.userId), ISBN: req.body.ISBN}, (err, results) -> # insert into reservations table
      unless err then con.query "SELECT #{modelStr} FROM reservations WHERE id = ?", results.insertId, (err, results) -> # select newly inserted reservation
        res.send err or results[0] # send found reservation or any error
      else res.send err
  update: (req, res) -> # no need to ever update reservations
    res.send 200
  destroy: (req, res) -> # destroy: remove reservation at url
    con.query "DELETE FROM reservations WHERE id = ?", Number(req.params.reservation), (err, results) -> # delete loan with given id
      res.send err or res.send(200) # send 200 if deleted or any error
  query: (req,res) -> # takes a request for an isbn or a userId and finds all reservations with that userId/isbn
    column = if req.body.ISBN then "ISBN" else "userId" # select column depending on what information was provided
    query = if req.body.ISBN then req.body.ISBN else Number req.body.userId # select query info depending on provided info again
    if req.session.user.admin is 0 and column is "userId" and req.session.user.id isnt query then return res.send 401
    con.query "SELECT #{modelStr} FROM reservations WHERE #{column} = ?", query, (err, results) -> # find all loans that match information
      res.send err or results # send matching reservations or any error

      
