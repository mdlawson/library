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

window.require.define({"test/server/api": function(exports, require, module) {
  var HOST, PORT, app, bcrypt, expect, request;

  expect = require('chai').expect;

  request = require('superagent');

  bcrypt = require('bcrypt');

  app = require('../../server/app.coffee');

  PORT = 3333;

  HOST = "localhost:" + PORT;

  describe("API Server", function() {
    var server;
    server = null;
    it("can be started", function() {
      server = app.startServer(PORT, '../../server/public');
      return expect(server).to.be.a('function');
    });
    return describe("User API", function() {
      var admin, backdoor, data, user;
      backdoor = request.agent();
      it("should let us log in with test backdoor", function(done) {
        return backdoor.post("" + HOST + "/login").send({
          username: "backdoor",
          password: ""
        }).end(function(res) {
          expect(res.status).to.equal(200);
          return done();
        });
      });
      it("should let us make a new (admin) user", function(done) {
        return backdoor.post("" + HOST + "/resources/users").send({
          username: "admintest",
          password: "admintest",
          firstName: "admin",
          lastName: "test",
          email: "admin@test.com",
          admin: 1
        }).end(function(res) {
          expect(res.status).to.equal(200);
          return done();
        });
      });
      data = null;
      it("should allow users to be listed", function(done) {
        return backdoor.get("" + HOST + "/resources/users", function(res) {
          data = res.body;
          return done();
        });
      });
      it("should list our new user", function() {
        return expect(data[data.length - 1].username).to.equal("admintest");
      });
      it("should have encrypted our users password", function() {
        return expect(bcrypt.compareSync("admintest", data[data.length - 1].password)).to.be["true"];
      });
      admin = request.agent();
      it("should allow our new admin to log on", function(done) {
        return admin.post("" + HOST + "/login").send({
          username: "admintest",
          password: "admintest"
        }).end(function(res) {
          expect(res.status).to.equal(200);
          expect(res.body.admin).to.equal(1);
          expect(res.body.id).to.be.a("number");
          admin.id = res.body.id;
          return done();
        });
      });
      it("should allow the admin to make a new (normal) user", function(done) {
        return admin.post("" + HOST + "/resources/users").send({
          username: "usertest",
          password: "nottherightpassword",
          firstName: "user",
          lastName: "test",
          email: "user@test.com",
          admin: 0
        }).end(function(res) {
          expect(res.status).to.equal(200);
          return done();
        });
      });
      user = request.agent();
      it("should allow our new user to log on", function(done) {
        return user.post("" + HOST + "/login").send({
          username: "usertest",
          password: "nottherightpassword"
        }).end(function(res) {
          expect(res.status).to.equal(200);
          expect(res.body.admin).to.equal(0);
          expect(res.body.id).to.be.a("number");
          user.id = res.body.id;
          return done();
        });
      });
      it("should let users access their own data", function(done) {
        return user.get("" + HOST + "/resources/users/" + user.id, function(res) {
          expect(res.status).to.equal(200);
          return done();
        });
      });
      it("shouldnt let users access other user's data", function(done) {
        return user.get("" + HOST + "/resources/users", function(res) {
          expect(res.status).to.equal(401);
          return done();
        });
      });
      it("should let users log out", function(done) {
        return user.get("" + HOST + "/logout", function(res) {
          expect(res.status).to.equal(200);
          return done();
        });
      });
      it("should not allow logged out users to access data", function(done) {
        return user.get("" + HOST + "/resources/users", function(res) {
          expect(res.status).to.equal(401);
          return done();
        });
      });
      it("should allow admins to edit users", function(done) {
        return admin.put("" + HOST + "/resources/users/" + user.id).send({
          password: "usertest"
        }).end(function(res) {
          expect(res.status).to.equal(200);
          expect(bcrypt.compareSync("usertest", res.body.password)).to.be["true"];
          return done();
        });
      });
      return it("should allow admins to delete users", function(done) {
        return admin.del("" + HOST + "/resources/users/" + admin.id).end(function(res) {
          expect(res.status).to.equal(200);
          return admin.del("" + HOST + "/resources/users/" + user.id).end(function(res) {
            expect(res.status).to.equal(200);
            return done();
          });
        });
      });
    });
  });
  
}});

window.require.define({"test/server/database": function(exports, require, module) {
  var expect, mysql;

  expect = require('chai').expect;

  mysql = require('mysql');

  describe("MySQL Database", function() {
    var con;
    con = null;
    it("can be logged in", function(done) {
      con = mysql.createConnection(require('../../server/db'));
      return con.connect(function(err) {
        expect(err).to.not.exist;
        return done();
      });
    });
    return it("can be queried", function(done) {
      return con.query("show tables", function(err, results) {
        expect(err).to.not.exist;
        expect(results).to.exist;
        return done();
      });
    });
  });
  
}});


