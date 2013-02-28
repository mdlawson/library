attr = DS.attr
module.exports = DS.Model.extend
  isbn: attr "string"
  title: attr "string"
  author: attr "string"
  description: attr "string"
  date: attr "string"
  dewey: attr "string"
.reopen
  url: "resources/books"