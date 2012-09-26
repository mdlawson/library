(function(/*! Brunch !*/) {
  'use strict';

  var globals = typeof window !== 'undefined' ? window : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};

  var has = function(object, name) {
    return ({}).hasOwnProperty.call(object, name);
  };

  var expand = function(root, name) {
    var results = [], parts, part;
    if (/^\.\.?(\/|$)/.test(name)) {
      parts = [root, name].join('/').split('/');
    } else {
      parts = name.split('/');
    }
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function(name) {
      var dir = dirname(path);
      var absolute = expand(dir, name);
      return globals.require(absolute);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    definition(module.exports, localRequire(name), module);
    var exports = cache[name] = module.exports;
    return exports;
  };

  var require = function(name) {
    var path = expand(name, '.');

    if (has(cache, path)) return cache[path];
    if (has(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has(cache, dirIndex)) return cache[dirIndex];
    if (has(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '"');
  };

  var define = function(bundle) {
    for (var key in bundle) {
      if (has(bundle, key)) {
        modules[key] = bundle[key];
      }
    }
  }

  globals.require = require;
  globals.require.define = define;
  globals.require.brunch = true;
})();

window.require.define({"app": function(exports, require, module) {
  var Library,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.App = Library = (function(_super) {
    var AppController;

    __extends(Library, _super);

    function Library() {
      return Library.__super__.constructor.apply(this, arguments);
    }

    Library.root('App#index');

    Library.on('ready', function() {
      return console.log("App ready");
    });

    AppController = Library.AppController = (function(_super1) {

      __extends(AppController, _super1);

      function AppController() {
        return AppController.__super__.constructor.apply(this, arguments);
      }

      AppController.prototype.index = function() {
        return $.post('/login', function(data) {
          return Library.user = data;
        }).error(function() {});
      };

      return AppController;

    })(Batman.Controller);

    return Library;

  })(Batman.App);
  
}});

window.require.define({"scripts/controllers": function(exports, require, module) {
  
  angular.module('app.controllers', []).controller('AppCtrl', [
    '$scope', '$location', '$resource', '$rootScope', function($scope, $location, $resource, $rootScope) {
      $scope.$location = $location;
      $scope.$watch('$location.path()', function(path) {
        return $scope.activeNavId = path || '/';
      });
      return $scope.getClass = function(id) {
        if ($scope.activeNavId.substring(0, id.length) === id) {
          return 'active';
        } else {
          return '';
        }
      };
    }
  ]).controller('MyCtrl1', [
    '$scope', function($scope) {
      return $scope;
    }
  ]).controller('MyCtrl2', [
    '$scope', function($scope) {
      return $scope;
    }
  ]);
  
}});

window.require.define({"scripts/directives": function(exports, require, module) {
  
  angular.module('app.directives', ['app.services']).directive('appVersion', [
    'version', function(version) {
      return function(scope, elm, attrs) {
        return elm.text(version);
      };
    }
  ]);
  
}});

window.require.define({"scripts/filters": function(exports, require, module) {
  
  angular.module('app.filters', []).filter('interpolate', [
    'version', function(version) {
      return function(text) {
        return String(text).replace(/\%VERSION\%/mg, version);
      };
    }
  ]);
  
}});

window.require.define({"scripts/services": function(exports, require, module) {
  
  angular.module('app.services', []).factory('version', function() {
    return "0.1";
  });
  
}});

