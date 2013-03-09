module.exports = Ember.ArrayController.extend
  query: ""
  filtered: (->
    val = @get("query")
    content = @get("content").toArray()
    #rankings = []
    results = []
    unless val then return content
    if val.length is 13 and not isNaN(parseInt val) and isFinite val
      for item in content
        if item.get("isbn") is val then results.push item
    else
      for item in content
        author = item.get("author").split(" ")
        if item.get("title") is val or author[0] is val or author[1] is val then results.push item
    # else if val.length > 10 then matcher = matchers.levenshtein else matcher = matchers.strScore
    # content.forEach (item) ->
    #   score = []
    #   author = item.get("author").split " "
    #   for string in author.concat item.get("title")
    #     score.push matcher.score string, val
    #   score.sort matcher.sort
    #   if matcher.valid score[0] then rankings.push [score[0],item]
    # rankings.sort (a,b) -> matcher.sort a[0],b[0]
    # for item in rankings
    #   results.push item[1]
    return results
    #@get("content")
  ).property 'content.isLoaded','query'
  admin: (->
      return if App.SessionManager.get('currentState.name') is "admin" then true else false
    ).property("App.SessionManager.currentState")
