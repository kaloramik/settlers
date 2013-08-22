var socket;
var gameID = location.pathname.match(/\/game\/(.*)/)[1];
$(document).ready(function() {
  socket = io.connect('http://localhost:3000');
  socket.on('connect', function() {
    socket.emit('joiningRoom', gameID);
  });

  socket.on('updateChat', function (message) {
      $("#conversation").append('<b>' + message + '</b> <br>' );
  });

  socket.on('updateUserList', function (data) {
    $("#users").empty();
    for (var i = 0; i < data.length; i++) {
      $("#users").append('<b>' + data[i] + '</b> <br>' );
    }
  });

  $("#chatButton").on('click', function() {
    var message = $("#chatText").val();
    if (message != null && message.length > 0) {
      socket.emit('sendChat', gameID, message);
    }
  });
});
