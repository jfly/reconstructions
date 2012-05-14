var mongodb = require('mongodb');
var Db = mongodb.Db;
var Server = mongodb.Server;
var client = new Db('test', new Server("127.0.0.1", 27017, {}));
client.open(function(err, db) {
    console.log(db === client);
    if (err) {
       console.log(err);
    }else{
       db.createCollection('test', {'capped':true, 'size':1024, 'max':12}, function(err, collection) {  
          collection.insert({a:2}, function(err, docs) {
           // Locate all the entries using find
          collection.find().toArray(function(err, results) {
            client.close();
            });
          });
        });
    }
});

