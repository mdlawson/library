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
  var App, Book, CatalogueManager, SessionManager, UserManager,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  SessionManager = require('controllers/session');

  CatalogueManager = require('controllers/catalogue');

  UserManager = require('controllers/users');

  Book = require('models/book');

  App = (function(_super) {

    __extends(App, _super);

    App.prototype.el = "#container";

    function App() {
      var _this = this;
      App.__super__.constructor.apply(this, arguments);
      this.$("#menu-issue").click(function() {
        return _this.navigate("/issue");
      });
      this.$("#menu-return").click(function() {
        return _this.navigate("/return");
      });
      this.$("#menu-catalogue").click(function() {
        return _this.navigate("/catalogue");
      });
      this.$("#menu-users").click(function() {
        return _this.navigate("/users");
      });
      this.session.bind("login", function() {
        _this.navigate("/catalogue");
        return _this.render();
      });
      this.session.bind("failure", function() {
        return _this.navigate("/login");
      });
      this.session.login();
    }

    App.prototype.render = function() {
      return $("#menu").html(require("views/header")(this.session.user));
    };

    App.prototype.routes = {
      "/login": 'session',
      "/catalogue": 'catalogue',
      "/users": "user"
    };

    App.prototype.controllers = {
      session: SessionManager,
      catalogue: CatalogueManager,
      user: UserManager
    };

    return App;

  })(Spine.Stack);

  $(function() {
    window.app = new App;
    return Spine.Route.setup({
      history: true
    });
  });
  
}});

window.require.define({"controllers/catalogue": function(exports, require, module) {
  var Book, CatalogueManager,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Book = require("models/book");

  CatalogueManager = (function(_super) {

    __extends(CatalogueManager, _super);

    function CatalogueManager() {
      return CatalogueManager.__super__.constructor.apply(this, arguments);
    }

    CatalogueManager.prototype.el = "#content";

    CatalogueManager.prototype.activate = function() {
      this.el.addClass("catalogue");
      return this.render();
    };

    CatalogueManager.prototype.deactivate = function() {
      return this.el.removeClass("catalogue");
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
      this.html(require("views/login")());
      this.el.addClass("login");
      return $("#menu")[0].style.display = "none";
    };

    SessionManager.prototype.deactivate = function() {
      this.el.removeClass("login");
      return $("#menu")[0].style.display = "block";
    };

    SessionManager.prototype.login = function(data) {
      var _this = this;
      if (data == null) {
        data = {};
      }
      return $.post("/login", data, function(user) {
        _this.user = user;
        return _this.trigger("login", user);
      }).error(function() {
        return _this.trigger("failure");
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

    UserManager.prototype.el = "#content";

    UserManager.prototype.activate = function() {
      return this.render();
    };

    UserManager.prototype.render = function() {
      return this.html(require("views/users")());
    };

    return UserManager;

  })(Spine.Controller);

  module.exports = UserManager;
  
}});

window.require.define({"models/book": function(exports, require, module) {
  var Book,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Book = (function(_super) {

    __extends(Book, _super);

    function Book() {
      return Book.__super__.constructor.apply(this, arguments);
    }

    Book.configure("Book", "title", "description", "author", "date", "ISBN");

    Book.extend(Spine.Model.Ajax);

    Book.url = "/resources/books";

    return Book;

  })(Spine.Model);

  module.exports = Book;
  
}});

window.require.define({"views/catalogue": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "<div id=\"search\" class=\"row-fluid\">\r\n  <input type=\"text\" class=\"search-query span10 offset1\" placeholder=\"Search\">\r\n</div>\r\n<div id=\"list\" class=\"span3\"></div>\r\n<div id=\"panel\" class=\"span9\"></div>";});
}});

window.require.define({"views/header": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, stack2, foundHelper, tmp1, self=this;

  function program1(depth0,data) {
    
    
    return "\r\n  <a class=\"brand\">Library</a>\r\n  ";}

  function program3(depth0,data) {
    
    
    return "\r\n    <li id=\"menu-issue\"><a>Issue</a></li>\r\n    <li id=\"menu-return\"><a>Return</a></li>\r\n    <li id=\"menu-catalogue\"><a>Catalogue</a></li>\r\n    <li id=\"menu-users\"><a>Users</a></li>\r\n    ";}

    buffer += "<div class=\"navbar-inner\">\r\n  ";
    foundHelper = helpers.admin;
    stack1 = foundHelper || depth0.admin;
    stack2 = helpers.unless;
    tmp1 = self.program(1, program1, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\r\n  <ul class=\"nav\">\r\n    ";
    foundHelper = helpers.admin;
    stack1 = foundHelper || depth0.admin;
    stack2 = helpers['if'];
    tmp1 = self.program(3, program3, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\r\n  </ul>\r\n  <ul class=\"nav pull-right\">\r\n    <li id=\"logout\"><a href=\"/logout\">Logout</a><li>\r\n  </ul>\r\n</div>\r\n";
    return buffer;});
}});

window.require.define({"views/login": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "<form class=\"span4 offset4 well\">\r\n  <legend>Login</legend>\r\n  <label>Username</label>\r\n  <input id=\"username\" class=\"span12\" type=\"text\">\r\n  <label>Password</label>\r\n  <input id=\"password\" class=\"span12\" type=\"text\">\r\n  <button type=\"submit\" class=\"btn btn-info btn-block\" id=\"submit\">Login</button>\r\n</form>";});
}});

window.require.define({"views/users": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", foundHelper, self=this;


    return buffer;});
}});

