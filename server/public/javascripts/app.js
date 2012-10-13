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
  var App, CatalogueManager, Issuer, Returner, SessionManager, UserManager, fill,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  require('views/helpers');

  SessionManager = require('controllers/session');

  CatalogueManager = require('controllers/catalogue');

  UserManager = require('controllers/users');

  Issuer = require('controllers/issue');

  Returner = require('controllers/return');

  App = (function(_super) {

    __extends(App, _super);

    App.prototype.el = "#container";

    function App() {
      var _this = this;
      App.__super__.constructor.apply(this, arguments);
      this.menu = $("#menu");
      Spine.Route.bind("navigate", function(path) {
        $("[id^=menu-]", _this.menu).removeClass("active");
        return $("#menu-" + path.split("/")[1], _this.menu).addClass("active");
      });
      this.session.bind("login", function(user) {
        _this.render();
        _this.catalogue.basic = user.admin === 0 ? true : false;
        if (!user.reauth) {
          return _this.navigate("/catalogue");
        }
      });
      this.session.bind("failure", function() {
        return _this.navigate("/login");
      });
      this.session.login();
    }

    App.prototype.render = function() {
      var items, that,
        _this = this;
      that = this;
      items = this.menu.html(require("views/header")(this.session.user));
      $("#menu-issue", this.menu).click(function() {
        return _this.navigate("/issue");
      });
      $("#menu-return", this.menu).click(function() {
        return _this.navigate("/return");
      });
      $("#menu-catalogue", this.menu).click(function() {
        return _this.navigate("/catalogue");
      });
      return $("#menu-users", this.menu).click(function() {
        return _this.navigate("/users");
      });
    };

    App.prototype.routes = {
      "/login": 'session',
      "/catalogue": 'catalogue',
      "/users": "user",
      "/issue": "issue",
      "/return": "return"
    };

    App.prototype.controllers = {
      session: SessionManager,
      catalogue: CatalogueManager,
      user: UserManager,
      issue: Issuer,
      "return": Returner
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

    BookView.prototype.panelTmpl = require("views/book/panel");

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
        this.renderPanel();
        this.book.getReservations(function(data) {
          _this.book.reservations = data;
          return _this.renderPanel();
        });
        this.book.getLoans(function(data) {
          _this.book.loans = data;
          return _this.renderPanel();
        });
      }
      return this;
    };

    BookView.prototype.renderPanel = function() {
      var _this = this;
      this.panel.html(this.panelTmpl(this.book));
      $("#datepicker", this.panel).datepicker({
        format: "dd-mm-yyyy"
      });
      $(".save", this.panel).click(this.save);
      return $(".destroy", this.panel).click(function() {
        return _this.book.destroy();
      });
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
  var Book, BookView, CatalogueManager, levenshtein, strScore,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Book = require("models/book");

  BookView = require("controllers/book");

  levenshtein = require("util").levenshtein;

  strScore = require("util").strScore;

  CatalogueManager = (function(_super) {

    __extends(CatalogueManager, _super);

    CatalogueManager.prototype.el = "#content";

    CatalogueManager.prototype.routes = {
      '/catalogue/:id': function(params) {
        return Book.find(params.id).el.click();
      }
    };

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
      this.html(require("views/panelView")());
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
      var author, data, item, matcher, rankings, results, score, string, val, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref;
      val = this.search.val();
      data = Book.all();
      rankings = [];
      results = [];
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
      } else if (val.length > 10) {
        matcher = this.matchers.levenshtein;
      } else {
        matcher = this.matchers.strScore;
      }
      for (_j = 0, _len1 = data.length; _j < _len1; _j++) {
        item = data[_j];
        score = [];
        author = item.author.split(" ");
        _ref = author.concat(item.title);
        for (_k = 0, _len2 = _ref.length; _k < _len2; _k++) {
          string = _ref[_k];
          score.push(matcher.score(string, val));
        }
        score.sort(matcher.sort);
        if (matcher.valid(score[0])) {
          rankings.push([score[0], item]);
        }
      }
      rankings.sort(function(a, b) {
        return matcher.sort(a[0], b[0]);
      });
      for (_l = 0, _len3 = rankings.length; _l < _len3; _l++) {
        item = rankings[_l];
        results.push(item[1]);
      }
      return results;
    };

    CatalogueManager.prototype.matchers = {
      levenshtein: {
        score: function(a, b) {
          return levenshtein(a, b);
        },
        sort: function(a, b) {
          return a - b;
        },
        valid: function(a) {
          if (a < 6) {
            return true;
          } else {
            return false;
          }
        }
      },
      strScore: {
        score: function(a, b) {
          return a.score(b, 0.5);
        },
        sort: function(a, b) {
          return b - a;
        },
        valid: function(a) {
          if (a > 0.2) {
            return true;
          } else {
            return false;
          }
        }
      }
    };

    CatalogueManager.prototype.render = function() {
      var book, books, _i, _len;
      if (this.list) {
        this.list.empty();
        books = this.filter();
        for (_i = 0, _len = books.length; _i < _len; _i++) {
          book = books[_i];
          this.addBook(book);
        }
        if (!books.length) {
          this.panel.html("");
        }
        return this.list.children(":first").click();
      }
    };

    return CatalogueManager;

  })(Spine.Controller);

  module.exports = CatalogueManager;
  
}});

