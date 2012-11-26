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
    threshold = 0.5
    unless val then return data

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
    User.unbind "refresh", @render
    if @list
      @list.empty()
      @addUser user for user in @filter()
      @list.children(":first").click()
    

module.exports = UserManager