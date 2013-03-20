var cookie = require('cookie'),
    util = require ("util"),
    Session = require('connect').middleware.session.Session,
    GameRoom = require('./models/game_room'),
    io = require('socket.io');

var socket;
var sessionStore;
var game_rooms = {};

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
  //console.log(client.handshake);
  //console.log(client.handshake.sessionID);
  util.log("new player has connected" + client.handshake.sessionID);
  client.on('enterGame', enterGame);
  client.on('joinGame', joinGame);

  client.on('joinRoom', joinRoom);
  client.on('getExistingChats', getExistingChats);
  client.on('getExistingUsers', getExistingUsers);
};

function updateChat(client, gameID, userID, message) {
  console.log('updating chat ' + userID + ' message ' + message);
  game_room = game_rooms[gameID];
  message = userID + ':' + message;
  game_room.chats.push(message);
  client.broadcast.to(gameID).emit('updatechat', [message]);
}

function updateUserList(client, gameID, userID) {
  console.log('updating userList ' + userID);
  game_room = game_rooms[gameID];
  game_room.users.push(userID);
  client.broadcast.to(gameID).emit('updateUserList', [userID]);
}

function joinRoom(gameID) {
  console.log('joinRoom' + gameID);
  var userID = this.handshake.session.userID;
  // forgot what this does
  this.set('gameID', gameID, function() { console.log('room ' + gameID + ' saved'); });
  // make this join the gameID 'room'
  this.join(gameID);
  game_room = game_rooms[gameID];
  updateChat(this, gameID, userID, 'has joined the room');
  updateUserList(this, gameID, userID);
}

function getExistingChats(gameID) {
  console.log('getExistingChats ' + gameID);
  var game_room = game_rooms[gameID];
  this.emit('updatechat', game_room.chats);
}

function getExistingUsers(gameID) {
  console.log('getExistingUsers ' + gameID);
  var game_room = game_rooms[gameID];
  this.emit('updateUserList', game_room.users);
}

function joinGame(userID, gameID) {
  console.log('user ' + userID + 'is going to join' + gameID);
  this.handshake.session.userID = userID;
  this.handshake.session.save();
  data = {};
  socket.sockets.emit('handleGameRequest', data);
}

// called when create or join game is called.
// create is true if we want to create a room
function enterGame(userID, gameID, create) {
  console.log('enterGame ' + userID + ' ' + gameID + ' ' + create);
  data = {};
  // save the userID in the session
  this.handshake.session.userID = userID;
  this.handshake.session.save();
  var created = gameID in game_rooms;

  if (create) {
    if (created) {
      data.failure = true;
      data.message = "gameID " + gameID + " already exists";
    }
    else {
      game_room = new GameRoom.gameRoom();
      game_rooms[gameID] = game_room;
      console.log('game room ' + gameID + ' was created');
    }
  }
  else if (!created) {
    data.failure = true;
    data.message = "gameID " + gameID + " does not exist";
  }

  socket.sockets.emit('handleGameRequest', data);
}

module.exports.io = io;
module.exports.init = init;
