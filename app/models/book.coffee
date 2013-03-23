attr = DS.attr

Book = DS.Model.extend # set up the book properties in out data store
  isbn: attr "string"
  title: attr "string"
  author: attr "string"
  description: attr "string"
  date: attr "string"
  dewey: attr "string"
.reopen
  url: "resources/books" # set the books url

Book.extend Ember.Validations, # add on validations
  validations:
    title:
      presence: true
    author:
      presence: true
    isbn:
      isISBN: (obj,attr,val) -> true
    

module.exports = Book