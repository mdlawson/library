attr = DS.attr

Book = DS.Model.extend
  isbn: attr "string"
  title: attr "string"
  author: attr "string"
  description: attr "string"
  date: attr "string"
  dewey: attr "string"
.reopen
  url: "resources/books"

Book.extend Ember.Validations,
  validations:
    title:
      presence: true
    author:
      presence: true
    isbn:
      isISBN: (obj,attr,val) -> true
    

module.exports = Book