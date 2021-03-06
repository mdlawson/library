module.exports =
  levenshtein: (s1, s2) ->
    L1 = s1.length
    L2 = s2.length
    if L1 is 0
      return L2
    else if L2 is 0
      return L1
    else return 0  if s1 is s2
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
        cost = (if (s1[i] is s2[j - 1]) then 0 else 1)
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
  strScore: (string, abbreviation, fuzziness) ->
    
    # If the string is equal to the abbreviation, perfect match.
    return 1  if this is abbreviation
    
    #if it's not a perfect match and is empty return 0
    return 0  if abbreviation is ""
    total_character_score = 0
    abbreviation_length = abbreviation.length
    string_length = string.length
    fuzzies = 1
    
    # Walk through abbreviation and add up scores.
    i = 0

    while i < abbreviation_length
      
      # Find the first case-insensitive match of a character.
      c = abbreviation.charAt(i)
      index_c_lowercase = string.indexOf(c.toLowerCase())
      index_c_uppercase = string.indexOf(c.toUpperCase())
      min_index = Math.min(index_c_lowercase, index_c_uppercase)
      index_in_string = (if (min_index > -1) then min_index else Math.max(index_c_lowercase, index_c_uppercase))
      if index_in_string is -1
        if fuzziness
          fuzzies += 1 - fuzziness
          continue
        else
          return 0
      else
        character_score = 0.1
      
      # Set base score for matching 'c'.
      
      # Same case bonus.
      character_score += 0.1  if string[index_in_string] is c
      
      # Consecutive letter & start-of-string Bonus
      if index_in_string is 0
        
        # Increase the score when matching first character of the remainder of the string
        character_score += 0.6
        
        # If match is the first character of the string
        # & the first character of abbreviation, add a
        # start-of-string match bonus.
        start_of_string_bonus = 1  if i is 0 #true;
      else
        
        # Acronym Bonus
        # Weighing Logic: Typing the first character of an acronym is as if you
        # preceded it with two perfect character matches.
        character_score += 0.8  if string.charAt(index_in_string - 1) is " " # * Math.min(index_in_string, 5); // Cap bonus at 0.4 * 5
      
      # Left trim the already matched part of the string
      # (forces sequential matching).
      string = string.substring(index_in_string + 1, string_length)
      total_character_score += character_score
      ++i
    # end of for loop
    
    # Uncomment to weigh smaller words higher.
    # return total_character_score / string_length;
    abbreviation_score = total_character_score / abbreviation_length
    
    #percentage_of_matched_string = abbreviation_length / string_length;
    #word_score = abbreviation_score * percentage_of_matched_string;
    
    # Reduce penalty for longer strings.
    #final_score = (word_score + abbreviation_score) / 2;
    final_score = ((abbreviation_score * (abbreviation_length / string_length)) + abbreviation_score) / 2
    final_score = final_score / fuzzies
    final_score += 0.15  if start_of_string_bonus and (final_score + 0.15 < 1)
    final_score