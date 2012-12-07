User = require "models/user"
UserView = require "controllers/user"

class UserManager extends Spine.Controller
  el: "#users"

  elements:
    '.list': 'list'
    '.panel': 'panel'
    '.search-query': 'search'

  events:
    'keyup .search-query': 'input'
    'click .new': 'new'

  constructor: ->
    super
    @html require("views/panelView")()
    User.bind 'create', @addUser
    User.bind 'refresh change', @render

  activate: ->
    @el.addClass("visible")
    User.fetch()
    #@render()

  deactivate: ->
    @el.removeClass("visible")

  addUser: (user) =>
    view = new UserView user: user, panel: @panel
    el = view.render().el
    el.click =>
      @list.children().each -> $(@).removeClass("active")
      el.addClass("active")
      view.render()

    @list.append el
    el

  new: ->
    user = new User({username: "[New User]",firstName:"",lastName:"",email:"",admin:false,password:""})
    @addUser(user).click()


  input: (e) ->
    if e.which is 13 then @render()

  filter: ->
    val = @search.val()
    data = User.all()
    rankings = []
    results = []
    unless val then return data
    else if val.length > 10 then matcher = @matchers.levenshtein else matcher = @matchers.strScore
    for item in data
      score = []
      for string in [item.firstName, item.lastName, item.email]
        score.push matcher.score string, val
      score.sort matcher.sort
      if matcher.valid score[0] then rankings.push [score[0],item]
    rankings.sort (a,b) -> matcher.sort a[0],b[0]
    for item in rankings
      results.push item[1]
    return results

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
    User.unbind "refresh", @render
    if @list
      @list.empty()
      @addUser user for user in @filter()
      @list.children(":first").click()
    

module.exports = UserManager