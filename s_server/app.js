
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.use(express.bodyParser());
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  //app.set('view cache', true);
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'))
});

app.get("/", function (request, response) {
  response.render("home.jade", { title: "this is a title"});
});

app.get("/game", function (request, response) {
  response.render("home.jade", { title: "you tried to create a game"});
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
