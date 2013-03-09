newUser = -> 
  App.User.createRecord
    firstname: "Joe"
    lastname: "Bloggs"

module.exports = 
  UsersRoute: Ember.Route.extend
    model: -> App.User.find()
    renderTemplate: ->
      @render()
      #$("list").children(":first").click()

    events:
      new: -> newUser()

  UserRoute: Ember.Route.extend
    renderTemplate: ->
      @get("controller").getReservations()
      @get("controller").getLoans()
      @render 'users'
        controller: @controllerFor "users"
      @render
       into: 'users'
        
    model: (params) -> App.User.find(params.user_id);
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
      new: -> newUser()