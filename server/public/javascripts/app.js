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
  var App;

  App = Em.Application.create({
    LOG_TRANSITIONS: true
  });

  module.exports = App;
  
}});

window.require.define({"controllers/session": function(exports, require, module) {
  var SessionManager;

  SessionManager = Em.StateManager.create({
    initialState: 'loggedOut',
    loggedOut: Em.State.create({
      login: function(manager, data) {
        if (data == null) {
          data = {};
        }
        return $.post("/login", data, function(user) {
          App.set("user", user);
          manager.trigger("login", user.reauth);
          return manager.transitionTo(user.admin ? 'admin' : 'user');
        }).error(function() {
          manager.trigger("error");
          return manager.transitionTo('loggedOut');
        });
      }
    }),
    admin: Em.State.create(),
    user: Em.State.create()
  });

  module.exports = SessionManager;
  
}});

window.require.define({"initialize": function(exports, require, module) {
  var attr, fill, matchers, newBook, newUser;

  window.App = require('app');

  require('templates/application');

  require('templates/login');

  require('templates/catalogue');

  require('templates/book');

  require('templates/users');

  require('templates/user');

  require('templates/issue');

  fill = function() {
    return $("#container").height($(document).height() - $("#menu").height());
  };

  $(window).resize(function() {
    return fill();
  });

  attr = DS.attr;

  App.Book = DS.Model.extend({
    isbn: attr("string"),
    title: attr("string"),
    author: attr("string"),
    description: attr("string"),
    date: attr("string"),
    dewey: attr("string")
  }).reopen({
    url: "resources/books"
  });

  App.User = DS.Model.extend({
    username: attr("string"),
    password: attr("string"),
    firstname: attr("string"),
    lastname: attr("string"),
    email: attr("string"),
    admin: attr("boolean")
  }).reopen({
    url: "resources/users"
  });

  App.SessionManager = require('controllers/session');

  App.SessionManager.on("login", function(reauth) {
    if (!reauth) {
      return App.Router.router.transitionTo("index");
    }
  });

  App.SessionManager.on("error", function() {
    return App.Router.router.transitionTo("login");
  });

  App.SessionManager.send("login");

  matchers = require("matchers");

  App.CatalogueController = Ember.ArrayController.extend({
    query: "",
    filtered: (function() {
      var content, results, val;
      val = this.get("query");
      content = this.get("content");
      results = [];
      if (!val) {
        return content;
      }
      if (val.length === 13 && !isNaN(parseInt(val)) && isFinite(val)) {
        content.forEach(function(item) {
          if (item.get("isbn") === val) {
            return results.push(item);
          }
        });
      } else {
        content.forEach(function(item) {
          var author;
          author = item.get("author").split(" ");
          if (item.get("title") === val || author[0] === val || author[1] === val) {
            return results.push(item);
          }
        });
      }
      return results;
    }).property('content.isLoaded', 'query')
  });

  App.IssueController = Ember.ObjectController.extend({
    userId: "",
    user: {},
    userError: "",
    bookId: "",
    uncommitted: Ember.A(),
    bookError: "",
    selectUser: function() {
      this.set('user', App.User.find(Number(this.get('userId'))));
      if (this.get("user").get("username") === null) {
        this.set("user", null);
        return this.set("userError", "User not found!");
      } else {
        this.set("uncommitted", Ember.A());
        return this.set('userError', null);
      }
    },
    selectBook: function() {
      var book;
      book = App.Book.find(Number(this.get('bookId')));
      if (book.get("title") === null) {
        return this.set("bookError", "Book not found!");
      } else {
        this.set("bookError", null);
        return this.uncommitted.pushObject(book);
      }
    },
    issue: function() {
      var book, url, _i, _len, _ref, _results;
      url = "" + (this.user.get('url')) + "/" + (this.user.get('id')) + "/loans";
      _ref = this.uncommitted;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        book = _ref[_i];
        _results.push($.post(url, {
          bookId: book.get("id")
        }, function() {
          return console.log("loaned");
        }));
      }
      return _results;
    },
    cancel: function() {
      return this.set("user", null);
    }
  });

  App.ApplicationView = Ember.View.extend({
    templateName: 'application',
    didInsertElement: function() {
      return fill();
    }
  });

  App.DateView = Ember.TextField.extend({
    classNames: ['date-picker'],
    didInsertElement: function() {
      return this.$().datepicker({
        format: "dd-mm-yyyy"
      });
    }
  });

  App.SubmitText = Ember.TextField.extend({
    insertNewline: function() {
      var controller;
      controller = this.get("controller");
      window.stc = controller;
      return controller[this.get("method")]();
    }
  });

  newBook = function() {
    return App.Book.createRecord({
      title: "Untitled",
      author: "Unauthored"
    });
  };

  App.IndexRoute = Ember.Route.extend({
    redirect: function() {
      return this.transitionTo('catalogue');
    }
  });

  App.LoginRoute = Ember.Route.extend({
    events: {
      login: function() {
        return App.SessionManager.send("login", {
          username: $("input.username").val(),
          password: $("input.password").val()
        });
      }
    }
  });

  App.CatalogueRoute = Ember.Route.extend({
    model: function() {
      return App.Book.find();
    },
    renderTemplate: function() {
      return this.render();
    },
    events: {
      "new": function() {
        return newBook();
      }
    }
  });

  App.BookRoute = Ember.Route.extend({
    renderTemplate: function() {
      this.render('catalogue', {
        controller: this.controllerFor("catalogue")
      });
      return this.render({
        into: 'catalogue'
      });
    },
    model: function(params) {
      return App.Book.find(params.book_id);
    },
    events: {
      save: function() {
        return this.get("controller.model").transaction.commit();
      },
      "delete": function() {
        var model;
        model = this.get("controller.model");
        model.deleteRecord();
        return model.transaction.commit();
      },
      "new": function() {
        return newBook();
      }
    }
  });

  newUser = function() {
    return App.User.createRecord({
      firstname: "Joe",
      lastname: "Bloggs"
    });
  };

  App.UsersRoute = Ember.Route.extend({
    model: function() {
      return App.User.find();
    },
    renderTemplate: function() {
      return this.render();
    },
    events: {
      "new": function() {
        return newUser();
      }
    }
  });

  App.UserRoute = Ember.Route.extend({
    renderTemplate: function() {
      this.render('users', {
        controller: this.controllerFor("users")
      });
      return this.render({
        into: 'users'
      });
    },
    model: function(params) {
      return App.User.find(params.user_id);
    },
    events: {
      save: function() {
        return this.get("controller.model").transaction.commit();
      },
      "delete": function() {
        var model;
        model = this.get("controller.model");
        model.deleteRecord();
        return model.transaction.commit();
      },
      "new": function() {
        return newUser();
      }
    }
  });

  App.IssueRoute = Ember.Route.extend({
    setupController: function() {
      App.User.find();
      return App.Book.find();
    }
  });

  App.Store = DS.Store.extend({
    revision: 11,
    adapter: DS.RESTAdapter.create({
      url: "/resources"
    })
  });

  App.Router.reopen({
    location: 'history'
  });

  App.Router.map(function() {
    this.route('index', {
      path: '/'
    });
    this.route('login', {
      path: '/login'
    });
    this.route('logout', {
      path: '/logout'
    });
    this.route('issue', {
      path: '/issue'
    });
    this.route('return', {
      path: '/return'
    });
    this.resource('catalogue', {
      path: '/catalogue'
    }, function() {
      return this.route('new');
    });
    this.resource('book', {
      path: '/catalogue/:book_id'
    });
    this.resource('users', {
      path: '/users'
    }, function() {
      return this.route('new');
    });
    return this.resource('user', {
      path: '/users/:user_id'
    });
  });

  App.initialize();
  
}});

