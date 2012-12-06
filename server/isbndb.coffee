http = require 'http'
xml2js = require 'xml2js'
class ISBNDB
  constructor: (@apikey) ->
    @parser = new xml2js.Parser()
  lookup: (type, ISBN, callback) ->
    http.get "http://isbndb.com/api/books.xml?access_key=#{@apikey}&index1=isbn&value1=#{ISBN}&results=#{type}", (res) ->
      @parser.parseString res.data, (err, result) ->
        console.log result