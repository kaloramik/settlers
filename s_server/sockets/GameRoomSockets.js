//list of all the socket interactions (server side) on the game page

var mongoose = require('mongoose'),
    GameRoom = require('../models/GameRoom');
    GameRoomHandler = require('../libs/GameRoomHandler');

function joiningRoom(gameID) {
  var userName = this.handshake.session.userName;
  console.log("user name " + userName + " joining " + gameID);
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
    gameRoom.playerObjList.push({
      "resourceList": [0,0,0,0,0],
      "portList":[0,0,0,0,0,0],
      "devCards": 0,
      "ownedVertices": [],
      "ownedEdges": [],
      "name": userName});
    gameRoom.save();

    console.log("found the game!");
    // TODO: this kinda sucks, see if theres a better way, or pass in the io socket
    // somewhere
    this.emit('updateUserList', gameRoom.playerList);
    this.broadcast.to(gameID).emit('updateUserList', gameRoom.playerList);

    var data = {
      "userName": userName,
      "boardID": gameRoom.boardID,
      "resourceList": gameRoom.resourceList,
      "portList": gameRoom.portList,
      "rollList": gameRoom.rollList,
      "portResourceList": gameRoom.portResourceList
    };

    console.log(data.userName)
    this.emit('setupGame', data);
  }.bind(this));
}

function updateBoard(gameID, data){
  var _this = this;
  GameRoomHandler.updateRoom(gameID, function(err, gameRoom){
    if (data.type == "turn"){
      gameRoom.currentTurn = data.turn;
    }
    else if (data.type == "vertex"){
      var player = gameRoom.playerObjList[data.owner];
      if (data.buildingType == 1)
        player.ownedVertices.push([data.id, data.buildingType])
      else if (data.buildingType == 2){
        for (var i=0; i<player.ownedVertices.length; i++)
          if (player.ownedVertices[i][0] == data.id)
            player.ownedVertices[i][1] = 2;
      }
      if (data.portType != -1){
        player.portList[data.portType] = 1;
      }
    }
    else if (data.type == "edge"){
      var player = gameRoom.playerObjList[data.owner];
      player.ownedEdges.push(data.id)
    }
    else if (data.type == "start"){
      GameRoomHandler.fisherYates(gameRoom.playerObjList);
      data["playerData"] = gameRoom.playerObjList;
      //negative turn order for the pre-game
      gameRoom.currentTurn = - 2 * gameRoom.playerObjList.length;
      // when you start game, send the orignal socket the player info as well
      _this.emit('receiveBoardUpdate', data);
    }
    gameRoom.save();
    console.log(data);
    _this.broadcast.to(gameID).emit('receiveBoardUpdate', data)
  }) 
}

function getExistingUsers(gameID){
  GameRoom.findOne({_id: gameID}, function(err, gameRoom) {
    this.emit('updateUserList', gameRoom.playerList);
  }.bind(this));
}

function sendChat(gameID, message){
  this.emit('updateChat', message);
  this.broadcast.to(gameID).emit('updateChat', message);
}

function startGame(gameID){
  var _this = this;
  GameRoomHandler.updateRoom(gameID, function(err, gameRoom){
    //randomize turn order
  })
}

function addClientListeners(client) {
  client.on('joiningRoom',  joiningRoom);
  client.on('getExistingUsers', getExistingUsers);
  client.on('sendChat', sendChat);
  client.on('transmitBoardUpdate', updateBoard);
}

module.exports.addClientListeners = addClientListeners;
