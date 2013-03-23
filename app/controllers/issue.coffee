module.exports = Ember.ObjectController.extend
  userId: ""
  user: {}
  userError: ""
  bookId: ""
  uncommitted: Ember.A()
  bookError: ""
  selectUser: ->
    @set 'user', App.User.find Number @get 'userId' # find user with input Id
    if @get("user").get("username") is null # if no user was found
      @set("user",null) # null the current user
      @set("userError","User not found!") # set the error
    else
      @set("uncommitted",Ember.A()) # make fresh uncommitted array
      @set 'userError',null # null the error
  selectBook: -> # 
    $.post "resources/books/lookup",{book: @get 'bookId'},(book) => # lookup the input book id
      book.id = @get 'bookId' # set found book id to input id
      if not book.title # if no title, cant have found a book
        @set("bookError","Book not found!") # set error
      else 
        @set("bookError",null) # null error
        @uncommitted.pushObject book # add book to uncommitted
  issue: ->
    for book in @uncommitted # for each uncommitted book
      $.post "/resources/loans", {bookId: book.id, userId: @user.get('id')},=> @set "user", null # make a post to issue the book, then null the user, reseting the issue screen
  cancel: ->
    @set("user",null) # null user, resetting issue screen
  remove: (e) ->
    @uncommitted.popObject e # remove book from uncommitted