var socket;
$(document).ready(function() {
  socket = io.connect('http://localhost:3000');
  socket.on('handleGameRequest', function(data) {
    if (data.failure) {
      $('#status').text(data.message);
      return;
    }

    if (data.join) {
      // append gameID to the form submission
      var gameIDInput = $("<input>", { type: "hidden", name: "gameID", value: data.gameID });
      $('#enter_game_form').append($(gameIDInput));
      $('#enter_game_form').submit();
    }
  });
});

function createGame() {
  var userName = $('#user_id').val();
  if (!userName) {
    $('#status').text('user name is null');
    return;
  }
  var gameName = $('#gameName').val();
  if (!gameName) {
    $('#status').text('game id is null');
    return;
  }
  socket.emit('createGame', userName, gameName, true);
}

function joinGame() {
  var userID = $('#user_id').val();
  if (!userID) {
    $('#status').text('user name is null');
    return;
  }
  var gameID = $('#game_id').val();
  if (!gameID) {
    $('#status').text('game id is null');
    return;
  }
  socket.emit('enterGame',userID, gameID, false);
}
