Book = require "models/book"

class CatalogueManager extends Spine.Controller
  el: "#content"

  activate: ->
    @el.addClass("catalogue")
    @render()

  deactivate: ->
    @el.removeClass("catalogue")

  render: ->
    @html require("views/catalogue")()

module.exports = CatalogueManager