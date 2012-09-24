(function() {
  'use strict';
  var App;

App = angular.module('app', ['ngCookies', 'ngResource', 'app.controllers', 'app.directives', 'app.filters', 'app.services']);

App.config([
  '$routeProvider', '$locationProvider', function($routeProvider, $locationProvider, config) {
    $routeProvider.when('/view1', {
      templateUrl: '/partials/partial1.html'
    }).when('/view2', {
      templateUrl: '/partials/partial2.html'
    }).otherwise({
      redirectTo: '/view1'
    });
    return $locationProvider.html5Mode(false);
  }
]);

}).call(this);

(function() {
  'use strict';
  
angular.element(document).ready(function() {
  return angular.bootstrap(document, ['app']);
});

}).call(this);

(function() {
  'use strict';
  
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

}).call(this);

(function() {
  'use strict';
  
angular.module('app.directives', ['app.services']).directive('appVersion', [
  'version', function(version) {
    return function(scope, elm, attrs) {
      return elm.text(version);
    };
  }
]);

}).call(this);

(function() {
  'use strict';
  
angular.module('app.filters', []).filter('interpolate', [
  'version', function(version) {
    return function(text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    };
  }
]);

}).call(this);

(function() {
  'use strict';
  
angular.module('app.services', []).factory('version', function() {
  return "0.1";
});

}).call(this);

