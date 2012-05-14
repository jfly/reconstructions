// Module Dependencies

var conf = require('./conf');
var express = require('express');
var fs = require('fs');
// npm install riak-js@latest
var mongodb = require('mongodb');
var Server = mongodb.Server;
var db = new mongodb.Db('reconstructions', new Server("127.0.0.1", 27017, {}));
// git clone git://github.com/frank06/riak-js.git  # or cloning the repo

// configure the host and port

var app = module.exports = express.createServer();

// Configuration

var youtube;

app.configure(function(){
  app.use(express.logger());
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'your secret here'}));
  //app.use(app.router);
  app.use(express.static(__dirname + '/webroot'));
  db.open(function(err){
    if(err) {
        throw err;
     } 
     db.createCollection('youtube', {}, function (err, collection){
        if(err) {
            throw err;
        }
        youtube = collection;
     });
   });
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

app.get('/getSomething', function(req, res){
    youtube.insert({a:2}, {safe: true}, function(err, docs) {
        console.log(" docs : " + JSON.stringify(docs));
        res.send('jeremy sucks' + err + JSON.stringify(docs));
    });
});

app.listen(conf.server.port);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
