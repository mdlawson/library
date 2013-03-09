matchers = require "matchers"

module.exports = Ember.ArrayController.extend
  query: ""
  filtered: (->
    val = @get("query")
    content = @get("content").toArray()
    rankings = []
    results = []
    unless val.length then return content
    if not isNaN(parseInt val) and isFinite val
      val = Number val
      for item in content
        if item.get("id") is val then return [item]
      return []
    else
      if val.length > 10 then matcher = matchers.levenshtein else matcher = matchers.strScore
      for item in content
        score = []
        for string in [item.get("username"),item.get("email") or "",item.get("firstname"),item.get("lastname")]
          score.push matcher.score string, val
        score.sort matcher.sort
        if matcher.valid score[0] then rankings.push [score[0],item]
      rankings.sort (a,b) -> matcher.sort a[0],b[0]
      for item in rankings
        results.push item[1]
      return results
  ).property 'content.isLoaded','query'
