require
  urlArgs: "bust=" +  (new Date()).getTime()
  paths:
    c:"controllers"
    d:"directives"
    l18n:"vendor/l18n"
    jquery:"vendor/jquery"
    ang:"vendor/angular"
  shim:
    'ang':
      deps: ['vendor/modernizr']
      exports: 'angular'
    'vendor/angular-resource': ['ang']
    'vendor/modernizr':
      exports: 'Modernizr'
  ['app'], (app) ->