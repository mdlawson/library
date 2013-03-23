newBook = -> # creates a new book
  App.Book.createRecord
    title: "Untitled"
    author: "Unauthored"
module.exports = 
  CatalogueRoute: Ember.Route.extend
    model: -> App.Book.find() # set the controller for this routes model to be all the books
    renderTemplate: -> 
      @render() # render template automatically
      #$("list").children(":first").click()
    events:
      new: -> newBook() # on new event, make new book

  BookRoute: Ember.Route.extend
    renderTemplate: -> 
      controller = @get("controller")
      controller.getReservations -> # get reservations 
        if controller.get("admin") is false
          controller.set("reserved",false) # set reserved property to false initially
          for reservation in controller.get("reservations")
            if reservation.userId is App.get("user.id") then controller.set("reserved",true) # if the user has this book in reservations, set reserved to true
      controller.getLoans() # get the loans
      controller.getCopies() # get copies
      
      @render 'catalogue' # render the catalogue first 
        controller: @controllerFor "catalogue" # with the correct catalogue
      @render # render this into the catalogue
       into: 'catalogue'
      $("#bookModal").modal() # display the modal popup of this book
        
    model: (params) -> # find all the books first for the catalogue, but only return the requested book for rendering
      App.Book.find()
      App.Book.find(params.book_id)
    events:
      save: ->
        model = @get("controller.model")
        #model.validate()
        #if model.get("isValid") then 
        model.transaction.commit() # on save event, commit model transactions
      delete: ->
        model = @get("controller.model")
        model.deleteRecord() # delete record on delete
        model.transaction.commit() # commit model transactions
      add: ->
        model = @get("controller.model") 
        $.post "/resources/books/add",{ISBN:model.get("isbn")},=> # post to server to add new copy
          console.log "book added!"
          @get("controller").getCopies()
      new: -> newBook() # create a new book on new