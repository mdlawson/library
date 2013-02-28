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
      @render 'users'
        controller: @controllerFor "users"
      @render
       into: 'users'
        
    model: (params) -> App.User.find(params.user_id);
    events:
      save: ->
        @get("controller.model").transaction.commit()
      delete: ->
        model = @get("controller.model")
        model.deleteRecord()
        model.transaction.commit()
      new: -> newUser()