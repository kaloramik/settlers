var self = this;

var mongoose = require('mongoose'),
    GameRoom = require('../models/GameRoom');

// attempts to create a game room. if one already exists,
// use that one. callback takes (error, createdGameRoom)
self.createGameRoom = function(gameName, callback) {
  GameRoom.findOne({gameName: gameName}, function(err, gameRoom) {
    var existed = true;
    if (gameRoom == null) {
      gameRoom = new GameRoom(
        {
          gameName: gameName,
          playerList: [],
          currentTurn: "",
          state: "waiting"
        }
      );
      gameRoom.save();
      existed = false;
    }

    if (typeof callback === "function") {
        callback(err, gameRoom, existed);
    }
  });
}

self.checkRoom = function(gameName, callback) {
  GameRoom.findOne({gameName: gameName}, function(err, gameRoom) {
    // TODO: handle err
    var canJoin = true;
    if (gameRoom == null) {
      canJoin = false;
      err = "room does not exist";
    }
    // TODO: check num players as well
    if (typeof callback === "function") {
      callback(err, gameRoom, canJoin);
    }
  });
}

module.exports = self;