window.require.define({"controllers/issue": function(exports, require, module) {
  var Book, Issuer, User,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  User = require("models/user");

  Book = require("models/book");

  Issuer = (function(_super) {

    __extends(Issuer, _super);

    function Issuer() {
      this.commit = __bind(this.commit, this);

      this.cancel = __bind(this.cancel, this);

      this.removeBook = __bind(this.removeBook, this);

      this.inputBook = __bind(this.inputBook, this);

      this.inputUser = __bind(this.inputUser, this);
      return Issuer.__super__.constructor.apply(this, arguments);
    }

    Issuer.prototype.el = "#content";

    Issuer.prototype.elements = {
      '#column': 'column',
      '#userInput': 'userInput',
      "#bookInput": 'bookInput',
      '#books': 'books'
    };

    Issuer.prototype.activate = function() {
      this.el.addClass("issue");
      this.render();
      this.userInput.focus();
      User.fetch();
      return Book.fetch();
    };

    Issuer.prototype.deactivate = function() {
      return this.el.removeClass("issue");
    };

    Issuer.prototype.inputUser = function(e) {
      var _base, _ref;
      if (e.which !== 13) {
        return;
      }
      this.user = User.find(Number(this.userInput.val()));
      if ((_ref = (_base = this.user).uncommitted) == null) {
        _base.uncommitted = [];
      }
      this.render();
      return this.bookInput.focus();
    };

    Issuer.prototype.inputBook = function(e) {
      var book;
      if (e.which !== 13) {
        return;
      }
      book = Book.find(Number(this.bookInput.val()));
      if (book) {
        this.user.uncommitted.push(book);
      }
      this.render();
      return this.bookInput.focus();
    };

    Issuer.prototype.removeBook = function(e) {
      this.user.uncommitted.pop($("#books").index($(e.target).parent()));
      return this.render();
    };

    Issuer.prototype.cancel = function() {
      this.user = void 0;
      return this.render();
    };

    Issuer.prototype.commit = function() {
      var book, _i, _len, _ref;
      _ref = this.user.uncommitted;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        book = _ref[_i];
        this.user.makeLoan(book.id);
      }
      return this.cancel();
    };

    Issuer.prototype.render = function() {
      var _ref;
      this.html(require("views/issue")(this.user || {}));
      this.userInput.keyup(this.inputUser);
      if ((_ref = this.bookInput) != null) {
        _ref.keyup(this.inputBook);
      }
      $(".removeBook", "#books").click(this.removeBook);
      $("#commit", this.column).click(this.commit);
      return $("#cancel", this.column).click(this.cancel);
    };

    return Issuer;

  })(Spine.Controller);

  module.exports = Issuer;
  
}});

