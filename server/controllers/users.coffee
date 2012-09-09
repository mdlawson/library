db = require('sequelize').db
User = db.models.User

module.exports =
  index: (req, res) ->
    User.all().success (users) ->
      res.send users
  show: (req, res) ->
    User.find(Number req.params.user).success (user) ->
      res.send user
    #res.send "user: " + req.params.user
  new: (req, res) ->
    res.send "new user"
  create: (req, res) ->
    console.log req
    User.create(
      username: req.body.username
      password: req.body.password
      admin: (req.body.admin is "true")
    ).success (user) ->
      res.send user
  edit: (req, res) ->
    res.send "edit user: " + req.params.user
  update: (req, res) ->
    User.find(Number req.params.user).success (user) ->
      if user
        user.username = req.body.username or user.username
        user.password = req.body.password or user.password
        if req.body.admin then user.admin = (req.body.admin is "true")
        user.save().success ->
          res.send user
    #res.send "update user: " + req.params.user
  destroy: (req, res) ->
    User.find(Number req.params.user).success (user) ->
      if user then user.destroy().success ->
        res.send('')
    #res.send "delete user: " + req.params.user