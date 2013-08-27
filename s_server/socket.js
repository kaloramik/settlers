var cookie = require('cookie'),
    util = require ("util"),
    Session = require('connect').middleware.session.Session,
    io = require('socket.io'),
    mongoose = require('mongoose'),
    GameRoom = require('./models/GameRoom'),
    GameRoomHandler = require('./libs/GameRoomHandler'),
    gameRoomSockets = require('./sockets/GameRoomSockets');

mongoose.connect('mongodb://localhost/test');
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log('connected!');
 });

var socket;
var sessionStore;


var init = function(server, sessionStore) {

  socket = io.listen(server);
  this.sessionStore = sessionStore;

  socket.set('authorization', function (data, accept) {
    // check if there's a cookie header
    if (data.headers.cookie) {
        // if there is, parse the cookie
        data.cookie = cookie.parse(data.headers.cookie);
        // save session store in data, as required by Session constructor
        data.sessionStore = sessionStore;
        // cookie parser parses string as s:<cookie>.<unknown shit>
        data.sessionID = data.cookie['express.sid'].split('.')[0].substring(2);
        sessionStore.get(data.sessionID, function(err, session) {
          if (err || !session) {
            accept(err, false);
          } else {
            // adds new session in to session Store
            data.session = new Session(data, session);
            accept(null, true);
          }
        });
      } else {
       // if there isn't, turn down the connection with a message
       // and leave the function.
       return accept('No cookie transmitted.', false);
     }
  });

  socket.configure(function() {
    socket.set("log level", 2);
  });

  setEventHandlers();
  return socket;
};

function setEventHandlers() {
  socket.sockets.on('connection', onSocketConnection);
};

function onSocketConnection(client) {
  util.log("new player has connected" + client.handshake.sessionID);
  gameRoomSockets.addClientListeners(client);


  client.on('createGame', _createGame);
  client.on('joinGame', _joinGame);
};

function _createGame(userName, gameName) {
  console.log('createGame ' + userName + ' ' + gameName);
  // save the userName for this session
  this.handshake.session.userName = userName;
  this.handshake.session.save();
  GameRoomHandler.createGameRoom(gameName, function(err, gameRoom, exists) {
    var data = {};
    if (exists) {
      data.success = false;
      data.message = "gameID " + gameName + " already exists";
    } else {
      data.success = true;
      data.message = "gameID " + gameName + " was created";
      console.log('gameroom was created id: ' + gameRoom._id);
      console.log('gameroom was created gameName: ' + gameRoom.gameName);
      data.gameID = gameRoom._id;
      data.join = true;
      data.userName = userName;
      data.gameName = gameName;
    }
    this.emit('handleGameRequest', data);
  }.bind(this));
}

function _joinGame(userName, gameName) {
  //is called when someone joins an existing game
  console.log('joinGame' + userName + ' ' + gameName);
  // save the userName for this session
  this.handshake.session.userName = userName;
  this.handshake.session.save();

  GameRoomHandler.checkRoom(gameName, function(err, gameRoom, canJoin) {
    var data = {};
    data.success = canJoin;
    data.message = err;
    data.userName = userName;
    data.join = false;
    if (gameRoom) {
      data.gameID = gameRoom._id;
      data.join = true;
    }

    console.log('join game result was ' );
    console.log(data);
    this.emit('handleGameRequest', data);
  }.bind(this));
}

// reorganized so that pple who create a room and pple who join existing rooms
// use the same function to setup their boards

module.exports.io = io;
module.exports.init = init;
