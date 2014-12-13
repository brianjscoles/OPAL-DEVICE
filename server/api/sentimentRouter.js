/*jshint node:true */
'use strict';

var express = require('express');
var sentimentRouter = express.Router();
var analyzeSentiment = require('sentiment');

sentimentRouter.get('/', function (req, res) {
  var messages = JSON.parse(req.query.messages);
  var sentiments = messages.map(function (message) {
    return {
      message: message,
      score: analyzeSentiment(message).score
    };
  });
  res.json(sentiments);
});

module.exports = sentimentRouter;