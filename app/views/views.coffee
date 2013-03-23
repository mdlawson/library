module.exports =
  fill:-> $("#container").height($(document).height()-$("#menu").height()) # set the container height to fill the page
  ApplicationView: Ember.View.extend
    templateName: 'application' # use the template named application
    didInsertElement: -> App.fill() # when we insert the app element, fill the page with it

  DateView: Ember.TextField.extend
    didInsertElement: -> $(@$()).datepicker format: "dd-mm-yyyy" # activate datepicker on all views of this type

  SubmitText: Ember.TextField.extend # new view for text fields with a submit function that calls a given method on the controller
    insertNewline: ->
      controller = @get "controller"
      controller[@get "method"]()
  BookView: Ember.View.extend
    didInsertElement: -> $("#bookModal").modal() # when we insert book views, activate the model view