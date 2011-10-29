
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  // see: http://stackoverflow.com/questions/5599083/how-to-use-sessions-in-express-couchdb-and-node-js
  var MemoryStore = require('connect').session.MemoryStore;
  app.use(express.cookieParser());
  app.use(express.session({ secret: "keyboard cat", store: new MemoryStore({ reapInterval:  60000 * 10 })}));

  // default conifgure
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes
console.dir(routes);

app.get('/', routes.index);
app.get('/login', routes.login);
app.get('/authenticate', routes.authenticate);
app.get('/verify', routes.verify);

app.listen(1234);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
