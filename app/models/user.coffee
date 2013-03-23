attr = DS.attr

User = DS.Model.extend # set up the user properties in out data store
  username: attr "string"
  password: attr "string"
  firstname: attr "string"
  lastname: attr "string"
  email: attr "string"
  admin: attr "boolean"
.reopen
  url: "resources/users"  # set the users url

User.extend Ember.Validations, # add on validations
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