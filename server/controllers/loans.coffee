mysql = require 'mysql'
con = mysql.createConnection mysql.con
model = ["userId","bookId","id","date","due","returned"]
modelStr = model.join(',')


auth = (req, res, next) ->
  if req.session.user and req.session.user.admin is 1 then next() else res.send(401)

module.exports =
  options:
    name: 'resources/loans'
    id: 'loan'
    # before:
    #   create: auth
    #   update: auth
    #   destroy: auth
  index: (req, res) ->
    con.query "SELECT #{modelStr} FROM loans", (err, results) ->
      res.send err or results
  show: (req, res) ->
    con.query "SELECT #{modelStr} FROM loans WHERE id = ?", Number(req.params.loan), (err, results) ->
      res.send err or results[0]
  create: (req, res) ->
    con.query "INSERT INTO loans SET ?", {userId: Number(req.body.userId), bookId: Number(req.body.bookId)}, (err, results) ->
      unless err then con.query "SELECT #{modelStr} FROM loans WHERE id = ?", results.insertId, (err, results) ->
        res.send err or results[0]
      else res.send err
  update: (req, res) ->
    con.query "UPDATE loans SET ? WHERE id = ?", [req.body, Number req.params.loan], (err, results) ->
      unless err then con.query "SELECT #{modelStr} FROM loans WHERE id = ?", Number(req.params.loan), (err, results) ->
        res.send err or results[0]
      else res.send err
  destroy: (req, res) ->
    con.query "DELETE FROM loans WHERE id = ?", Number(req.params.loan), (err, results) ->
      res.send err or res.send(200)
  query: (req,res) ->
    if req.body.ISBN 
      con.query "SELECT id FROM librarybooks WHERE ISBN = ?", req.body.ISBN, (err,results) ->
        unless err
          ids = []
          ids.push r.id for r in results
          con.query "SELECT #{modelStr} FROM loans WHERE bookId IN (?)",ids,(err,results) ->
            res.send err or results 
        else res.send err
    else
      con.query "SELECT #{modelStr} FROM loans WHERE userId = ?", Number(req.body.userId), (err, results) ->
        res.send err or results  

