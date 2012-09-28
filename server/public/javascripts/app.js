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
  var App, CatalogueManager, SessionManager, UserManager,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  SessionManager = require('controllers/session');

  CatalogueManager = require('controllers/catalogue');

  UserManager = require('controllers/users');

  App = (function(_super) {

    __extends(App, _super);

    App.prototype.el = "#container";

    function App() {
      var _this = this;
      App.__super__.constructor.apply(this, arguments);
      this.routes = {
        "/login": 'session',
        "/catalogue": 'catalogue',
        "/users": "user"
      };
      this.session.login();
      this.session.bind("login", function() {
        return _this.catalogue.active();
      });
    }

    App.prototype.controllers = {
      session: SessionManager,
      catalogue: CatalogueManager,
      user: UserManager
    };

    App.prototype["default"] = 'session';

    return App;

  })(Spine.Stack);

  $(function() {
    Spine.Route.setup({
      history: true
    });
    return window.app = new App({
      el: $("#container")
    });
  });
  
}});

window.require.define({"controllers/catalogue": function(exports, require, module) {
  var CatalogueManager,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  CatalogueManager = (function(_super) {

    __extends(CatalogueManager, _super);

    function CatalogueManager() {
      return CatalogueManager.__super__.constructor.apply(this, arguments);
    }

    CatalogueManager.prototype.el = "#content";

    CatalogueManager.prototype.activate = function() {
      return this.render();
    };

    CatalogueManager.prototype.render = function() {
      return this.html(require("views/catalogue")());
    };

    return CatalogueManager;

  })(Spine.Controller);

  module.exports = CatalogueManager;
  
}});

window.require.define({"controllers/session": function(exports, require, module) {
  var SessionManager,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  SessionManager = (function(_super) {

    __extends(SessionManager, _super);

    function SessionManager() {
      return SessionManager.__super__.constructor.apply(this, arguments);
    }

    SessionManager.prototype.el = "#content";

    SessionManager.prototype.events = {
      'click #submit': 'submit'
    };

    SessionManager.prototype.activate = function() {
      return this.html(require("views/login")());
    };

    SessionManager.prototype.login = function(data) {
      var _this = this;
      if (data == null) {
        data = {};
      }
      return $.post("/login", data, function(user) {
        _this.user = user;
        return _this.trigger("login", user);
      });
    };

    SessionManager.prototype.logout = function() {
      return $.post("/logout", function() {
        this.user = null;
        return this.trigger("logout");
      });
    };

    SessionManager.prototype.submit = function(e) {
      e.preventDefault();
      return this.login({
        username: this.$("input#username").val(),
        password: this.$("input#password").val()
      });
    };

    return SessionManager;

  })(Spine.Controller);

  module.exports = SessionManager;
  
}});

window.require.define({"controllers/users": function(exports, require, module) {
  var UserManager,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  UserManager = (function(_super) {

    __extends(UserManager, _super);

    function UserManager() {
      return UserManager.__super__.constructor.apply(this, arguments);
    }

    return UserManager;

  })(Spine.Controller);

  module.exports = UserManager;
  
}});

window.require.define({"views/catalogue": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", foundHelper, self=this;


    return buffer;});
}});

window.require.define({"views/login": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "<form>\r\n  <legend>Login</legend>\r\n  <label>Username</label>\r\n  <input id=\"username\" type=\"text\">\r\n  <label>Password</label>\r\n  <input id=\"password\" type=\"text\">\r\n  <button type=\"submit\" class=\"btn\" id=\"submit\">Login</button>\r\n</form>";});
}});

