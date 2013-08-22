var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var gameRoomSchema = new Schema({
  gameName : { type: String, required: true},
  playerList: [String],
  currentTurn: String,
  state: String
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