window.require.define({"matchers": function(exports, require, module) {
  
  module.exports = {
    levenshtein: {
      score: function(a, b) {
        var L1, L2, c, cost, i, j, v0, v1, v_tmp;
        L1 = a.length;
        L2 = b.length;
        if (L1 === 0) {
          return L2;
        } else if (L2 === 0) {
          return L1;
        } else {
          if (a === b) {
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
            cost = (a[i] === a[j - 1] ? 0 : 1);
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
        var abbreviation_length, abbreviation_score, c, character_score, final_score, fuzzies, i, index_c_lowercase, index_c_uppercase, index_in_string, min_index, start_of_string_bonus, string_length, total_character_score;
        if (a === b) {
          return 1;
        }
        if (b === "") {
          return 0;
        }
        total_character_score = 0;
        abbreviation_length = b.length;
        string_length = a.length;
        fuzzies = 1;
        i = 0;
        while (i < abbreviation_length) {
          c = b.charAt(i);
          index_c_lowercase = a.indexOf(c.toLowerCase());
          index_c_uppercase = a.indexOf(c.toUpperCase());
          min_index = Math.min(index_c_lowercase, index_c_uppercase);
          index_in_string = (min_index > -1 ? min_index : Math.max(index_c_lowercase, index_c_uppercase));
          if (index_in_string === -1) {
            fuzzies += 0.5;
            continue;
          } else {
            character_score = 0.1;
          }
          if (a[index_in_string] === c) {
            character_score += 0.1;
          }
          if (index_in_string === 0) {
            character_score += 0.6;
            if (i === 0) {
              start_of_string_bonus = 1;
            }
          } else {
            if (a.charAt(index_in_string - 1) === " ") {
              character_score += 0.8;
            }
          }
          a = a.substring(index_in_string + 1, string_length);
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
  
}});

window.require.define({"templates/application": function(exports, require, module) {
  Ember.TEMPLATES['application'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [2,'>= 1.0.0-rc.3'];
  helpers = helpers || Ember.Handlebars.helpers; data = data || {};
    var buffer = '', stack1, hashTypes, self=this, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;

  function program1(depth0,data) {
    
    
    data.buffer.push("<a class=\"brand\">Library</a>");
    }

  function program3(depth0,data) {
    
    var buffer = '', stack1, stack2, hashTypes, options;
    data.buffer.push("<li id=\"menu-issue\">");
    hashTypes = {};
    options = {hash:{},inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0],types:["STRING"],hashTypes:hashTypes,data:data};
    stack2 = ((stack1 = helpers.linkTo),stack1 ? stack1.call(depth0, "issue", options) : helperMissing.call(depth0, "linkTo", "issue", options));
    if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
    data.buffer.push("</li><li id=\"menu-return\">");
    hashTypes = {};
    options = {hash:{},inverse:self.noop,fn:self.program(6, program6, data),contexts:[depth0],types:["STRING"],hashTypes:hashTypes,data:data};
    stack2 = ((stack1 = helpers.linkTo),stack1 ? stack1.call(depth0, "return", options) : helperMissing.call(depth0, "linkTo", "return", options));
    if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
    data.buffer.push("</li><li id=\"menu-catalogue\">");
    hashTypes = {};
    options = {hash:{},inverse:self.noop,fn:self.program(8, program8, data),contexts:[depth0],types:["STRING"],hashTypes:hashTypes,data:data};
    stack2 = ((stack1 = helpers.linkTo),stack1 ? stack1.call(depth0, "catalogue", options) : helperMissing.call(depth0, "linkTo", "catalogue", options));
    if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
    data.buffer.push("</li><li id=\"menu-users\">");
    hashTypes = {};
    options = {hash:{},inverse:self.noop,fn:self.program(10, program10, data),contexts:[depth0],types:["STRING"],hashTypes:hashTypes,data:data};
    stack2 = ((stack1 = helpers.linkTo),stack1 ? stack1.call(depth0, "users", options) : helperMissing.call(depth0, "linkTo", "users", options));
    if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
    data.buffer.push("</li>");
    return buffer;
    }
  function program4(depth0,data) {
    
    
    data.buffer.push("Issue");
    }

  function program6(depth0,data) {
    
    
    data.buffer.push("Return");
    }

  function program8(depth0,data) {
    
    
    data.buffer.push("Catalogue");
    }

  function program10(depth0,data) {
    
    
    data.buffer.push("Users");
    }

  function program12(depth0,data) {
    
    
    data.buffer.push("<li id=\"logout\"><a href=\"/logout\">Logout</a></li><li></li>");
    }

  function program14(depth0,data) {
    
    var buffer = '', stack1, stack2, hashTypes, options;
    data.buffer.push("<li id=\"login\">");
    hashTypes = {};
    options = {hash:{},inverse:self.noop,fn:self.program(15, program15, data),contexts:[depth0],types:["STRING"],hashTypes:hashTypes,data:data};
    stack2 = ((stack1 = helpers.linkTo),stack1 ? stack1.call(depth0, "login", options) : helperMissing.call(depth0, "linkTo", "login", options));
    if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
    data.buffer.push("</li>");
    return buffer;
    }
  function program15(depth0,data) {
    
    
    data.buffer.push("Login");
    }

    data.buffer.push("<div id=\"menu\" class=\"navbar navbar-static-top navbar-inverse\"><div class=\"navbar-inner\">");
    hashTypes = {};
    stack1 = helpers.unless.call(depth0, "App.user.admin", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashTypes:hashTypes,data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("<ul class=\"nav\">");
    hashTypes = {};
    stack1 = helpers['if'].call(depth0, "App.user.admin", {hash:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],hashTypes:hashTypes,data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("</ul><ul class=\"nav pull-right\">");
    hashTypes = {};
    stack1 = helpers['if'].call(depth0, "App.user", {hash:{},inverse:self.program(14, program14, data),fn:self.program(12, program12, data),contexts:[depth0],types:["ID"],hashTypes:hashTypes,data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("  </ul></div></div><div id=\"container\" class=\"container-fluid fill\">");
    hashTypes = {};
    data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "outlet", {hash:{},contexts:[depth0],types:["ID"],hashTypes:hashTypes,data:data})));
    data.buffer.push("</div>");
    return buffer;
    
  });
}});

window.require.define({"templates/book": function(exports, require, module) {
  Ember.TEMPLATES['book'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [2,'>= 1.0.0-rc.3'];
  helpers = helpers || Ember.Handlebars.helpers; data = data || {};
    var buffer = '', stack1, hashTypes, escapeExpression=this.escapeExpression, self=this;

  function program1(depth0,data) {
    
    var buffer = '', hashTypes;
    hashTypes = {};
    data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "id", {hash:{},contexts:[depth0],types:["ID"],hashTypes:hashTypes,data:data})));
    data.buffer.push("<br />");
    return buffer;
    }

    data.buffer.push("<img src=\"http://covers.openlibrary.org/b/isbn/");
    hashTypes = {};
    data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "ISBN", {hash:{},contexts:[depth0],types:["ID"],hashTypes:hashTypes,data:data})));
    data.buffer.push("-L.jpg\" class=\"img-polaroid\"/><form><div><label>Title:</label>");
    hashTypes = {'valueBinding': "STRING"};
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.TextField", {hash:{
      'valueBinding': ("title")
    },contexts:[depth0],types:["ID"],hashTypes:hashTypes,data:data})));
    data.buffer.push("<label>Author:</label>");
    hashTypes = {'valueBinding': "STRING"};
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.TextField", {hash:{
      'valueBinding': ("author")
    },contexts:[depth0],types:["ID"],hashTypes:hashTypes,data:data})));
    data.buffer.push("</div><div><label>Date:</label>");
    hashTypes = {'valueBinding': "STRING",'class': "STRING"};
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.TextField", {hash:{
      'valueBinding': ("date"),
      'class': ("date-picker")
    },contexts:[depth0],types:["ID"],hashTypes:hashTypes,data:data})));
    data.buffer.push("<label>ISBN:</label>");
    hashTypes = {'valueBinding': "STRING"};
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.TextField", {hash:{
      'valueBinding': ("isbn")
    },contexts:[depth0],types:["ID"],hashTypes:hashTypes,data:data})));
    data.buffer.push("<label>Dewey Decimal:</label>");
    hashTypes = {'valueBinding': "STRING"};
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.TextField", {hash:{
      'valueBinding': ("dewey")
    },contexts:[depth0],types:["ID"],hashTypes:hashTypes,data:data})));
    data.buffer.push("</div><label class=\"desc\">Description:</label>");
    hashTypes = {'valueBinding': "STRING"};
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.TextArea", {hash:{
      'valueBinding': ("description")
    },contexts:[depth0],types:["ID"],hashTypes:hashTypes,data:data})));
    data.buffer.push("</form><div class=\"buttons\"><button ");
    hashTypes = {};
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "save", {hash:{},contexts:[depth0],types:["STRING"],hashTypes:hashTypes,data:data})));
    data.buffer.push(" class=\"save btn\" >Save</button>\n<button ");
    hashTypes = {};
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "delete", {hash:{},contexts:[depth0],types:["STRING"],hashTypes:hashTypes,data:data})));
    data.buffer.push("class=\"destroy btn btn-danger\">Delete</button></div><!-- legend Copies: ");
    hashTypes = {};
    data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "copies.length", {hash:{},contexts:[depth0],types:["ID"],hashTypes:hashTypes,data:data})));
    data.buffer.push("--><!-- ");
    hashTypes = {};
    stack1 = helpers.each.call(depth0, "copies", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashTypes:hashTypes,data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("-->");
    return buffer;
    
  });
}});

