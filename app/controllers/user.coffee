class UserView extends Spine.Controller
  tag: "li"
  panelTmpl: require("views/user/panel")

  constructor: ->
    super
    @user.bind 'update', @render
    @user.bind 'destroy', @release

  render: =>
    @html require("views/user/list")(@user)
    if @el.hasClass("active")

      @renderPanel()

      @user.getReservations (data) =>
        @user.reservations = data 
        @renderPanel()
      @user.getLoans (data) => 
        @user.loans = data
        @renderPanel()

      @panel.find(".save").click @save
      @panel.find(".destroy").click => @user.destroy()
    @

  renderPanel: -> @panel.html @panelTmpl @user

  save: =>
    for prop,i of @user.attributes() when prop isnt "id"
      @user[prop] = @panel.find(".#{prop}").val()
    @user.save()

module.exports = UserView