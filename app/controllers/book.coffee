class BookView extends Spine.Controller
  tag: "li"
  panelTmpl: require("views/book/panel")

  constructor: ->
    super
    @book.bind 'update', @render
    @book.bind 'destroy', @release

  render: =>
    @html require("views/book/list")(@book)
    if @el.hasClass("active")

      @renderPanel()

      @book.getReservations (data) =>
        @book.reservations = data 
        @renderPanel()
      @book.getLoans (data) => 
        @book.loans = data
        @renderPanel()
    @

  renderPanel: -> 
    @panel.html @panelTmpl @book

    $("#datepicker",@panel).datepicker format: "dd-mm-yyyy"

    $(".save",@panel).click @save
    $(".destroy",@panel).click => @book.destroy()

  save: =>
    for prop,i of @book.attributes() when prop isnt "id"
      @book[prop] = @panel.find(".#{prop}").val()
    @book.save()

module.exports = BookView