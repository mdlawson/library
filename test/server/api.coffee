{expect} = require 'chai'
request = require 'superagent'
bcrypt = require 'bcrypt'
app = require '../../server/app.coffee'


PORT = 3333
HOST = "localhost:#{PORT}"

describe "API Server", ->
  server = null
  it "can be started", ->
    server = app.startServer PORT,'../../server/public'
    expect(server).to.be.a 'function'
  describe "User API", ->
    backdoor = request.agent()
    it "should let us log in with test backdoor", (done) ->
      backdoor.post("#{HOST}/login").send(username: "backdoor", password: "").end (res) ->
        expect(res.status).to.equal 200
        done()
    it "should let us make a new (admin) user", (done) ->
      backdoor.post("#{HOST}/resources/users").send(
        username: "admintest", 
        password: "admintest", 
        firstName: "admin", 
        lastName: "test", 
        email: "admin@test.com", 
        admin: 1
      ).end (res) ->
        expect(res.status).to.equal 200
        done()
    data = null
    it "should allow users to be listed", (done) ->
      backdoor.get "#{HOST}/resources/users", (res) ->
        #expect(res.body.length).to.be.at.least(1)
        data = res.body
        done()
    it "should list our new user", ->
      expect(data[data.length-1].username).to.equal("admintest")
    it "should have encrypted our users password", ->
      expect(bcrypt.compareSync("admintest",data[data.length-1].password)).to.be.true
    admin = request.agent()
    it "should allow our new admin to log on", (done) ->
      admin.post("#{HOST}/login").send(username: "admintest", password: "admintest").end (res) ->
        expect(res.status).to.equal 200
        expect(res.body.admin).to.equal 1
        expect(res.body.id).to.be.a "number"
        admin.id = res.body.id
        done()
    it "should allow the admin to make a new (normal) user", (done) ->
      admin.post("#{HOST}/resources/users").send(
        username: "usertest", 
        password: "nottherightpassword", 
        firstName: "user", 
        lastName: "test", 
        email: "user@test.com", 
        admin: 0
      ).end (res) ->
        expect(res.status).to.equal 200
        done()
    user = request.agent()
    it "should allow our new user to log on", (done) ->
      user.post("#{HOST}/login").send(username: "usertest", password: "nottherightpassword").end (res) ->
        expect(res.status).to.equal 200
        expect(res.body.admin).to.equal 0
        expect(res.body.id).to.be.a "number"
        user.id = res.body.id
        done()
    it "should let users access their own data", (done) ->
      user.get "#{HOST}/resources/users/#{user.id}", (res) ->
        expect(res.status).to.equal 200
        done()
    it "shouldnt let users access other user's data", (done) ->
      user.get "#{HOST}/resources/users", (res) ->
        expect(res.status).to.equal 401
        done()
    it "should let users log out", (done) ->
      user.get "#{HOST}/logout", (res) ->
        expect(res.status).to.equal 200
        done()
    it "should not allow logged out users to access data", (done) ->
      user.get "#{HOST}/resources/users", (res) ->
        expect(res.status).to.equal 401
        done()
    it "should allow admins to edit users", (done) ->
      admin.put("#{HOST}/resources/users/#{user.id}").send(password: "usertest").end (res) ->
        expect(res.status).to.equal 200
        expect(bcrypt.compareSync("usertest",res.body.password)).to.be.true
        done()
    it "should allow admins to delete users", (done) ->
      admin.del("#{HOST}/resources/users/#{admin.id}").end (res) ->
        expect(res.status).to.equal 200
        admin.del("#{HOST}/resources/users/#{user.id}").end (res) ->
          expect(res.status).to.equal 200
          done()





