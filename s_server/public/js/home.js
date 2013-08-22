var socket;
$(document).ready(function() {
  socket = io.connect('http://localhost:3000');
  socket.on('handleGameRequest', function(data) {
    if (data.success == false) {
      $('#status').text(data.message);
      return;
    }

    if (data.join) {
      // append gameID to the form submission
      // TODO: make this a real post so we dont have to do this input shit
      var gameIDInput = $("<input>", { type: "hidden", name: "gameID", value: data.gameID });
      var userNameInput = $("<input>", { type: "hidden", name: "userName", value: data.userName });
      $('#enter_game_form').append($(gameIDInput));
      $('#enter_game_form').append($(userNameInput));
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
  socket.emit('createGame', userName, gameName);
}

function joinGame() {
  var userName = $('#user_id').val();
  if (!userName) {
    $('#status').text('user name is null');
    return;
  }
  var gameName = $('#gameName').val();
  if (!gameName) {
    $('#status').text('game name is null');
    return;
  }
  socket.emit('joinGame',userName, gameName);
}
