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

console.log("server listening on port " + config.port, " / Environment: ", process.env.NODE_ENV);

var cronFetchTop30 = crontab.scheduleJob("1 */2 * * *", function () {
  utils.getTop30();
});

var cronDropDBAtMidnight = crontab.scheduleJob("0 0 * * *", function () {
  utils.clearDB();
});

module.exports = app;