attr = DS.attr
User = DS.Model.extend
  username: attr "string"
  password: attr "string"
  firstname: attr "string"
  lastname: attr "string"
  email: attr "string"
  admin: attr "boolean"
.reopen
  url: "resources/users"

User.extend Ember.Validations,
  validations:
    username:
      presence: true
    password:
      presence: true
    firstname:
      presence: true
    lastname:
      presence: true
    email:
      format: /.+@.+\..{2,4}/

module.exports = User