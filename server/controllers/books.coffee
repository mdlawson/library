mysql = require 'mysql' 
con = mysql.createConnection mysql.con # create a mysql connection
model = ["id","isbn","title","author","description","date","dewey"] # our database column names
modelStr = model.join(',') # a stringified version for selecting


auth = (req, res, next) -> # check if the current request is authorized, if so, pass on to the next handler. otherwise send 401
  if req.session.user and req.session.user.admin is 1 then next() else res.send(401)

lookup = (req,res) -> # lookup the book given by a request with a "book" property in its body
  con.query "SELECT ISBN FROM libraryBooks WHERE id = ?",Number(req.body.book),(err,results) -> # find the books isbn
    unless err or not results.length then con.query "SELECT #{modelStr} FROM books WHERE isbn = ?",results[0].ISBN,(err,results) -> # use the found isbn to find the books info
      unless err then res.send results[0] # send the results or any errors
      else res.send err
    else 
      res.send err

module.exports =
  options:
    name: 'resources/books' # url this resource is found on
    id: 'book' # name given to query ids
    before: # before CUD, auth
      create: auth
      update: auth
      destroy: auth

  index: (req, res) -> # index: returns all the books or any error
    con.query "SELECT #{modelStr} FROM books", (err, results) ->
      res.send err or {books: results}
  show: (req, res) -> # show: select a book by the id in the parameters, sends the found book or an error
    con.query "SELECT #{modelStr} FROM books WHERE id = ?", Number(req.params.book), (err, results) ->
      res.send err or {book: results[0]}
  create: (req, res) -> # create: create a book from the data in the request body
    if req.body.book.title is "" and req.body.book.isbn isnt ""
      console.log "not implemented"
    #console.log req.body.book
    req.body.book.date = new Date req.body.book.date # make a date our of the date string we receive 
    con.query "INSERT INTO books SET ?", req.body.book, (err, results) -> # insert into the books table
      unless err then con.query "SELECT #{modelStr} FROM books WHERE isbn = ?", req.body.book.isbn, (err, results) -> # retrieve newly inserted book
        unless err then con.query "INSERT INTO librarybooks SET ?",{ISBN:req.body.book.isbn},(err,results2) -> # make a new copy in the library books table
          res.send err or {book: results[0]} # send the resulting book to the client, or any error
        else
          res.send err
      else 
        #console.log err
        res.send err
  update: (req, res) -> # update: update a book given by the request params with the data in the request body
    if req.body.book.date then req.body.book.date = new Date req.body.book.date # make a date from the date string we receive
    #console.log req.body.book
    con.query "UPDATE books SET ? WHERE id = ?", [req.body.book, Number req.params.book], (err, results) -> # update book with given id
      unless err then con.query "SELECT #{modelStr} FROM books WHERE id = ?", Number(req.params.book), (err, results) -> # retrieve updated book
        #console.log err
        res.send err or 200#results[0] # send result to client, or error if any occurred
      else 
        #console.log err
        res.send err
  destroy: (req, res) -> # destroy: remove book at given url
    con.query "DELETE FROM books WHERE id = ?", Number(req.params.book), (err, results) -> # delete book with given id
      res.send err or 200 # send 200 if deleted, else error
  return: (req, res) -> # return book given by "book" property in body
    con.query "UPDATE loans SET returned = 1 WHERE bookId = ? AND returned = 0", [Number req.body.book], (err, results) -> # update the loans table to set returned to 1 for this book
      unless err then lookup req,res # lookup the books info to send that back to the client, unless there was an error, then send that
      else res.send err 
  copies: (req,res) -> # find all the copies of a given book with "isbn" property in body
    con.query "SELECT id FROM librarybooks WHERE ISBN = ?", req.body.ISBN, (err,results) -> # select all books with given isbn
      unless err
        ids = [] 
        ids.push r.id for r in results # push all the result ids into a new array
        res.send ids # send the array or an error
      else res.send err
  add: (req,res) -> # add a new copy of a book with "isbn" propery in body
    con.query "INSERT INTO librarybooks SET ?",{ISBN:req.body.ISBN},(err,results) -> # insert a new copy into the librarybooks table
      res.send err or 200 # send 200 if it went ok, or error
  lookup: lookup # use lookup function above for requests to lookup
