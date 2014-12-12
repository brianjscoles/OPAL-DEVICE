/*jshint node:true */
var cities = require('../cities.json');
var instagram = require('./instagram');
var sentiment = require('./sentiment');
var Promise = require('bluebird');
var mongoose = Promise.promisifyAll(require('mongoose'));
var request = Promise.promisify(require('request'));
var Cities = (mongoose.model("Cities"));
var _ = require('lodash');

var utils = {

  // sendResponse : function(response, obj, status){
  //   status = status || 200;
  //   response.writeHead(status, headers);
  //   response.end(obj);
  // },

  // collectData : function(request, callback){
  //   var data = "";
  //   request.on("data", function(chunk){
  //     data += chunk;
  //   });
  //   request.on("end", function(){
  //     callback(data);
  //   });
  // },

  // send404 : function(response){
  //   utils.sendResponse(response, '404: Page not found', 404);
  // },

  // sendRedirect : function(response, location, status){
  //   status = status || 302;
  //   response.writeHead(status, {Location: location});
  //   response.end();
  // },

  getTop30: function () {
    console.log("getting top 30!");
    var i = 0;

    var getNextCity = function () {
      var city = cities.cities[i++];
      utils.getInstagrams(city, 100);
      if (i < cities.cities.length) {
        setTimeout(getNextCity, 200);
      }
    };

    getNextCity();

  },

  addInstagramDataToDb: function (city, messages, originalRes) {
    var query = Cities.where({
      placeId: city.placeId
    });
    var updating = false;
    query.findOneAsync()
      .then(function (cityRecord) {
        if (cityRecord) {
          updating = true;
        } else {
          cityRecord = new Cities({
            name: city.name,
            lat: city.lat,
            lng: city.lng,
            placeId: city.placeId,
            total_positives: 0,
            total_negatives: 0,
            total_neutrals: 0,
            percent_positive: 0,
            percent_negative: 0,
            total_searched: 0,
            photo_urls: {}
          });
        }
        return cityRecord;
      })
      .then(function (cityRecord) {
        //iterate through messages to further populate city record
        _.each(messages, function (message, key) {
          var instagramId = message.url.split('/')[4];
          if (key !== "size" && !cityRecord.photo_urls[instagramId]) {
            cityRecord.photo_urls[instagramId] = true;
            cityRecord.total_searched++;
            if (message.sentiment > 0) cityRecord.total_positives++;
            else if (message.sentiment < 0) cityRecord.total_negatives++;
            else cityRecord.total_neutrals++;
          }
          return cityRecord;
        });
        cityRecord.percent_positive = cityRecord.total_positives / cityRecord.total_searched;
        cityRecord.percent_negative = cityRecord.total_negatives / cityRecord.total_searched;


        console.log("saving record to DB: " + cityRecord.name + " with " + cityRecord.total_searched + " messages.");
        if (updating) {
          if (originalRes) originalRes.status(201).json(cityRecord);
          return cityRecord.saveAsync();
        } else {
          var cityDB = new Cities(cityRecord);
          if (originalRes) originalRes.status(201).json(cityDB);
          return cityDB.saveAsync();
        }
      })
      .catch(function (err) {
        console.log('ERROR: ');
        console.log(err);
      });
  },

  getInstagrams: function (city, number, originalRes) {
    console.log("getting mass instagrams");
    var storage = [];
    var clientId = '0818d423f4be4da084f5e4b446457044';
    var apiUrl = 'https://api.instagram.com/v1/media/search?lat=' + city.lat;
    apiUrl += '&lng=' + city.lng + '&client_id=' + clientId + '&count=300';
    request(apiUrl)
      .then(function (res, body) {
        if (res.statusCode == 400) {
          throw new Error('400 error on request');
        }
        var json = JSON.parse(res[0].body);
        if (json.data === undefined) throw new Error('error with API call');
        var messages = json.data;
        var parsedMessages = messages.forEach(function (message) {
          var text = message.caption ? message.caption.text : "";
          var newMessage = {
            text: text,
            url: message.link,
            sentiment: sentiment(text)
          };
          storage.push(newMessage);
        });
        utils.addInstagramDataToDb(city, storage, originalRes);
      })
      .catch(function (err) {
        console.log("Error: " + err);
      });
  }
};

module.exports = utils;