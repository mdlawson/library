attr = DS.attr
module.exports = DS.Model.extend
  username: attr "string"
  password: attr "string"
  firstname: attr "string"
  lastname: attr "string"
  email: attr "string"
  admin: attr "boolean"
.reopen
  url: "resources/users"