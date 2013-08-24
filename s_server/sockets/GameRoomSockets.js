var mongoose = require('mongoose'),
    GameRoom = require('../models/GameRoom');

function joiningRoom(gameID) {
  console.log("user name " + userName + "joining " + gameID);
  var userName = this.handshake.session.userName;
  if (!userName) {
    console.log("user name is undefined");
    return;
  }
  // join the socket room
  this.join(gameID);
  GameRoom.findOne({_id: gameID}, function(err, gameRoom) {
    if (gameRoom.playerList && (gameRoom.playerList.indexOf(userName) > -1)) {
      console.log("player already in game");
      this.emit('updateUserList', gameRoom.playerList);
      return;
    }
    gameRoom.playerList.push(userName);
    gameRoom.playerObjList.push([2,4,4,2,0,0]);
    gameRoom.save();
    console.log("found the game!");
    // TODO: this kinda sucks, see if theres a better way, or pass in the io socket
    // somewhere
    this.emit('updateUserList', gameRoom.playerList);
    this.broadcast.to(gameID).emit('updateUserList', gameRoom.playerList);
  }.bind(this));
}

function getExistingUsers(gameID) {
  GameRoom.findOne({_id: gameID}, function(err, gameRoom) {
    this.emit('updateUserList', gameRoom.playerList);
  }.bind(this));
}

function sendChat(gameID, message) {
  this.emit('updateChat', message);
  this.broadcast.to(gameID).emit('updateChat', message);
}

function addClientListeners(client) {
  client.on('joiningRoom',  joiningRoom);
  client.on('getExistingUsers', getExistingUsers);
  client.on('sendChat', sendChat);
}

module.exports.addClientListeners = addClientListeners;

