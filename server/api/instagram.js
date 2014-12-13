/*jshint node:true */
var express = require('express');
var utils = require('./utils');
var mongoose = require('mongoose');
var Promise = require('bluebird');

var Cities = Promise.promisifyAll(mongoose.model("Cities"));
var InstagramRouter = express.Router();

//caution: this line clears out the entire DB!
//Cities.remove({},function(){});


//print out size and city list for current DB
Cities.count({}).exec()
  .then(function (count) {
    console.log("Entries in DB: ", count);
  });

Cities.find({}).exec()
  .then(function (cities) {
    cities.forEach(function (city) {
      console.log(city.name, ": ", city.total_searched, " messages in db.");
    });
  });


//this route is for returning the top 30 cities
//TODO: refactor so it returns top 30, not just ALL cities in db.
InstagramRouter.get('/', function (req, res) {
  console.log("request received at api/instagram/");

  Cities.findAsync({})
    .then(function (cities) {
      if (!cities) throw new Error('City Not Found');
      return res.json(cities);
    }).catch(function (err) {
      console.log("Error: " + err);
      res.status(404).end();
    });
});



InstagramRouter.get('/:id', function (req, res) {
  console.log("get request received at api/instagram/:id");
  Cities.findAsync({
      placeId: req.params.id
    })
    .then(function (city) {
      if (!city || (Array.isArray(city) && city.length === 0)) {
        throw new Error('City Not Found');
      }
      return res.json(city);
    })
    .catch(function (err) {
      console.log("Error: " + err);
      res.status(404).end();
    });
});



InstagramRouter.post('/:id', function (req, res) {
  console.log("post request received at api/instagram/:id");
  var city = {
    placeId: req.body.placeId || req.param('placeId'),
    lng: req.body.lng || req.param('lng'),
    lat: req.body.lat || req.param('lat'),
    name: req.body.city || req.param('name')
  };
  utils.getInstagrams(city, 100, res);
});

module.exports = InstagramRouter;