var socket;
$(document).ready(function() {
  socket = io.connect('http://localhost:3000');
  socket.on('handleGameRequest', function(data) {
    if (data.success == false) {
      createSigninError(data.message);
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

function createSigninError(msg) {
  var form = $('#enter_game_form');
  $("#signinError").remove();
  var alertDiv = $("<div>", {class: "alert alert-error", text: msg, id: "signinError"});
  var alertDivDismiss = $("<a>", {"class": "close", "data-dismiss": "alert", "href": "#", "text": "x"});
  alertDiv.append(alertDivDismiss);
  form.prepend(alertDiv);
}

function createGame() {
  var userName = $('#userName').val();
  if (!userName) {
    createSigninError('user name is empty');
    return;
  }
  var gameName = $('#gameName').val();
  if (!gameName) {
    createSigninError('game name is empty');
    return;
  }
  socket.emit('createGame', userName, gameName);
}

function joinGame() {
  var userName = $('#userName').val();
  if (!userName) {
    createSigninError('user name is empty');
    return;
  }
  var gameName = $('#gameName').val();
  if (!gameName) {
    createSigninError('game name is empty');
    return;
  }
  socket.emit('joinGame',userName, gameName);
}
