/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , socket_handler = require('./socket')
  , MemoryStore = require('express').session.MemoryStore
  , sessionStore = new MemoryStore()
  , winston = require('winston')
  , mainPage = require('./routes/mainPage')
  , GameRoomHandler = require('./libs/GameRoomHandler')

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

app.get("/", mainPage.mainPage);

// chrome requests favicon always, creating additional sessions
// add placeholder until we get real ones
app.get("/favicon.ico", function (req, res) {
  res.code = 200;
});

// redirect /game?id=<id> to /game/id



// can change js in post to dynamically do this instead
app.post("/game", function (req, res) {
  var gameID = req.body.gameID;
  var gameName = req.body.gameName;
  res.redirect('/game/' + gameName);
});

app.get("/game/:gameName", function (req, res) {
  // TODO: should really change this to post...
  // At this point, user info should be in the req.session hopefully...
  var gameName = req.params.gameName
  GameRoomHandler.checkRoom(gameName, function(err, gameRoom){
    var gameID = gameRoom._id;
    console.log('this is the game id ' + gameID);
    res.render("game_room.jade",
               {
                 gameID: gameID,
                 sessionID: req.sessionID
               });
  })
});

var server = http.createServer(app);
var socket = socket_handler.init(server, sessionStore);
server.listen(app.get('port'), function() {
  console.log("Express server listening on port " + app.get('port'));
});
