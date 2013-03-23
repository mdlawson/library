matchers = require "matchers"

module.exports = Ember.ArrayController.extend
  query: ""
  filtered: (->
    val = @get("query")
    content = @get("content").toArray() # get the models as an array
    rankings = []
    results = []
    unless val.length then return content # if no query, return all items
    if val.length is 13 and not isNaN(parseInt val) and isFinite val # if the query is a number of length 13, use as isbn
      for item in content
        if item.get("isbn") is val then return [item] # return the book with the query isbn if found
      return []
    else
    # else
    #   for item in content
    #     author = item.get("author").split(" ")
    #     if item.get("title") is val or author[0] is val or author[1] is val then results.push item
      if val.length > 10 then matcher = matchers.levenshtein else matcher = matchers.strScore # use levensteins distance for long querys, for short ones use strScore
      for item in content # for each book
        score = []
        author = item.get("author").split " " 
        for string in author.concat item.get("title") # for each item in authors firstname, authors lastname, and the title
          score.push matcher.score string, val # score the item with the query
        score.sort matcher.sort # sort the scores
        if matcher.valid score[0] then rankings.push [score[0],item] # take the highest one and add it to the rankings, provided it is over some threshold
      rankings.sort (a,b) -> matcher.sort a[0],b[0] # sort the rankings
      for item in rankings
        results.push item[1] # add rankings items to results
      return results # return filtered results
    #@get("content")
  ).property 'content.isLoaded','query' # depends on the content being loaded and the query
  admin: (->
      return if App.SessionManager.get('currentState.name') is "admin" then true else false # return true if the current state is admin, else false
    ).property("App.SessionManager.currentState") # property depends on current state
