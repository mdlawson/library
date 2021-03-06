exports.config =
  # See docs at http://brunch.readthedocs.org/en/latest/config.html.
  paths:
    public: 'server/public'
  files:
    javascripts:
      joinTo:
        'javascripts/app.js': /^app/
        'javascripts/vendor.js': /^vendor/
        'test/javascripts/test.js': /^test(\/|\\)(?!vendor)/
        'test/javascripts/test-vendor.js': /^test(\/|\\)(?=vendor)/
      order:
        # Files in `vendor` directories are compiled before other files
        # even if they aren't specified in order.before.
        before: [
          'vendor/scripts/jquery-1.8.3.js',
          'vendor/scripts/bootstrap/bootstrap.js',
          'vendor/scripts/sugar.js'
          'vendor/scripts/spine/spine.coffee',
        ]

    stylesheets:
      joinTo:
        'stylesheets/app.css': /^(app|vendor)/
        'test/stylesheets/test.css': /^test/
      order:
        before: ['vendor/styles/normalize-1.0.1.css']
        after: ['vendor/styles/helpers.css']

    templates:
      joinTo: 'javascripts/app.js'
  server:
    run: yes
    path: "server/app.coffee"
    port: 3000
  # Enable or disable minifying of result js / css files.
  # minify: true