window.require.define({"controllers/return": function(exports, require, module) {
  var Book, Returner,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Book = require("models/book");

  Returner = (function(_super) {

    __extends(Returner, _super);

    function Returner() {
      this.inputBook = __bind(this.inputBook, this);
      return Returner.__super__.constructor.apply(this, arguments);
    }

    Returner.prototype.el = "#content";

    Returner.prototype.elements = {
      '#column': 'column',
      "#bookInput": 'bookInput'
    };

    Returner.prototype.activate = function() {
      this.el.addClass("return");
      this.render();
      this.bookInput.focus();
      return Book.fetch();
    };

    Returner.prototype.deactivate = function() {
      return this.el.removeClass("return");
    };

    Returner.prototype.inputBook = function(e) {
      if (e.which !== 13) {
        return;
      }
      this.book = Book.find(Number(this.bookInput.val()));
      if (this.book) {
        this.book["return"]();
      }
      this.render();
      return this.bookInput.focus();
    };

    Returner.prototype.render = function() {
      this.html(require("views/return")(this.book || {}));
      return this.bookInput.keyup(this.inputBook);
    };

    return Returner;

  })(Spine.Controller);

  module.exports = Returner;
  
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

window.require.define({"controllers/user": function(exports, require, module) {
  var UserView,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  UserView = (function(_super) {

    __extends(UserView, _super);

    UserView.prototype.tag = "li";

    UserView.prototype.panelTmpl = require("views/user/panel");

    function UserView() {
      this.save = __bind(this.save, this);

      this.render = __bind(this.render, this);
      UserView.__super__.constructor.apply(this, arguments);
      this.user.bind('update', this.render);
      this.user.bind('destroy', this.release);
    }

    UserView.prototype.render = function() {
      var _this = this;
      this.html(require("views/user/list")(this.user));
      if (this.el.hasClass("active")) {
        this.renderPanel();
        this.user.getReservations(function(data) {
          _this.user.reservations = data;
          return _this.renderPanel();
        });
        this.user.getLoans(function(data) {
          _this.user.loans = data;
          return _this.renderPanel();
        });
        this.panel.find(".save").click(this.save);
        this.panel.find(".destroy").click(function() {
          return _this.user.destroy();
        });
      }
      return this;
    };

    UserView.prototype.renderPanel = function() {
      return this.panel.html(this.panelTmpl(this.user));
    };

    UserView.prototype.save = function() {
      var i, prop, _ref;
      _ref = this.user.attributes();
      for (prop in _ref) {
        i = _ref[prop];
        if (prop !== "id") {
          this.user[prop] = this.panel.find("." + prop).val();
        }
      }
      return this.user.save();
    };

    return UserView;

  })(Spine.Controller);

  module.exports = UserView;
  
}});

window.require.define({"controllers/users": function(exports, require, module) {
  var User, UserManager, UserView,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  User = require("models/user");

  UserView = require("controllers/user");

  UserManager = (function(_super) {

    __extends(UserManager, _super);

    UserManager.prototype.el = "#content";

    UserManager.prototype.elements = {
      '#list': 'list',
      '#panel': 'panel',
      '#searchbox': 'search'
    };

    UserManager.prototype.events = {
      'keyup #searchbox': 'input',
      'click #new': 'new'
    };

    function UserManager() {
      this.render = __bind(this.render, this);

      this.addUser = __bind(this.addUser, this);
      UserManager.__super__.constructor.apply(this, arguments);
      User.bind('create', this.addUser);
      User.bind('refresh change', this.render);
    }

    UserManager.prototype.activate = function() {
      this.el.addClass("users");
      this.html(require("views/panelView")());
      return User.fetch();
    };

    UserManager.prototype.deactivate = function() {
      return this.el.removeClass("users");
    };

    UserManager.prototype.addUser = function(user) {
      var el, view,
        _this = this;
      view = new UserView({
        user: user,
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

    UserManager.prototype["new"] = function() {
      var user;
      user = new User({
        username: "[New User]",
        firstName: "",
        lastName: "",
        email: "",
        admin: false
      });
      return this.addUser(user).click();
    };

    UserManager.prototype.input = function(e) {
      if (e.which === 13) {
        return this.render();
      }
    };

    UserManager.prototype.filter = function() {
      var data, item, rankings, results, score, score2, threshold, val, _i, _j, _len, _len1;
      val = this.search.val();
      data = User.all();
      rankings = [];
      results = [];
      threshold = 0.5;
      if (!val) {
        return data;
      }
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        item = data[_i];
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
      for (_j = 0, _len1 = rankings.length; _j < _len1; _j++) {
        item = rankings[_j];
        results.push(item[1]);
      }
      return results;
    };

    UserManager.prototype.render = function() {
      var user, _i, _len, _ref;
      if (this.list) {
        this.list.empty();
        _ref = this.filter();
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          user = _ref[_i];
          this.addUser(user);
        }
        return this.list.children(":first").click();
      }
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

    Book.prototype.getReservations = function(cb) {
      return $.get("" + (this.url()) + "/reservations", cb);
    };

    Book.prototype.makeReservation = function(book, cb) {
      return $.post("" + (this.url()) + "/reservations", {
        bookId: book
      }, cb);
    };

    Book.prototype.getLoans = function(cb) {
      return $.get("" + (this.url()) + "/loans", cb);
    };

    Book.prototype.makeLoan = function(book, cb) {
      return $.post("" + (this.url()) + "/loans", {
        bookId: book
      }, cb);
    };

    Book.prototype["return"] = function(cb) {
      return $.post("" + (this.url()) + "/return", cb);
    };

    return Book;

  })(Spine.Model);

  module.exports = Book;
  
}});

window.require.define({"models/user": function(exports, require, module) {
  var User,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  User = (function(_super) {

    __extends(User, _super);

    function User() {
      return User.__super__.constructor.apply(this, arguments);
    }

    User.configure("username", "firstName", "lastName", "email", "admin");

    User.extend(Spine.Model.Ajax);

    User.url = "/resources/users";

    User.prototype.getReservations = function(cb) {
      return $.get("" + (this.url()) + "/reservations", cb);
    };

    User.prototype.makeReservation = function(book, cb) {
      return $.post("" + (this.url()) + "/reservations", {
        bookId: book
      }, cb);
    };

    User.prototype.getLoans = function(cb) {
      return $.get("" + (this.url()) + "/loans", cb);
    };

    User.prototype.makeLoan = function(book, cb) {
      return $.post("" + (this.url()) + "/loans", {
        bookId: book
      }, cb);
    };

    return User;

  })(Spine.Model);

  module.exports = User;
  
}});

window.require.define({"util": function(exports, require, module) {
  
  module.exports = {
    levenshtein: function(s1, s2) {
      var L1, L2, a, b, c, cost, i, j, v0, v1, v_tmp;
      L1 = s1.length;
      L2 = s2.length;
      if (L1 === 0) {
        return L2;
      } else if (L2 === 0) {
        return L1;
      } else {
        if (s1 === s2) {
          return 0;
        }
      }
      v0 = new Array(L1 + 1);
      v1 = new Array(L1 + 1);
      i = 0;
      while (i < L1 + 1) {
        v0[i] = i;
        i++;
      }
      j = 1;
      while (j <= L2) {
        v1[0] = j;
        i = 0;
        while (i < L1) {
          cost = (s1[i] === s2[j - 1] ? 0 : 1);
          a = v0[i + 1] + 1;
          b = v1[i] + 1;
          c = v0[i] + cost;
          v1[i + 1] = (a < b ? (a < c ? a : c) : (b < c ? b : c));
          i++;
        }
        v_tmp = v0;
        v0 = v1;
        v1 = v_tmp;
        j++;
      }
      return v0[L1];
    },
    strScore: function(string, abbreviation, fuzziness) {
      var abbreviation_length, abbreviation_score, c, character_score, final_score, fuzzies, i, index_c_lowercase, index_c_uppercase, index_in_string, min_index, start_of_string_bonus, string_length, total_character_score;
      if (this === abbreviation) {
        return 1;
      }
      if (abbreviation === "") {
        return 0;
      }
      total_character_score = 0;
      abbreviation_length = abbreviation.length;
      string_length = string.length;
      fuzzies = 1;
      i = 0;
      while (i < abbreviation_length) {
        c = abbreviation.charAt(i);
        index_c_lowercase = string.indexOf(c.toLowerCase());
        index_c_uppercase = string.indexOf(c.toUpperCase());
        min_index = Math.min(index_c_lowercase, index_c_uppercase);
        index_in_string = (min_index > -1 ? min_index : Math.max(index_c_lowercase, index_c_uppercase));
        if (index_in_string === -1) {
          if (fuzziness) {
            fuzzies += 1 - fuzziness;
            continue;
          } else {
            return 0;
          }
        } else {
          character_score = 0.1;
        }
        if (string[index_in_string] === c) {
          character_score += 0.1;
        }
        if (index_in_string === 0) {
          character_score += 0.6;
          if (i === 0) {
            start_of_string_bonus = 1;
          }
        } else {
          if (string.charAt(index_in_string - 1) === " ") {
            character_score += 0.8;
          }
        }
        string = string.substring(index_in_string + 1, string_length);
        total_character_score += character_score;
        ++i;
      }
      abbreviation_score = total_character_score / abbreviation_length;
      final_score = ((abbreviation_score * (abbreviation_length / string_length)) + abbreviation_score) / 2;
      final_score = final_score / fuzzies;
      if (start_of_string_bonus && (final_score + 0.15 < 1)) {
        final_score += 0.15;
      }
      return final_score;
    }
  };
  
}});

window.require.define({"views/basic": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", foundHelper, self=this;


    return buffer;});
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
    var buffer = "", stack1, stack2, foundHelper, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

  function program1(depth0,data) {
    
    var buffer = "", stack1, stack2;
    buffer += "\r\n      <tr><td>";
    stack1 = depth0.id;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "this.id", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</td><td>";
    stack1 = depth0.userId;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "this.userId", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</td><td>";
    stack1 = depth0.date;
    foundHelper = helpers.Date;
    stack2 = foundHelper || depth0.Date;
    if(typeof stack2 === functionType) { stack1 = stack2.call(depth0, stack1, { hash: {} }); }
    else if(stack2=== undef) { stack1 = helperMissing.call(depth0, "Date", stack1, { hash: {} }); }
    else { stack1 = stack2; }
    buffer += escapeExpression(stack1) + "</td><td>";
    stack1 = depth0.due;
    foundHelper = helpers.Date;
    stack2 = foundHelper || depth0.Date;
    if(typeof stack2 === functionType) { stack1 = stack2.call(depth0, stack1, { hash: {} }); }
    else if(stack2=== undef) { stack1 = helperMissing.call(depth0, "Date", stack1, { hash: {} }); }
    else { stack1 = stack2; }
    buffer += escapeExpression(stack1) + "</td><td>";
    stack1 = depth0.returned;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "this.returned", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</td></tr>\r\n    ";
    return buffer;}

  function program3(depth0,data) {
    
    var buffer = "", stack1, stack2;
    buffer += "\r\n      <tr><td>";
    stack1 = depth0.id;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "this.id", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</td><td>";
    stack1 = depth0.userId;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "this.userId", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</td><td>";
    stack1 = depth0.date;
    foundHelper = helpers.Date;
    stack2 = foundHelper || depth0.Date;
    if(typeof stack2 === functionType) { stack1 = stack2.call(depth0, stack1, { hash: {} }); }
    else if(stack2=== undef) { stack1 = helperMissing.call(depth0, "Date", stack1, { hash: {} }); }
    else { stack1 = stack2; }
    buffer += escapeExpression(stack1) + "</td></tr>\r\n    ";
    return buffer;}

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
    buffer += escapeExpression(stack1) + "\">\r\n  </div>\r\n  <div>\r\n    <label>Date:</label>\r\n    <input id=\"datepicker\" type=\"text\" class=\"date datepicker\" value=\"";
    foundHelper = helpers.date;
    stack1 = foundHelper || depth0.date;
    foundHelper = helpers.Date;
    stack2 = foundHelper || depth0.Date;
    if(typeof stack2 === functionType) { stack1 = stack2.call(depth0, stack1, { hash: {} }); }
    else if(stack2=== undef) { stack1 = helperMissing.call(depth0, "Date", stack1, { hash: {} }); }
    else { stack1 = stack2; }
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
    buffer += escapeExpression(stack1) + "</textarea>\r\n\r\n</form>\r\n\r\n<div class=\"buttons\">\r\n<button class=\"save btn\">Save</button>\r\n<button class=\"destroy btn btn-danger\">Delete</button>\r\n</div>\r\n<legend>Loans</legend>\r\n<table class=\"table table-bordered table-striped\">\r\n  <thead>\r\n    <th>ID</th><th>User</th><th>Date</th><th>Due</th><th>Returned</th>\r\n  </thead>\r\n  <tbody>\r\n    ";
    foundHelper = helpers.loans;
    stack1 = foundHelper || depth0.loans;
    stack2 = helpers.each;
    tmp1 = self.program(1, program1, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\r\n  </tbody>\r\n</table>\r\n<legend>Reservations</legend>\r\n<table class=\"table table-bordered table-striped\">\r\n  <thead>\r\n    <th>ID</th><th>User</th><th>Date</th> \r\n  </thead>\r\n  <tbody>\r\n    ";
    foundHelper = helpers.reservations;
    stack1 = foundHelper || depth0.reservations;
    stack2 = helpers.each;
    tmp1 = self.program(3, program3, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\r\n  </tbody>\r\n</table>\r\n\r\n";
    return buffer;});
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

window.require.define({"views/helpers": function(exports, require, module) {
  
  Handlebars.registerHelper("Date", function(date) {
    date = Date.create(date);
    return date.format("{dd}-{MM}-{yyyy}");
  });
  
}});

window.require.define({"views/issue": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, stack2, foundHelper, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

  function program1(depth0,data) {
    
    var buffer = "", stack1, stack2;
    buffer += "\r\n  <div id=\"result\">\r\n    Selected user:\r\n    <h3>";
    foundHelper = helpers.firstName;
    stack1 = foundHelper || depth0.firstName;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "firstName", { hash: {} }); }
    buffer += escapeExpression(stack1) + " ";
    foundHelper = helpers.lastName;
    stack1 = foundHelper || depth0.lastName;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "lastName", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</h3>\r\n    <h4>";
    foundHelper = helpers.username;
    stack1 = foundHelper || depth0.username;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "username", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</h4>\r\n    <h4>";
    foundHelper = helpers.email;
    stack1 = foundHelper || depth0.email;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "email", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</h4>\r\n    <hr/>\r\n  </div>\r\n  <ul id=\"books\">\r\n  ";
    foundHelper = helpers.uncommitted;
    stack1 = foundHelper || depth0.uncommitted;
    stack2 = helpers['if'];
    tmp1 = self.program(2, program2, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\r\n  </ul>\r\n  <label>Scan/Enter Book ID</label>\r\n  <input type=\"text\" id=\"bookInput\" class=\"span12\">\r\n  <button class=\"btn btn-success\" id=\"commit\">Issue</button>\r\n  <button class=\"btn btn-danger\" id=\"cancel\">Cancel</button>\r\n  ";
    return buffer;}
  function program2(depth0,data) {
    
    var buffer = "", stack1, stack2;
    buffer += "\r\n  ";
    foundHelper = helpers.uncommitted;
    stack1 = foundHelper || depth0.uncommitted;
    stack2 = helpers.each;
    tmp1 = self.program(3, program3, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\r\n  ";
    return buffer;}
  function program3(depth0,data) {
    
    var buffer = "", stack1;
    buffer += "\r\n    <li><span class=\"id\">";
    stack1 = depth0.id;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "this.id", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</span>";
    stack1 = depth0.title;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "this.title", { hash: {} }); }
    buffer += escapeExpression(stack1) + "  <small>";
    stack1 = depth0.author;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "this.author", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</small><button class=\"btn btn-danger btn-mini removeBook\">Remove</button></li>\r\n  ";
    return buffer;}

    buffer += "<div id=\"column\" class=\"offset4 span4\">\r\n  <label>Scan/Enter User ID</label>\r\n  <input type=\"text\" id=\"userInput\" class=\"span12\">\r\n  ";
    foundHelper = helpers.id;
    stack1 = foundHelper || depth0.id;
    stack2 = helpers['if'];
    tmp1 = self.program(1, program1, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\r\n</div>";
    return buffer;});
}});

window.require.define({"views/login": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "<form class=\"span4 offset4 well\">\r\n  <legend>Login</legend>\r\n  <label>Username</label>\r\n  <input id=\"username\" class=\"span12\" type=\"text\">\r\n  <label>Password</label>\r\n  <input id=\"password\" class=\"span12\" type=\"text\">\r\n  <button type=\"submit\" class=\"btn btn-info btn-block\" id=\"submit\">Login</button>\r\n</form>";});
}});

