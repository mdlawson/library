matchers = require "matchers"

module.exports = Ember.ArrayController.extend
  query: ""
  filtered: (->
    val = @get("query")
    content = @get("content").toArray() # get the models as an array
    rankings = []
    results = []
    unless val.length then return content # if no query, return all items
    if not isNaN(parseInt val) and isFinite val # if query is a number, search ids
      val = Number val
      for item in content
        if item.get("id") is val then return [item] # return the user with the given id
      return []
    else
      if val.length > 10 then matcher = matchers.levenshtein else matcher = matchers.strScore  # use levensteins distance for long querys, for short ones use strScore
      for item in content # for each user
        score = []
        for string in [item.get("username"),item.get("email") or "",item.get("firstname"),item.get("lastname")] 
          score.push matcher.score string, val # score query against username, email, firstname and lastname
        score.sort matcher.sort # sort scores
        if matcher.valid score[0] then rankings.push [score[0],item] # push highest score to rankings, provided it meets some threshold
      rankings.sort (a,b) -> matcher.sort a[0],b[0] # sort rankings
      for item in rankings
        results.push item[1] # push matches to results
      return results # return filtered results
  ).property 'content.isLoaded','query' # depends on content being loaded and the query
