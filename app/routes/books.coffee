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
      @get("controller").getReservations()
      @get("controller").getLoans()
      @get("controller").getCopies()
      @render 'catalogue'
        controller: @controllerFor "catalogue"
      @render
       into: 'catalogue'
      $("#bookModal").modal()
        
    model: (params) -> App.Book.find(params.book_id);
    events:
      save: ->
        model = @get("controller.model")
        #model.validate()
        #if model.get("isValid") then 
        model.transaction.commit()
      delete: ->
        model = @get("controller.model")
        model.deleteRecord()
        model.transaction.commit()
      add: ->
        model = @get("controller.model")
        $.post "/resources/books/add",{ISBN:model.get("isbn")},=> 
          console.log "book added!"
          @get("controller").getCopies()
      new: -> newBook()