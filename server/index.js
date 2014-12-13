var express = require('express');
var mongoose = require('mongoose');
var db = require('./db.js');
var config = require('./config/environment/production');
var path = require('path');
var bodyParser = require('body-parser');
var Q = require('q');
var crontab = require('node-crontab');
var instagramRouter = require("./api/instagram");
var utils = require('./api/utils');

if (config.seedDB) {
  require('./config/seed');
}

console.log('ENV: ', process.env.NODE_ENV);

var app = express();

// Middleware
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());

// Routes
app
  .use('/api/instagram', instagramRouter)
  .use(express.static(path.resolve(__dirname + '/../client/')))
  .use('*', function (req, res) {
    res.status(404).end();
  })
  .listen(config.port);

console.log("server listening on port " + config.port);


var cronFetchTop30 = crontab.scheduleJob("*/5 * * * *", function () {
  utils.getTop30();
});

var cronDropDBAtMidnight = crontab.scheduleJob("0 0 * * *", function () {
  utils.dropDB();
});

/**
 * Main application routes - formerly housed somewhere else
 *

'use strict';

var errors = require('./components/errors');

module.exports = function(app) {
  // Insert routes here, guys!
  app.use('/api/instagram', require('./server/api/instagram'));
  app.use('/api/user', require('/server/api/user'));

};


ERROR HANDLING - copy pasted from elsewhere


'use strict';

module.exports[404] = function pageNotFound(req, res) {
  var viewFilePath = '404';
  var statusCode = 404;
  var result = {
    status: statusCode
  };

  res.status(result.status);
  res.render(viewFilePath, function (err) {
    if (err) { eturn res.json(result, result.status); }

    res.render(viewFilePath);
  });
};


*/


module.exports = app;