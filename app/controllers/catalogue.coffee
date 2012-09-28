class CatalogueManager extends Spine.Controller
  el: "#content"

  activate: ->
    @render()

  render: ->
    @html require("views/catalogue")()

module.exports = CatalogueManager