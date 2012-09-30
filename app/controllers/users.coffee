class UserManager extends Spine.Controller
  el: "#content"

  activate: ->
    @render()

  render: ->
    @html require("views/users")()

module.exports = UserManager