window.require.define({"views/panelView": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var foundHelper, self=this;


    return "<div id=\"search\" class=\"row-fluid\">\r\n  <input id=\"searchbox\" type=\"text\" class=\"search-query span10 offset1\" placeholder=\"Search\">\r\n</div>\r\n<ul id=\"list\" class=\"span3\"></ul>\r\n<button id=\"new\" class=\"span3 btn\">Add New</button>\r\n<div id=\"panel\" class=\"span9\"></div>";});
}});

window.require.define({"views/return": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, stack2, foundHelper, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

  function program1(depth0,data) {
    
    var buffer = "", stack1;
    buffer += "\r\n  <div id=\"result\">\r\n    Returned Book :\r\n    <h3>";
    foundHelper = helpers.title;
    stack1 = foundHelper || depth0.title;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "title", { hash: {} }); }
    buffer += escapeExpression(stack1) + " ";
    foundHelper = helpers.author;
    stack1 = foundHelper || depth0.author;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "author", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</h3>\r\n    <hr/>\r\n  </div>\r\n  ";
    return buffer;}

    buffer += "<div id=\"column\" class=\"offset4 span4\">\r\n  <label>Scan/Enter Book ID</label>\r\n  <input type=\"text\" id=\"bookInput\" class=\"span12\">\r\n  ";
    foundHelper = helpers.id;
    stack1 = foundHelper || depth0.id;
    stack2 = helpers['if'];
    tmp1 = self.program(1, program1, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\r\n</div>";
    return buffer;});
}});

