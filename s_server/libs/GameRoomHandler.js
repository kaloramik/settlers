//game logic
//no socket stuff!

var self = this;

var mongoose = require('mongoose'),
    GameRoom = require('../models/GameRoom');

// attempts to create a game room. if one already exists,
// use that one. callback takes (error, createdGameRoom)

function initializeGameBoard(){

  var boardID = [[0,0],[1,0],[2,0],[3,1],[4,2],[4,3],[4,4],[3,4],[2,4],[1,3],[0,2],[0,1],[1,1],[2,1],[3,2],[3,3],[2,3],[1,2],[2,2]]
  //  for original game:  
  //4 wood //4 wheat //4 sheep //3 brick //3 ore //1 desert
  var resourceList = [-1,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,4,4,4];
  var portList = [[-1,-1,1,4], [1,-1,2,5], [3,0,2,5], [4,2,0,0], [4,3,1,1], [3,4,1,1], [2,4,2,2], [0,3,0,3], [-1,1,0,3]];

  var rollList = [5,2,6,3,8,10,9,12,11,4,8,10,9,4,5,6,3,11];
  var portResourceList = [0,1,2,3,4,5,5,5,5];
  var devCardList = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,2,2,3,3,4,4];
  // 14 knights
  // 5 vic
  // 2 monopoly
  // 2 road
  // 2 year of plenty

  // if (!debug){
    //randomizes the elements in array
  self.fisherYates(resourceList);
  self.fisherYates(portResourceList);
  self.fisherYates(devCardList);
  return [boardID, resourceList, portList, rollList, portResourceList, devCardList];
}

self.fisherYates = function(myArray){
    //randomizes the elements of the array
    var i = myArray.length;
    var j, tempi, tempj;
    if (i==0) return false;
    while (--i){
        j = Math.floor(Math.random() * (i + 1));
        tempi = myArray[i];
        tempj = myArray[j];
        myArray[i] = tempj;
        myArray[j] = tempi;
    }
}

self.createGameRoom = function(gameName, callback) {
  GameRoom.findOne({gameName: gameName}, function(err, gameRoom) {
    var existed = true;
    if (gameRoom == null) {

      //************ CREATE THE GAME ****************
      // initialize the game board here (randomize stuff)
      var boardData = initializeGameBoard();
      gameRoom = new GameRoom(
        {
          gameName: gameName,
          playerList: [],
          boardID: boardData[0],
          resourceList: boardData[1],
          portList: boardData[2],
          rollList: boardData[3],
          portResourceList: boardData[4],
          devCardList: boardData[5],
          currentTurn: 0,
          state: "waiting",
          robber: 0,
          playerObjList: [],
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

self.updateRoom = function(gameID, callback) {
 //finds room by ID
  GameRoom.findOne({_id: gameID}, function(err, gameRoom) {
    // TODO: handle err
    var canJoin = true;
    if (gameRoom == null) {
      canJoin = false;
      err = "room does not exist";
    }
    if (typeof callback === "function") {
      callback(err, gameRoom);
    }
  });
}

module.exports = self;