window.require.define({"templates/catalogue": function(exports, require, module) {
  Ember.TEMPLATES['catalogue'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [2,'>= 1.0.0-rc.3'];
  helpers = helpers || Ember.Handlebars.helpers; data = data || {};
    var buffer = '', stack1, hashTypes, escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

  function program1(depth0,data) {
    
    var buffer = '', stack1, stack2, hashTypes, options;
    data.buffer.push("<li>");
    hashTypes = {};
    options = {hash:{},inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0,depth0],types:["ID","ID"],hashTypes:hashTypes,data:data};
    stack2 = ((stack1 = helpers.linkTo),stack1 ? stack1.call(depth0, "book", "m", options) : helperMissing.call(depth0, "linkTo", "book", "m", options));
    if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
    data.buffer.push("\n");
    return buffer;
    }
  function program2(depth0,data) {
    
    var buffer = '', hashTypes;
    hashTypes = {};
    data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "m.title", {hash:{},contexts:[depth0],types:["ID"],hashTypes:hashTypes,data:data})));
    data.buffer.push("<small>");
    hashTypes = {};
    data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "m.author", {hash:{},contexts:[depth0],types:["ID"],hashTypes:hashTypes,data:data})));
    data.buffer.push("</small></li>");
    return buffer;
    }

    data.buffer.push("<div id=\"catalogue\" class=\"advanced row-fluid\"><div class=\"row-fluid search\">");
    hashTypes = {'valueBinding': "STRING",'placeholder': "STRING",'class': "STRING"};
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.TextField", {hash:{
      'valueBinding': ("query"),
      'placeholder': ("Search"),
      'class': ("span10 offset1")
    },contexts:[depth0],types:["ID"],hashTypes:hashTypes,data:data})));
    data.buffer.push("</div><ul class=\"span3 list\">");
    hashTypes = {};
    stack1 = helpers.each.call(depth0, "m", "in", "filtered", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],hashTypes:hashTypes,data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("</ul><button ");
    hashTypes = {};
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "new", {hash:{},contexts:[depth0],types:["STRING"],hashTypes:hashTypes,data:data})));
    data.buffer.push(" class=\"span3 btn new\">Add New</button><div class=\"span9 panel\">");
    hashTypes = {};
    data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "outlet", {hash:{},contexts:[depth0],types:["ID"],hashTypes:hashTypes,data:data})));
    data.buffer.push("</div></div>");
    return buffer;
    
  });
}});

