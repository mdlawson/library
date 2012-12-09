{expect} = require 'chai'
mysql = require 'mysql'

describe "MySQL Database", ->
  con = null
  it "can be logged in", (done) ->
    con = mysql.createConnection require '../../server/db'
    con.connect (err) ->
      expect(err).to.not.exist
      done()
  it "can be queried", (done) ->
    con.query "show tables", (err, results) ->
      expect(err).to.not.exist
      expect(results).to.exist
      done()