angular.module('omnigrahm', ['ngAutocomplete'])
  .controller('AppController', function ($scope, $timeout, $http) {
    $scope.activeClasss = 'not-active';
    $scope.modalBoolean = false;
    $scope.init = function () {
      $timeout(function () {
        $scope.activeClasss = 'active';
      }, 500);
      return $http.get('/api/instagram')                              // HERE!
        .then(function (res) {
          $timeout(function () {
            var cities = res.data.map(function (city) {
              city.positive = city.percent_positive * 100;
              city.negative = city.percent_negative * 100;
              return city;
            });
            window.setHappiness(cities);
          }, 200);
        });
    };

    $scope.modal = function() {
      $scope.modalBoolean = !$scope.modalBoolean;
    }
  })
  .controller('FormController', function ($scope, $http) {
    $scope.fieldText = '';
    $scope.currentCity = null;
    $scope.cities = {
      country: 'us',
      types: '(cities)'
    };

    $scope.$watch(function () {
      return $scope.currentCity;
    }, function () {
      if ($scope.currentCity !== null) {
        var city = $scope.currentCity;
        if (city.place_id === undefined) return false;
        $http.get('/api/instagram/' + city.place_id)                  // AND HERE!
          .then(function (res) {
            var _city  = {
              name: city.name, 
              lat: city.geometry.location.lat(),
              lng: city.geometry.location.lng(),
              place_id: city.place_id,
              positive: res.data[0].percent_positive * 100,
              negative: res.data[0].percent_negative * 100
            }
            addSingleCity(_city);
          })
          .catch(function (err) {
            var _city  = {
              name: city.name, 
              lat: city.geometry.location.lat(),
              lng: city.geometry.location.lng(),
              place_id: city.place_id,
            }
            $http.post('/api/instagram/', _city)                  // AND HERE!
              .then(function (res) {
                console.log('POST City Request');
                _city.positive = res.data[0].percent_positive * 100;
                _city.positive = res.data[0].percent_negative * 100;
                addSingleCity(_city);
              })
          });
      }
    });

    $scope.submitForm = function () {
      if ($scope.currentCity !== null) {
        setTimeout(function () {
          // console.log('Adding ', $scope.currentCity.name);
        }, 100);
      }
    };
  });