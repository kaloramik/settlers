var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var gameRoomSchema = new Schema({
  gameName : { type: String, required: true}
});

module.exports = mongoose.model('GameRoom', gameRoomSchema);
