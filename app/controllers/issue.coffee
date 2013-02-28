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
    book = App.Book.find Number @get 'bookId'
    if book.get("title") is null
      @set("bookError","Book not found!")
    else 
      @set("bookError",null)
      @uncommitted.pushObject book
  issue: ->
    url = "#{@user.get('url')}/#{@user.get('id')}/loans"
    for book in @uncommitted
      $.post url, {bookId: book.get("id")},-> console.log "loaned"
  cancel: ->
    @set("user",null)