window.require.define({"templates/index": function(exports, require, module) {
  Ember.TEMPLATES['index'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [2,'>= 1.0.0-rc.3'];
  helpers = helpers || Ember.Handlebars.helpers; data = data || {};
    


    data.buffer.push("<p>BLEEEEHHHHHH</p>");
    
  });
}});

window.require.define({"templates/issue": function(exports, require, module) {
  Ember.TEMPLATES['issue'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [2,'>= 1.0.0-rc.3'];
  helpers = helpers || Ember.Handlebars.helpers; data = data || {};
    var buffer = '', stack1, hashTypes, escapeExpression=this.escapeExpression, self=this;

  function program1(depth0,data) {
    
    var buffer = '', hashTypes;
    data.buffer.push("<div class=\"alert alert-error\"><button type=\"button\" data-dismiss=\"alert\" class=\"close\">×</button>");
    hashTypes = {};
    data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "userAlert", {hash:{},contexts:[depth0],types:["ID"],hashTypes:hashTypes,data:data})));
    data.buffer.push("</div>");
    return buffer;
    }

  function program3(depth0,data) {
    
    var buffer = '', stack1, hashTypes;
    data.buffer.push("<div class=\"result\">Selected user:<h3>");
    hashTypes = {};
    data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "user.firstName", {hash:{},contexts:[depth0],types:["ID"],hashTypes:hashTypes,data:data})));
    data.buffer.push(" ");
    hashTypes = {};
    data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "user.lastName", {hash:{},contexts:[depth0],types:["ID"],hashTypes:hashTypes,data:data})));
    data.buffer.push("</h3><h4>");
    hashTypes = {};
    data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "user.username", {hash:{},contexts:[depth0],types:["ID"],hashTypes:hashTypes,data:data})));
    data.buffer.push("</h4><h4>");
    hashTypes = {};
    data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "user.email", {hash:{},contexts:[depth0],types:["ID"],hashTypes:hashTypes,data:data})));
    data.buffer.push("</h4><hr/></div><ul class=\"books\">");
    hashTypes = {};
    stack1 = helpers['if'].call(depth0, "uncommitted.length", {hash:{},inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],hashTypes:hashTypes,data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("</ul><label>Scan/Enter Book ID</label>");
    hashTypes = {};
    stack1 = helpers['if'].call(depth0, "bookAlert", {hash:{},inverse:self.noop,fn:self.program(7, program7, data),contexts:[depth0],types:["ID"],hashTypes:hashTypes,data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n");
    hashTypes = {'valueBinding': "STRING",'class': "STRING",'method': "STRING"};
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "App.SubmitText", {hash:{
      'valueBinding': ("bookId"),
      'class': ("span6"),
      'method': ("selectBook")
    },contexts:[depth0],types:["ID"],hashTypes:hashTypes,data:data})));
    data.buffer.push("\n<button ");
    hashTypes = {};
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "issue", {hash:{},contexts:[depth0],types:["STRING"],hashTypes:hashTypes,data:data})));
    data.buffer.push(" class=\"btn btn-success span3\" >Save</button>\n<button ");
    hashTypes = {};
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "cancel", {hash:{},contexts:[depth0],types:["STRING"],hashTypes:hashTypes,data:data})));
    data.buffer.push(" class=\"btn btn-danger span3\" >Cancel</button>\n");
    return buffer;
    }
  function program4(depth0,data) {
    
    var buffer = '', stack1, hashTypes;
    data.buffer.push("\n");
    hashTypes = {};
    stack1 = helpers.each.call(depth0, "uncommitted", {hash:{},inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],hashTypes:hashTypes,data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n");
    return buffer;
    }
  function program5(depth0,data) {
    
    var buffer = '', hashTypes;
    data.buffer.push("<li><span class=\"id\">");
    hashTypes = {};
    data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "id", {hash:{},contexts:[depth0],types:["ID"],hashTypes:hashTypes,data:data})));
    data.buffer.push("</span>");
    hashTypes = {};
    data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "title", {hash:{},contexts:[depth0],types:["ID"],hashTypes:hashTypes,data:data})));
    data.buffer.push("<small>");
    hashTypes = {};
    data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "author", {hash:{},contexts:[depth0],types:["ID"],hashTypes:hashTypes,data:data})));
    data.buffer.push("</small><button class=\"btn btn-danger btn-mini removeBook\">Remove</button></li>");
    return buffer;
    }

  function program7(depth0,data) {
    
    var buffer = '', hashTypes;
    data.buffer.push("<div class=\"alert alert-error\"><button type=\"button\" data-dismiss=\"alert\" class=\"close\">×</button>");
    hashTypes = {};
    data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "bookAlert", {hash:{},contexts:[depth0],types:["ID"],hashTypes:hashTypes,data:data})));
    data.buffer.push("</div>");
    return buffer;
    }

    data.buffer.push("<div id=\"issue\" class=\"row-fluid\"><div class=\"offset4 span4 column\"><label>Scan/Enter User ID</label>");
    hashTypes = {};
    stack1 = helpers['if'].call(depth0, "userAlert", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],hashTypes:hashTypes,data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n");
    hashTypes = {'valueBinding': "STRING",'class': "STRING",'method': "STRING"};
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "App.SubmitText", {hash:{
      'valueBinding': ("userId"),
      'class': ("span12"),
      'method': ("selectUser")
    },contexts:[depth0],types:["ID"],hashTypes:hashTypes,data:data})));
    data.buffer.push("\n");
    hashTypes = {};
    stack1 = helpers['if'].call(depth0, "user.id", {hash:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],hashTypes:hashTypes,data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("</div></div>");
    return buffer;
    
  });
}});

