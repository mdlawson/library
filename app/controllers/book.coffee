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
          @book.reservations = @book.reservations.concat data 
          @renderPanel()
        book.getLoans (data) =>
          @book.loans = @book.loans.concat data
          @renderPanel()

    @

  renderPanel: -> 
    @panel.html @panelTmpl @book

    #$(".datepicker",@panel).datepicker format: "dd-mm-yyyy"
    $(".save",@panel).click @save
    $(".destroy",@panel).popover
      title: "Really?"
      content: require("views/book/tooltip")

    $(".destroy",@panel).click => 
      $(".popover .really-destroy").click => 
        @book.destroy()
        $(".destroy",@panel).popover("hide")
      $(".popover .cancel").click => $(".destroy",@panel).popover("hide")

  save: =>
    $(".save",@panel).button "loading"
    for prop,i of @book.attributes() when prop isnt "id"
      @book[prop] = $("form .#{prop}",@panel).val()
    saved = =>
      setTimeout =>
        @book.unbind "create update", saved
        $(".save",@panel).button "complete"
        setTimeout -> 
          $(".save",@panel).button "reset"
        ,2000
      ,100 # FUGLY FUCKED UP SHIT
    @book.bind "create update", saved
    @book.save()

module.exports = BookView