Book = require "models/book"
BookView = require "controllers/book"
Catalogue = require "controllers/catalogue"

class BasicCatalogue extends Catalogue
	constructor: ->
		super
		@render()
	render: ->
		@html require("views/basic")()
		console.log "basic render"

class BasicBookView extends BookView

module.exports = BasicCatalogue