//list of all the socket interactions (client side) on the game page

var socket;
var gameName = location.pathname.match(/\/game\/(.*)/)[1];
var gameID;

$(document).ready(function() {
  gameID = $("#game-id").text();
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


  $('#event-log').bind('mousewheel DOMMouseScroll', function(e) {
    var scrollTo = null;

    if (e.type == 'mousewheel') {
      scrollTo = (e.originalEvent.wheelDelta * -1);
    }
    else if (e.type == 'DOMMouseScroll') {
      scrollTo = 40 * e.originalEvent.detail;
    }

    if (scrollTo) {
      e.preventDefault();
      $(this).scrollTop(scrollTo + $(this).scrollTop());
    }
  });
  socket.on('setupGame', setupGame);
  socket.on('receiveBoardUpdate', receiveBoardUpdate);
});

function setupGame(data){
  setupBoard(data.boardID, data.resourceList, data.portList, data.rollList, data.portResourceList, data.devCardList, data.userName);
}

function transmitBoardUpdate(data){
  socket.emit('transmitBoardUpdate', gameID, data);
}

function receiveBoardUpdate(data){
  console.log('receive update from server!')
  console.log(data)
  if (data.type == "roll"){
    turn.roll(data.rolled);
  }
  else if (data.type == "turn"){
    console.log("go to next turn")
    turn.nextTurn(true);
  }
  else if (data.type == "devCard"){
    board.devCardList.pop();
  }
  else if (data.type == "vertex"){
    var vertexKey = 'h' + data.id[0] + '_' + data.id[1] + 'v' + data.id[2];
    board.vertexDict[vertexKey].update(data);
  }
  else if (data.type == "edge"){
    var edgeKey = 'h' + data.id[0] + '_' + data.id[1] + 'e' + data.id[2];
    board.edgeDict[edgeKey].update(data);
  }
  else if (data.type == "start"){
    turn.initializePlayers(data);
  }
}

function readyToStart(){
  socket.emit('readyToStart', gameID);
}
