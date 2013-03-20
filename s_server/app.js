/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , socket_handler = require('./socket')
  , MemoryStore = require('express').session.MemoryStore
  , sessionStore = new MemoryStore()
  , winston = require('winston');

var app = express();


// crappy logger for debugging, replace with something better
var logger = function(req, res, next) {
  console.log("GOT REQUEST!");
  console.log("method is " + req.method);
  console.log("url is " + req.url);
  next();
}
app.configure(function(){
  app.use(logger);
  app.use(express.cookieParser('secret'));
  app.use(express.session({
    secret: 'secret',
    store: sessionStore, 
    cookie: {httpOnly: true},
    key: 'express.sid'}));
  app.set('port', process.env.PORT || 3000);
  app.use(express.bodyParser());
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  //app.set('view cache', true);
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'))
});

app.get("/", function (request, response) {
  response.render("home.jade", { title: "this is a title", sessionID: request.sessionID});
});

// chrome requests favicon always, creating additional sessions
// add placeholder until we get real ones
app.get("/favicon.ico", function (req, res) {
  res.code = 200;
});

// redirect /game?id=<id> to /game/id
// can change js in post to dynamically do this instead 
app.post("/game", function (req, res) {
  var gameID = req.body.gameID;
  res.redirect('/game/' + gameID);
});

app.get("/game/:gameID", function (req, res) {
  res.render("game_room.jade", {gameID: req.params.gameID, sessionID: req.sessionID});
});

var server = http.createServer(app);
var socket = socket_handler.init(server, sessionStore);
server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
