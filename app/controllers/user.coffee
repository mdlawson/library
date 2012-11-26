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

  renderPanel: ->
    @panel.html @panelTmpl @user
    val = if @user.admin then "1" else "0"
    $("form button[value=#{val}]").addClass "active"

    $(".save",@panel).click @save
    $(".destroy",@panel).click => @user.destroy()

  save: =>
    $(".save",@panel).button "loading"
    for prop,i of @user.attributes() when prop isnt "id"
      @user[prop] = $("form input.#{prop}",@panel).val() or i
    @user.admin = $('form button[name="type"].active',@panel).val()
    console.log @user
    saved = =>
      setTimeout =>
        @user.unbind "create update", saved
        $(".save",@panel).button "complete"
        setTimeout -> 
          $(".save",@panel).button "reset"
        ,2000
      ,100 # FUGLY FUCKED UP SHIT
    @user.bind "create update", saved
    @user.save()

module.exports = UserView