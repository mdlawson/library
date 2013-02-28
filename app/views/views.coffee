module.exports =
  ApplicationView: Ember.View.extend
    templateName: 'application'
    didInsertElement: -> fill()

  DateView: Ember.TextField.extend
    classNames: ['date-picker']
    didInsertElement: -> @$().datepicker format: "dd-mm-yyyy"

  SubmitText: Ember.TextField.extend
    insertNewline: ->
      controller = @get "controller"
      window.stc = controller
      controller[@get "method"]()
