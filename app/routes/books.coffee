newBook = -> 
  App.Book.createRecord
    title: "Untitled"
    author: "Unauthored"
module.exports = 
  CatalogueRoute: Ember.Route.extend
    model: -> App.Book.find()
    renderTemplate: ->
      @render()
      #$("list").children(":first").click()
    events:
      new: -> newBook()

  BookRoute: Ember.Route.extend
    renderTemplate: ->
      @render 'catalogue'
        controller: @controllerFor "catalogue"
      @render
       into: 'catalogue'
      $("#bookModal").modal()
        
    model: (params) -> App.Book.find(params.book_id);
    events:
      save: ->
        @get("controller.model").transaction.commit()
      delete: ->
        model = @get("controller.model")
        model.deleteRecord()
        model.transaction.commit()
      new: -> newBook()