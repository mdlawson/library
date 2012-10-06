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
  var App, CatalogueManager, SessionManager, UserManager, fill,
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
    $(window).resize(fill);
    fill();
    return Spine.Route.setup({
      history: true
    });
  });

  fill = function() {
    return $("#container").height($(window).height() - 41);
  };
  
}});

window.require.define({"controllers/book": function(exports, require, module) {
  var BookView,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  BookView = (function(_super) {

    __extends(BookView, _super);

    BookView.prototype.tag = "li";

    function BookView() {
      this.save = __bind(this.save, this);

      this.render = __bind(this.render, this);
      BookView.__super__.constructor.apply(this, arguments);
      this.book.bind('update', this.render);
      this.book.bind('destroy', this.release);
    }

    BookView.prototype.render = function() {
      var _this = this;
      this.html(require("views/book/list")(this.book));
      if (this.el.hasClass("active")) {
        this.panel.html(require("views/book/panel")(this.book));
        this.panel.find(".save").click(this.save);
        this.panel.find(".destroy").click(function() {
          return _this.book.destroy();
        });
      }
      return this;
    };

    BookView.prototype.save = function() {
      var i, prop, _ref;
      _ref = this.book.attributes();
      for (prop in _ref) {
        i = _ref[prop];
        if (prop !== "id") {
          this.book[prop] = this.panel.find("." + prop).val();
        }
      }
      return this.book.save();
    };

    return BookView;

  })(Spine.Controller);

  module.exports = BookView;
  
}});

window.require.define({"controllers/catalogue": function(exports, require, module) {
  var Book, BookView, CatalogueManager,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Book = require("models/book");

  BookView = require("controllers/book");

  CatalogueManager = (function(_super) {

    __extends(CatalogueManager, _super);

    CatalogueManager.prototype.el = "#content";

    CatalogueManager.prototype.elements = {
      '#list': 'list',
      '#panel': 'panel',
      '#searchbox': 'search'
    };

    CatalogueManager.prototype.events = {
      'keyup #searchbox': 'input',
      'click #new': 'new'
    };

    function CatalogueManager() {
      this.render = __bind(this.render, this);

      this.addBook = __bind(this.addBook, this);
      CatalogueManager.__super__.constructor.apply(this, arguments);
      Book.bind('create', this.addBook);
      Book.bind('refresh change', this.render);
    }

    CatalogueManager.prototype.activate = function() {
      this.el.addClass("catalogue");
      this.html(require("views/catalogue")());
      return Book.fetch();
    };

    CatalogueManager.prototype.deactivate = function() {
      return this.el.removeClass("catalogue");
    };

    CatalogueManager.prototype.addBook = function(book) {
      var el, view,
        _this = this;
      view = new BookView({
        book: book,
        panel: this.panel
      });
      el = view.render().el;
      el.click(function() {
        _this.list.children().each(function() {
          return $(this).removeClass("active");
        });
        el.addClass("active");
        return view.render();
      });
      this.list.append(el);
      return el;
    };

    CatalogueManager.prototype["new"] = function() {
      var book;
      book = new Book({
        title: "[Untitled]",
        author: "",
        date: "",
        ISBN: "",
        description: ""
      });
      return this.addBook(book).click();
    };

    CatalogueManager.prototype.input = function(e) {
      if (e.which === 13) {
        return this.render();
      }
    };

    CatalogueManager.prototype.filter = function() {
      var data, item, rankings, results, score, score2, threshold, val, _i, _j, _k, _len, _len1, _len2;
      val = this.search.val();
      data = Book.all();
      rankings = [];
      results = [];
      threshold = 0.5;
      if (!val) {
        return data;
      }
      if (val.length === 13 && !isNaN(parseInt(val)) && isFinite(val)) {
        for (_i = 0, _len = data.length; _i < _len; _i++) {
          item = data[_i];
          if (item.ISBN === val) {
            results.push(item);
          }
        }
      } else {
        for (_j = 0, _len1 = data.length; _j < _len1; _j++) {
          item = data[_j];
          score = item.title.score(val);
          score2 = item.author.score(val);
          if (score2 > score) {
            score = score2;
          }
          if (score > threshold) {
            rankings.push([score, item]);
          }
        }
        rankings.sort(function(a, b) {
          return b[0] - a[0];
        });
        for (_k = 0, _len2 = rankings.length; _k < _len2; _k++) {
          item = rankings[_k];
          results.push(item[1]);
        }
      }
      return results;
    };

    CatalogueManager.prototype.render = function() {
      var book, _i, _len, _ref;
      if (this.list) {
        this.list.empty();
        _ref = this.filter();
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          book = _ref[_i];
          this.addBook(book);
        }
        return this.list.children(":first").click();
      }
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

window.require.define({"views/book/list": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, foundHelper, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


    buffer += "<span class=\"id\">";
    foundHelper = helpers.id;
    stack1 = foundHelper || depth0.id;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "id", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</span>";
    foundHelper = helpers.title;
    stack1 = foundHelper || depth0.title;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "title", { hash: {} }); }
    buffer += escapeExpression(stack1);
    return buffer;});
}});

window.require.define({"views/book/panel": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, foundHelper, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


    buffer += "<img class=\"img-polaroid\">\r\n\r\n<form>\r\n  <div>\r\n    <label>Title:</label>\r\n    <input type=\"text\" class=\"title\" value=\"";
    foundHelper = helpers.title;
    stack1 = foundHelper || depth0.title;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "title", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\">\r\n    <label>Author:</label>\r\n    <input type=\"text\" class=\"author\" value=\"";
    foundHelper = helpers.author;
    stack1 = foundHelper || depth0.author;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "author", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\">\r\n  </div>\r\n  <div>\r\n    <label>Date:</label>\r\n    <input type=\"text\" class=\"date\" value=\"";
    foundHelper = helpers.date;
    stack1 = foundHelper || depth0.date;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "date", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\">\r\n    <label>ISBN:</label>\r\n    <input type=\"text\" class=\"ISBN\" value=\"";
    foundHelper = helpers.ISBN;
    stack1 = foundHelper || depth0.ISBN;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "ISBN", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\">\r\n  </div>\r\n  <label class=\"desc\">Description:</label>\r\n  <textarea class=\"description\">";
    foundHelper = helpers.description;
    stack1 = foundHelper || depth0.description;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "description", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</textarea>\r\n\r\n</form>\r\n\r\n<div class=\"buttons\">\r\n<button class=\"save btn\">Save</button>\r\n<button class=\"destroy btn btn-danger\">Delete</button>\r\n</div>\r\n<legend>Reservations</legend>\r\n<table class=\"table table-bordered table-striped\">\r\n  <thead>\r\n    <th>ID</th><th>User</th><th>Date</th> \r\n  </thead>\r\n  <tbody></tbody>\r\n</table>\r\n\r\n";
    return buffer;});
}});

window.require.define({"views/catalogue": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "<div id=\"search\" class=\"row-fluid\">\r\n  <input id=\"searchbox\" type=\"text\" class=\"search-query span10 offset1\" placeholder=\"Search\">\r\n</div>\r\n<ul id=\"list\" class=\"span3\"></ul>\r\n<button id=\"new\" class=\"span3 btn\">Add New</button>\r\n<div id=\"panel\" class=\"span9\"></div>";});
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

