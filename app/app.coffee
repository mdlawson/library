window.App = class Library extends Batman.App
  @root 'App#index'
  @on 'ready', ->
    console.log "App ready"

  AppController = class Library.AppController extends Batman.Controller
    index: ->
      $.post('/login', (data) -> Library.user = data).error(->
        )