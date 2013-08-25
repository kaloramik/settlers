var socket;
var gameID = location.pathname.match(/\/game\/(.*)/)[1];
$(document).ready(function() {
  socket = io.connect('http://localhost:3000');
  socket.on('connect', function() {
    socket.emit('joiningRoom', gameID);
  });

  socket.on('updateChat', function (message) {
      $("#chat-list").append('<li>' + message + '</li>' );
  });

  socket.on('updateUserList', function (data) {
    $("#user-list").empty();
    for (var i = 0; i < data.length; i++) {
      $("#user-list").append('<li>' + data[i] + '</li>' );
    }
  });

  $("#chat-button").on('click', function() {
    var message = $("#chat-text").val();
    if (message != null && message.length > 0) {
      socket.emit('sendChat', gameID, message);
    }
  });
});
