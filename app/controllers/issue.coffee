module.exports = Ember.ObjectController.extend
  userId: ""
  user: {}
  userError: ""
  bookId: ""
  uncommitted: Ember.A()
  bookError: ""
  selectUser: ->
    @set 'user', App.User.find Number @get 'userId'
    if @get("user").get("username") is null 
      @set("user",null)
      @set("userError","User not found!")
    else
      @set("uncommitted",Ember.A())
      @set 'userError',null
  selectBook: ->
    $.post "resources/books/lookup",{book: @get 'bookId'},(book) =>
      book.id = @get 'bookId'
      if not book.title
        @set("bookError","Book not found!")
      else 
        @set("bookError",null)
        @uncommitted.pushObject book
  issue: ->
    url = 
    for book in @uncommitted
      $.post "/resources/loans", {bookId: book.id, userId: @user.get('id')},=> @set "user", null
  cancel: ->
    @set("user",null)
  remove: (e) ->
    @uncommitted.popObject e