window.require.define({"templates/login": function(exports, require, module) {
  Ember.TEMPLATES['login'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [2,'>= 1.0.0-rc.3'];
  helpers = helpers || Ember.Handlebars.helpers; data = data || {};
    var buffer = '', hashTypes, escapeExpression=this.escapeExpression;


    data.buffer.push("<div id=\"login\" class=\"row-fluid\"><form class=\"span4 offset4 well\"><legend>Login<label>Username</label><input type=\"text\" class=\"input-block-level username\"/><label>Password</label><input type=\"password\" class=\"input-block-level password\"/><button ");
    hashTypes = {};
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "login", {hash:{},contexts:[depth0],types:["STRING"],hashTypes:hashTypes,data:data})));
    data.buffer.push(" class=\"btn btn-info btn-block submit\" type=\"submit\">Login</button></legend></form></div>");
    return buffer;
    
  });
}});

window.require.define({"templates/user": function(exports, require, module) {
  Ember.TEMPLATES['user'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [2,'>= 1.0.0-rc.3'];
  helpers = helpers || Ember.Handlebars.helpers; data = data || {};
    var buffer = '', hashTypes, escapeExpression=this.escapeExpression;


    data.buffer.push("<form><div><label>First name:</label>");
    hashTypes = {'valueBinding': "STRING"};
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.TextField", {hash:{
      'valueBinding': ("firstname")
    },contexts:[depth0],types:["ID"],hashTypes:hashTypes,data:data})));
    data.buffer.push("<label>Last name:</label>");
    hashTypes = {'valueBinding': "STRING"};
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.TextField", {hash:{
      'valueBinding': ("lastname")
    },contexts:[depth0],types:["ID"],hashTypes:hashTypes,data:data})));
    data.buffer.push("<label>Email:</label>");
    hashTypes = {'valueBinding': "STRING"};
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.TextField", {hash:{
      'valueBinding': ("email")
    },contexts:[depth0],types:["ID"],hashTypes:hashTypes,data:data})));
    data.buffer.push("</div><div><label>Username:</label>");
    hashTypes = {'valueBinding': "STRING"};
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.TextField", {hash:{
      'valueBinding': ("username")
    },contexts:[depth0],types:["ID"],hashTypes:hashTypes,data:data})));
    data.buffer.push("<label>Password:</label>");
    hashTypes = {'valueBinding': "STRING",'placeholder': "STRING"};
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.TextField", {hash:{
      'valueBinding': ("password"),
      'placeholder': ("•••••••")
    },contexts:[depth0],types:["ID"],hashTypes:hashTypes,data:data})));
    data.buffer.push("<label>Type:</label><div data-toggle=\"buttons-radio\" class=\"btn-group\"><button type=\"button\" name=\"type\" value=\"1\" class=\"btn\">admin</button><button type=\"button\" name=\"type\" value=\"0\" class=\"btn\">user</button></div></div></form><div class=\"buttons\"><button ");
    hashTypes = {};
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "save", {hash:{},contexts:[depth0],types:["STRING"],hashTypes:hashTypes,data:data})));
    data.buffer.push(" class=\"save btn\" >Save</button>\n<button ");
    hashTypes = {};
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "delete", {hash:{},contexts:[depth0],types:["STRING"],hashTypes:hashTypes,data:data})));
    data.buffer.push("class=\"destroy btn btn-danger\">Delete</button></div>");
    return buffer;
    
  });
}});

