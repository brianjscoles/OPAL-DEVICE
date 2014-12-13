var should = require('should');
var expect = require('chai').expect;
var request = require('super-request');
var app = require('../index');


describe('Server Processes', function () {

  describe('Instagram', function () {
    it('should get all instagram Top 30', function (done) {
      request(app)
        .get('/api/instagram')
        .expect(200)
        .end(function (err, res, body) {
          var json = JSON.parse(body);
          json.should.have.property('cities');
          json.cities.should.be.instanceof(Array);
          json.cities.length.should.equal(30);
          done();
        });
    });

    it('should get data for a specific city', function (done) {
      var data = {
        "lon": -94.591584099999977,
        "name": "Devers,TX,USA",
        "lat": 30.0274371,
        "id": "ChIJf3IkFlwyP4YREwKBdv391Bs"
      };
      request(app)
        .get('/api/instagram/' + data.id)
        .expect(200)
        .end(function (err, res, body) {
          var json = JSON.parse(body);
          json.should.be.instanceof(Object);
          json.should.have.property('id');
          json.should.have.property('lat');
          json.should.have.property('lng');
          done();
        });
    });
  });

});