window.require.define({"views/user/list": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, foundHelper, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;


    buffer += "<span class=\"id\">";
    foundHelper = helpers.id;
    stack1 = foundHelper || depth0.id;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "id", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</span>";
    foundHelper = helpers.username;
    stack1 = foundHelper || depth0.username;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "username", { hash: {} }); }
    buffer += escapeExpression(stack1);
    return buffer;});
}});

window.require.define({"views/user/panel": function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    var buffer = "", stack1, stack2, foundHelper, tmp1, self=this, functionType="function", helperMissing=helpers.helperMissing, undef=void 0, escapeExpression=this.escapeExpression;

  function program1(depth0,data) {
    
    var buffer = "", stack1, stack2;
    buffer += "\r\n      <tr><td>";
    stack1 = depth0.id;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "this.id", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</td><td>";
    stack1 = depth0.bookId;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "this.bookId", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</td><td>";
    stack1 = depth0.date;
    foundHelper = helpers.Date;
    stack2 = foundHelper || depth0.Date;
    if(typeof stack2 === functionType) { stack1 = stack2.call(depth0, stack1, { hash: {} }); }
    else if(stack2=== undef) { stack1 = helperMissing.call(depth0, "Date", stack1, { hash: {} }); }
    else { stack1 = stack2; }
    buffer += escapeExpression(stack1) + "</td><td>";
    stack1 = depth0.due;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "this.due", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</td><td>";
    stack1 = depth0.returned;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "this.returned", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</td></tr>\r\n    ";
    return buffer;}

  function program3(depth0,data) {
    
    var buffer = "", stack1, stack2;
    buffer += "\r\n      <tr><td>";
    stack1 = depth0.id;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "this.id", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</td><td>";
    stack1 = depth0.bookId;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "this.bookId", { hash: {} }); }
    buffer += escapeExpression(stack1) + "</td><td>";
    stack1 = depth0.date;
    foundHelper = helpers.Date;
    stack2 = foundHelper || depth0.Date;
    if(typeof stack2 === functionType) { stack1 = stack2.call(depth0, stack1, { hash: {} }); }
    else if(stack2=== undef) { stack1 = helperMissing.call(depth0, "Date", stack1, { hash: {} }); }
    else { stack1 = stack2; }
    buffer += escapeExpression(stack1) + "</td></tr>\r\n    ";
    return buffer;}

    buffer += "<!-- <img class=\"img-polaroid\"> -->\r\n\r\n<form>\r\n  <div>\r\n    <label>First name:</label>\r\n    <input type=\"text\" class=\"firstName\" value=\"";
    foundHelper = helpers.firstName;
    stack1 = foundHelper || depth0.firstName;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "firstName", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\">\r\n    <label>Last name:</label>\r\n    <input type=\"text\" class=\"lastName\" value=\"";
    foundHelper = helpers.firstName;
    stack1 = foundHelper || depth0.firstName;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "firstName", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\">\r\n  </div>\r\n  <div>\r\n    <label>Username:</label>\r\n    <input type=\"text\" class=\"username\" value=\"";
    foundHelper = helpers.username;
    stack1 = foundHelper || depth0.username;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "username", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\">\r\n    <label>email:</label>\r\n    <input type=\"text\" class=\"email\" value=\"";
    foundHelper = helpers.email;
    stack1 = foundHelper || depth0.email;
    if(typeof stack1 === functionType) { stack1 = stack1.call(depth0, { hash: {} }); }
    else if(stack1=== undef) { stack1 = helperMissing.call(depth0, "email", { hash: {} }); }
    buffer += escapeExpression(stack1) + "\">\r\n  </div>\r\n</form>\r\n\r\n<div class=\"buttons\">\r\n<button class=\"save btn\">Save</button>\r\n<button class=\"destroy btn btn-danger\">Delete</button>\r\n</div>\r\n<legend>Loans</legend>\r\n<table class=\"table table-bordered table-striped\">\r\n  <thead>\r\n    <th>ID</th><th>Book</th><th>Date</th><th>Due</th><th>Returned</th>\r\n  </thead>\r\n  <tbody>\r\n    ";
    foundHelper = helpers.loans;
    stack1 = foundHelper || depth0.loans;
    stack2 = helpers.each;
    tmp1 = self.program(1, program1, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\r\n  </tbody>\r\n</table>\r\n<legend>Reservations</legend>\r\n<table class=\"table table-bordered table-striped\">\r\n  <thead>\r\n    <th>ID</th><th>Book</th><th>Date</th> \r\n  </thead>\r\n  <tbody>\r\n    ";
    foundHelper = helpers.reservations;
    stack1 = foundHelper || depth0.reservations;
    stack2 = helpers.each;
    tmp1 = self.program(3, program3, data);
    tmp1.hash = {};
    tmp1.fn = tmp1;
    tmp1.inverse = self.noop;
    stack1 = stack2.call(depth0, stack1, tmp1);
    if(stack1 || stack1 === 0) { buffer += stack1; }
    buffer += "\r\n  </tbody>\r\n</table>\r\n\r\n";
    return buffer;});
}});

