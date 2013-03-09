module.exports = 
  levenshtein:
    score: (a,b) -> 
      L1 = a.length
      L2 = b.length
      if L1 is 0
        return L2
      else if L2 is 0
        return L1
      else return 0  if a is b
      v0 = new Array(L1 + 1)
      v1 = new Array(L1 + 1)
      i = 0
      while i < L1 + 1
        v0[i] = i
        i++
      j = 1
      while j <= L2
        v1[0] = j
        i = 0
        while i < L1
          cost = (if (a[i] is a[j - 1]) then 0 else 1)
          a = v0[i + 1] + 1
          b = v1[i] + 1
          c = v0[i] + cost
          v1[i + 1] = (if a < b then (if a < c then a else c) else (if b < c then b else c))
          i++
        v_tmp = v0
        v0 = v1
        v1 = v_tmp
        j++
      v0[L1]
    sort: (a,b) ->  a - b
    valid: (a) -> if a < 6 then return true else return false
  strScore:
    score: (a,b) -> a.score b,0.5
    sort: (a,b) -> b - a
    valid: (a) -> if a > 0.2 then return true else return false
