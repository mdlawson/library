exports.config =
  # See docs at http://brunch.readthedocs.org/en/latest/config.html.
  paths:
    public: 'server/public'
  files:
    javascripts:
      joinTo:
        'js/app.js': /^app/
        'js/vendor.js': /^vendor/
      order:
        before: [
          'vendor/scripts/batman.js'
          'vendor/scripts/batman.jquery.js'
        ]

    stylesheets:
      joinTo:
        'css/app.css': /^(app|vendor)/
  server:
    run: yes
    path: "server/app.coffee"
    port: 3000
  # Enable or disable minifying of result js / css files.
  # minify: true
