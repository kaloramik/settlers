var socket;
var gameID = location.pathname.match(/\/game\/(.*)/)[1];
$(document).ready(function() {
  socket = io.connect('http://localhost:3000');
  socket.on('connect', function() {
    socket.emit('joinRoom', gameID);
    socket.emit('getExistingChats', gameID);
    socket.emit('getExistingUsers', gameID);
  });

socket.on('updatechat', function (data) {
  for (var i = 0; i < data.length; i++) {
    $('#conversation').append('<b>' + data[i] + '</b> <br>' );
  }
});

socket.on('updateUserList', function (data) {
  for (var i = 0; i < data.length; i++) {
    $('#users').append('<b>' + data[i] + '</b> <br>' );
  }
});

});
