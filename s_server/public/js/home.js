var socket;
$(document).ready(function() {
  socket = io.connect('http://localhost:3000');
  socket.on('handleGameRequest', function(data) {
    if (data.failure) {
      $('#status').text(data.message);
      return;
    }
    $('#enter_game_form').submit();
  });
});

function createGame() {
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
  socket.emit('enterGame',userID, gameID, true);
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