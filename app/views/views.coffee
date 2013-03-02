module.exports =
  fill:-> $("#container").height($(document).height()-$("#menu").height())
  ApplicationView: Ember.View.extend
    templateName: 'application'
    didInsertElement: -> App.fill()

  DateView: Ember.TextField.extend
    classNames: ['date-picker']
    didInsertElement: -> @$().datepicker format: "dd-mm-yyyy"

  SubmitText: Ember.TextField.extend
    insertNewline: ->
      controller = @get "controller"
      window.stc = controller
      controller[@get "method"]()
  BookView: Ember.View.extend
    didInsertElement: -> $("#bookModal").modal()