var app = require('express').createServer()
var io = require('socket.io').listen(app);

app.listen(8080);

// routing
app.get('/', function (req, res) {
        res.sendfile(__dirname + '/index.html');
        });

// usernames which are currently connected to the chat
var usernames = {};

function User(username) {
    this.username = username;
    this.wood = 1;
    this.ore = 1;
    this.wheat = 1;
    this.sheep = 1;
    this.brick = 1;

}

io.sockets.on('connection', function (socket) {

        // when the client emits 'sendchat', this listens and executes
        socket.on('sendchat', function (data) {
            // we tell the client to execute 'updatechat' with 2 parameters
            io.sockets.emit('updatechat', socket.username, data);
            });

        socket.on('post_trade', function(username, give_items, want_items) {
            io.sockets.emit('post_trade_to_window', username, give_items, want_items);

        });
        // when the client emits 'adduser', this listens and executes
        socket.on('adduser', function(username){
            // create object for user 
            user = new User(username); 
            // we store the username in the socket session for this client
            socket.username = username;
            // add the client's user object to the global list
            usernames[username] = user;
            // echo to client they've connected
            socket.emit('updatechat', 'SERVER', 'you have connected');
            // echo globally (all clients) that a person has connected
            socket.broadcast.emit('updatechat', 'SERVER', username + ' has connected');
            // update the list of users in chat, client-side
            io.sockets.emit('updateusers', usernames);
            });

        socket.on('get_stats', function(username){
            user = usernames[username];
            console.log('got here');
            socket.emit('updatechat_with_stats', user);
        });
        // when the user disconnects.. perform this
        socket.on('disconnect', function(){
                // remove the username from global usernames list
                delete usernames[socket.username];
                // update list of users in chat, client-side
                io.sockets.emit('updateusers', usernames);
                // echo globally that this client has left
                socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
                });
});
