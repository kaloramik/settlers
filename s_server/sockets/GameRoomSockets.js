
function joiningRoom(gameID) {
  console.log("joining room");
}
function addClientListeners(client) {
  client.on('joiningRoom',  joiningRoom);
}

module.exports.addClientListeners = addClientListeners;

