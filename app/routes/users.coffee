newUser = -> # creates a new user
  App.User.createRecord
    firstname: "Joe"
    lastname: "Bloggs"

module.exports = 
  UsersRoute: Ember.Route.extend
    model: -> App.User.find() # set the controller for this routes model to be all the users
    renderTemplate: ->
      @render()
      #$("list").children(":first").click()

    events:
      new: -> newUser() # on new event, add new user

  UserRoute: Ember.Route.extend
    renderTemplate: ->
      @get("controller").getReservations() # get users reservations
      @get("controller").getLoans() # and loans
      @render 'users' # render user list first
        controller: @controllerFor "users"
      @render # render this into the user list
       into: 'users'
        
    model: (params) -> # find all the users first for the list, but only return the requested user for rendering 
      App.User.find()
      App.User.find(params.user_id)
    events:
      save: ->
        model = @get("controller.model")
        #model.validate()
        #if model.get("isValid") then 
        model.transaction.commit() # on save, commit model changes
      delete: ->
        model = @get("controller.model")
        model.deleteRecord() # on delete, delete the record
        model.transaction.commit() # and commit changes
      new: -> newUser() # add new user on new