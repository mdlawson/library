mysql = require 'mysql'
con = mysql.createConnection mysql.con # create mysql connection
model = ["userId","bookId","id","date","due","returned"] # our table columns
modelStr = model.join(',')


auth = (req, res, next) ->

module.exports =
  options:
    name: 'resources/loans' # url this resource is found on
    id: 'loan' # name given to query ids
    # before:
    #   create: auth
    #   update: auth
    #   destroy: auth
  all: (req,res,next) ->
    if req.session.user and req.session.user.admin is 1 then next() else res.send(401)
  index: (req, res) -> # index: returns all the loans or any error
    con.query "SELECT #{modelStr} FROM loans", (err, results) ->
      res.send err or results
  show: (req, res) -> # show: select a loan by the id in the parameters, sends the found loan or an error
    con.query "SELECT #{modelStr} FROM loans WHERE id = ?", Number(req.params.loan), (err, results) ->
      res.send err or results[0]
  create: (req, res) -> # create: create a loan from the data in the request body
    con.query "INSERT INTO loans SET ?", {userId: Number(req.body.userId), bookId: Number(req.body.bookId)}, (err, results) -> # insert into loans table
      unless err then con.query "SELECT #{modelStr} FROM loans WHERE id = ?", results.insertId, (err, results) -> # select newly inserted loan
        res.send err or results[0] # send any error or the new loan
      else res.send err
  update: (req, res) -> # update: update a loan given by the request params with the data in the request body
    con.query "UPDATE loans SET ? WHERE id = ?", [req.body, Number req.params.loan], (err, results) -> # update loan with given id
      unless err then con.query "SELECT #{modelStr} FROM loans WHERE id = ?", Number(req.params.loan), (err, results) -> # find updated loan
        res.send err or results[0] # send the updated loan or any errors
      else res.send err
  destroy: (req, res) -> # destroy: remove loan at given url
    con.query "DELETE FROM loans WHERE id = ?", Number(req.params.loan), (err, results) -> # delete loan with given id
      res.send err or res.send(200) # send 200 or any errors
  query: (req,res) -> # takes a request for an ISBN or for a userId and finds all the loans made for that ISBN or by that userId
    if req.body.ISBN 
      con.query "SELECT id FROM librarybooks WHERE ISBN = ?", req.body.ISBN, (err,results) -> # find ids of books with isbn
        unless err
          ids = []
          ids.push r.id for r in results
          if ids.length 
            con.query "SELECT #{modelStr} FROM loans WHERE bookId IN (?)",ids,(err,results) -> # select all loans for a book with id in the ids found
              res.send err or results # send the found loans or any error
          else res.send []
        else res.send err
    else
      con.query "SELECT #{modelStr} FROM loans WHERE userId = ?", Number(req.body.userId), (err, results) -> # or just select loans with given user id
        res.send err or results  # send found loans or any error

