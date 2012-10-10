Book = require "models/book"
BookView = require "controllers/book"

class CatalogueManager extends Spine.Controller
  el: "#content"

  routes:
    '/catalogue/:id': (params) ->
      Book.find(params.id).el.click()

  elements:
    '#list': 'list'
    '#panel': 'panel'
    '#searchbox': 'search'

  events:
    'keyup #searchbox': 'input'
    'click #new': 'new'

  constructor: ->
    super
    Book.bind 'create', @addBook
    Book.bind 'refresh change', @render

  activate: ->
    @el.addClass("catalogue")
    @html require("views/panelView")()
    Book.fetch()
    #@render()

  deactivate: ->
    @el.removeClass("catalogue")

  addBook: (book) =>
    view = new BookView book: book, panel: @panel
    el = view.render().el
    el.click =>
      @list.children().each -> $(@).removeClass("active")
      el.addClass("active")
      view.render()

    @list.append el
    el

  new: ->
    book = new Book({title: "[Untitled]",author:"",date:"",ISBN:"",description:""})
    @addBook(book).click()


  input: (e) ->
    if e.which is 13 then @render()

  filter: ->
    val = @search.val()
    data = Book.all()
    rankings = []
    results = []
    threshold = 0.5
    unless val then return data

    if val.length is 13 and not isNaN(parseInt val) and isFinite val
      for item in data when item.ISBN is val
        results.push item
    else
      for item in data
        score = item.title.score(val)
        score2 = item.author.score(val)
        if score2 > score then score = score2
        if score > threshold
          rankings.push [score,item]
      rankings.sort (a,b) ->  b[0] - a[0]
      for item in rankings
        results.push item[1]
    return results


  render: =>
    if @list
      @list.empty()
      books = @filter()
      @addBook book for book in books
      unless books.length then @panel.html("")
      @list.children(":first").click()
    

module.exports = CatalogueManager