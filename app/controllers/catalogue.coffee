Book = require "models/book"
BookView = require "controllers/book"
levenshtein = require("util").levenshtein
strScore = require("util").strScore

class CatalogueManager extends Spine.Controller
  el: "#catalogue"

  routes:
    '/catalogue/:id': (params) ->
      Book.find(params.id).el.click()

  elements:
    '.list': 'list'
    '.panel': 'panel'
    '.search-query': 'search'

  events:
    'keyup .search-query': 'input'
    'click .new': 'new'

  constructor: ->
    # @input = @render.throttle 2000
    # @input = @render.lazy 2000, 3
    super

    @html require("views/panelView")()
    Book.bind 'create', @addBook
    Book.bind 'refresh change', @render

  activate: ->
    @el.addClass("visible advanced")
    Book.fetch()
    #@render()

  deactivate: ->
    @el.removeClass("visible advanced")

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


  filter: (done) ->
    val = @search.val()
    data = Book.all()
    rankings = []
    results = []
    unless val then return data.unique("ISBN")
    if val.length is 13 and not isNaN(parseInt val) and isFinite val
      for item in data when item.ISBN is val
        results.push item
    else if val.length > 10 then matcher = @matchers.levenshtein else matcher = @matchers.strScore
    for item in data
      score = []
      author = item.author.split " "
      for string in author.concat item.title
        score.push matcher.score string, val
      score.sort matcher.sort
      if matcher.valid score[0] then rankings.push [score[0],item]
    rankings.sort (a,b) -> matcher.sort a[0],b[0]
    for item in rankings
      results.push item[1]
    return results.unique("ISBN")

  matchers:
    levenshtein:
      score: (a,b) -> levenshtein a,b
      sort: (a,b) ->  a - b
      valid: (a) -> if a < 6 then return true else return false
    strScore:
      score: (a,b) -> a.score b,0.5
      sort: (a,b) -> b - a
      valid: (a) -> if a > 0.2 then return true else return false

  render: =>
    Book.unbind "refresh", @render
    if @list
      books = @filter()
      @list.empty()
      @addBook book for book in books
      unless books.length then @panel.html("")
      @list.children(":first").click()
  

module.exports = CatalogueManager