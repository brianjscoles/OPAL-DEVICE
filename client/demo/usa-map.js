var width = 1200,
  height = 635,
  centered;

var projection = d3.geo.albersUsa()
  .scale(1200)
  .translate([width / 2, height / 2]);

var path = d3.geo.path()
  .projection(projection);

var svg = d3.select(".svg-map").append("svg")
  .attr("width", width)
  .attr("height", height);

svg.append("rect")
  .attr("class", "background")
  .attr("width", width)
  .attr("height", height)
  .on("click", clicked);

var g = svg.append("g");

d3.json("/demo/us.json", function (error, us) {

  g.append("g")
    .attr("id", "states")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.states).features)
    .enter().append("path")
    .attr("d", path)
    .on("click", clicked);

  g.append("path")
    .datum(topojson.mesh(us, us.objects.states, function (a, b) {
      return a !== b;
    }))
    .attr("id", "state-borders")
    .attr("d", path);

  d3.json("/demo/cities.csv", function (error, data) {
    data = data.map(function (d) {
      d.happines = Math.random() * 100;
      return d;
    });
    window.addSingleCity = function (name, lat, lon) {
      data.push({
        name: name,
        lat: '' + lat,
        lon: '' + lon,
        happines: Math.random() * 100
      });
      render(data, 0);
    };
    window.data = data;
  });
});

window.render = function (data, timeDelay) {

  var total_radius = 30;
  var cityCircle = g.selectAll("g.city")
    .data(data)
    .enter()
    .append("g")
    .attr('class', function (d) {
      return 'city ' + d.name;
    });

  // Append First Circle
  cityCircle
    .append("circle")
    .attr("cx", function (d) {
      return projection([d.lon, d.lat])[0] - 10;
    })
    .attr("cy", function (d) {
      return projection([d.lon, d.lat])[1];
    })
    .attr("r", 0)
    .attr('class', function (d) {
      return 'city positive ' + d.name;
    })
    .transition()
    .delay(function (d, i) {
      if (timeDelay !== undefined) return timeDelay;
      return i * 100;
    })
    .duration(1000)
    .attr("r", function (d) {
      return total_radius * (d.happines * 0.01);
    });

  // Append Second Circle
  cityCircle
    .append("circle")
    .attr("cx", function (d) {
      return projection([d.lon, d.lat])[0] + 10;
    })
    .attr("cy", function (d) {
      return projection([d.lon, d.lat])[1];
    })
    .attr("r", 0)
    .attr('class', function (d) {
      return 'city negative ' + d.name;
    })
    .transition()
    .delay(function (d, i) {
      if (timeDelay !== undefined) return timeDelay;
      return i * 100;
    })
    .duration(1000)
    .attr("r", function (d) {
      return total_radius - (total_radius * (d.happines * 0.01));
    });
};

var clicked = function (d) {
  console.log('Clicked');
  var x, y, k;

  if (d && centered !== d) {
    var centroid = path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    k = 4;
    centered = d;
  } else {
    x = width / 2;
    y = height / 2;
    k = 1;
    centered = null;
  }

  g.selectAll("path")
    .classed("active", centered && function (d) {
      return d === centered;
    });

  g.transition()
    .duration(750)
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
    .style("stroke-width", 1.5 / k + "px");
};