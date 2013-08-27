var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var gameRoomSchema = new Schema({
  gameName : { type: String, required: true},
  playerList: [String],

  //********************************************
  // Next 5 lists are used to initialize the board
  boardID: [],
  resourceList: [],
  portList: [],
  rollList: [],
  portResourceList: [],
  devCardList: [],
  //********************************************


  //********************************************
  // these lists determine the game state
  currentTurn: Number,  //positive integer
  state: String,     //setup, play, pause
  robber: Number,       //hexID
  playerObjList: [], //list of players and their current resources/devCards
  //********************************************


  // player list ? num players?
  // current Turn
  // state => unstarted, prestart,
  //
  // board
  // dice rolls
  // number of resource cards
  // dev cards
  //
});

module.exports = mongoose.model('GameRoom', gameRoomSchema);
