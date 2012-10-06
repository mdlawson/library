class BookView extends Spine.Controller
  tag: "li"

  constructor: ->
    super
    @book.bind 'update', @render
    @book.bind 'destroy', @release

  render: =>
    @html require("views/book/list")(@book)
    if @el.hasClass("active")
      @panel.html require("views/book/panel")(@book)
      @panel.find(".save").click @save
      @panel.find(".destroy").click => @book.destroy()
    @

  save: =>
    for prop,i of @book.attributes() when prop isnt "id"
      @book[prop] = @panel.find(".#{prop}").val()
    @book.save()

module.exports = BookView