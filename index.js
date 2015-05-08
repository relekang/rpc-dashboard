var express = require('express');
var http = require('http');

var app = express();

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', '' + __dirname);
app.use('/s', express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  res.render('index', {});
});

var server = http.Server(app);
var port = process.env.PORT || 3000;

server.listen(port, function() {
  console.log('listening on *:' + port);
});
