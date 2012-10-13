Handlebars.registerHelper "Date", (date) ->
  date = Date.create(date)
  return date.format("{dd}-{MM}-{yyyy}")