window.require.define({"templates/users": function(exports, require, module) {
  Ember.TEMPLATES['users'] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [2,'>= 1.0.0-rc.3'];
  helpers = helpers || Ember.Handlebars.helpers; data = data || {};
    var buffer = '', stack1, hashTypes, escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

  function program1(depth0,data) {
    
    var buffer = '', stack1, stack2, hashTypes, options;
    data.buffer.push("<li>");
    hashTypes = {};
    options = {hash:{},inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0,depth0],types:["ID","ID"],hashTypes:hashTypes,data:data};
    stack2 = ((stack1 = helpers.linkTo),stack1 ? stack1.call(depth0, "user", "m", options) : helperMissing.call(depth0, "linkTo", "user", "m", options));
    if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
    data.buffer.push("</li>");
    return buffer;
    }
  function program2(depth0,data) {
    
    var buffer = '', hashTypes;
    hashTypes = {};
    data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "m.firstname", {hash:{},contexts:[depth0],types:["ID"],hashTypes:hashTypes,data:data})));
    hashTypes = {};
    data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "m.lastname", {hash:{},contexts:[depth0],types:["ID"],hashTypes:hashTypes,data:data})));
    return buffer;
    }

    data.buffer.push("<div id=\"users\" class=\"row-fluid\"><div class=\"row-fluid search\">");
    hashTypes = {'valueBinding': "STRING",'placeholder': "STRING",'class': "STRING"};
    data.buffer.push(escapeExpression(helpers.view.call(depth0, "Ember.TextField", {hash:{
      'valueBinding': ("query"),
      'placeholder': ("Search"),
      'class': ("span10 offset1")
    },contexts:[depth0],types:["ID"],hashTypes:hashTypes,data:data})));
    data.buffer.push("</div><ul class=\"span3 list\">");
    hashTypes = {};
    stack1 = helpers.each.call(depth0, "m", "in", "model", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],hashTypes:hashTypes,data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("</ul><button ");
    hashTypes = {};
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "new", {hash:{},contexts:[depth0],types:["STRING"],hashTypes:hashTypes,data:data})));
    data.buffer.push(" class=\"span3 btn new\">Add New</button><div class=\"span9 panel\">");
    hashTypes = {};
    data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "outlet", {hash:{},contexts:[depth0],types:["ID"],hashTypes:hashTypes,data:data})));
    data.buffer.push("</div></div>");
    return buffer;
    
  });
}});

