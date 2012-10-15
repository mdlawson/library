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

      @book.copies = @book.constructor.all().findAll (i) => i.ISBN is @book.ISBN 
      @book.reservations = []
      @book.loans = []

      @renderPanel()

      for book in @book.copies
        book.getReservations (data) =>
          @book.reservations.concat data 
          @renderPanel()
        book.getLoans (data) => 
          @book.loans.concat data
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