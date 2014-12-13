var width = 1200,
  height = 635,
  centered;

var projection = d3.geo.albersUsa()
  .scale(1280)
  .translate([width / 2, height / 2]);

var path = d3.geo.path()
  .projection(projection);

window.clickZoomOut = function () {
  var x, y, k;
  x = width / 2;
  y = height / 2;
  k = 1;
  g.selectAll('.' + centered.id)
    .classed('centered', false);
  centered.centered = false;
  centered = null;
  g.classed('centered', false);
  zoomInOut(null, x, y, k);
};

var svg = d3.select(".svg-map").append("svg")
  .attr("width", width)
  .attr("height", height)
  .on('click', clickZoomOut);

svg.append("rect")
  .attr("class", "background")
  .attr("width", width)
  .attr("height", height)
  .on('click', clickZoomOut);

var g = svg.append("g")
  .attr('class', 'city-container');

d3.json("/json/us-simplified.json", function (error, us) {
  // Show National Border
  g.append("path")
    .datum(topojson.feature(us, us.objects.land))
    .attr("id", "national-border")
    .attr("d", path)
    .attr('class', 'national-border')
    .on('click', clickZoomOut);

  // Show State Borders
  g.append("g")
    .attr("id", "states")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.states).features)
    .enter().append("path")
    .attr("d", path)
    .on('click', clickZoomOut);

  g.append("path")
    .datum(topojson.mesh(us, us.objects.states, function (a, b) {
      return a !== b;
    }))
    .attr("id", "state-borders")
    .attr("d", path)
    .on('click', clickZoomOut);
});

window.setHappiness = function (data) {
  window.data = data;
  window.render(window.data);
};

window.addSingleCity = function (city) {
  city.lat = '' + city.lat;
  city.lng = '' + city.lng;
  data.push(city);
  render(data, 0);
};

window.render = function (data, timeDelay) {


  var total_radius = 30;
  var getRadius = function (type) {
    return function (d) {
      return total_radius * (d[type] * 0.01);
    };
  };
  var getPositiveRadius = getRadius('positive');
  var getNegativeRadius = getRadius('negative');
  var getDelay = function (d, i) {
    if (timeDelay !== undefined) return timeDelay;
    return i * 40;
  };
  var getY = function (d) {
    return projection([d.lng, d.lat])[1];
  };
  var getName = function (d) {
    return d.name;
  };
  var getData = function (type) {
    return function (d) {
      return Math.floor(d[type]) + '%';
    };
  };
  var getCityName = function (d) {
    return d.name;
  };
  var getCityNameY = function (d) {
    return getY(d) - total_radius - 10;
  };
  var getPositiveData = getData('positive');
  var getNegativeData = getData('negative');
  var cityCircle = g.selectAll("g.city")
    .data(data)
    .enter()
    .append("g")
    .attr('class', function (d) {
      var centered = '';
      if (d.centered === true) {
        centered = 'centered';
      }
      return 'city ' + d.id + ' ' + d.name + ' ' + centered;
    })
    .on("click", nodeClicked.bind(null, 'hello'));

  // Add class after 1 second
  setTimeout(function () {
    cityCircle.classed('transition-done', true);
  }, 1000);

  // Append City Name
  cityCircle
    .append("text")
    .text(getCityName)
    .attr("dx", function (d) {
      if(!d.lng || !d.lat ){
      }
      return (projection([d.lng, d.lat])[0]);
    })
    .attr("dy", getCityNameY)
    .attr('class', 'text city-name');

  // Append Neutral
  cityCircle
    .append("circle")
    .attr("cx", function (d) {
      return projection([d.lng, d.lat])[0];
    })
    .attr("cy", getY)
    .attr("r", 0)
    .attr('class', 'city neutral')
    .transition()
    .delay(getDelay)
    .duration(500)
    .attr("r", total_radius);

  // Append Positive Circle
  cityCircle
    .append("circle")
    .attr("cx", function (d) {
      return (projection([d.lng, d.lat])[0] - (total_radius - getPositiveRadius(d)));
    })
    .attr("cy", getY)
    .attr("r", 0)
    .attr('class', 'city positive')
    .transition()
    .delay(getDelay)
    .duration(700)
    .attr("r", getPositiveRadius);

  // Append Positive Text
  cityCircle
    .append("text")
    .text(getPositiveData)
    .attr("dx", function (d) {
      return (projection([d.lng, d.lat])[0] - (total_radius - getPositiveRadius(d)));
    })
    .attr("dy", getY)
    .attr('class', 'text positive');

  // Append Negative
  cityCircle
    .append("circle")
    .attr("cx", function (d) {
      return (projection([d.lng, d.lat])[0] + (total_radius - getNegativeRadius(d)));
    })
    .attr("cy", getY)
    .attr("r", 0)
    .attr('class', 'city negative')
    .transition()
    .delay(getDelay)
    .duration(700)
    .attr("r", getNegativeRadius);

  // Append Negative Text
  cityCircle
    .append("text")
    .text(getNegativeData)
    .attr("dx", function (d) {
      return (projection([d.lng, d.lat])[0] + (total_radius - getNegativeRadius(d)));
    })
    .attr("dy", getY)
    .attr('class', 'text negative');
};

window.centered = null;

var nodeClicked = function (str, d, b, c) {
  d3.event.preventDefault();
  d3.event.stopPropagation();
  var x, y, k;
  x = projection([d.lng, d.lat])[0];
  y = projection([d.lng, d.lat])[1];
  k = 2;
  centered = d;
  centered.centered = true;

  var centeredEl = g.selectAll('.' + d.id)
    .classed('centered', true);
  g.classed('centered', true);
  zoomInOut(d, x, y, k);
};

var zoomInOut = function (d, x, y, k) {
  d3.event.preventDefault();
  d3.event.stopPropagation();
  g.selectAll("path")
    .classed("active", centered && function (d) {
      return d === centered;
    });
  // We use `translate3d` for hardware acceleration
  var transform = "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")";
  g.transition()
    .duration(800)
    .attr("transform", transform);
};