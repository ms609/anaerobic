"use strict";
function update() {
	var
	  svgWidth = document.getElementById("graph").width.baseVal.value,
	  svgHeight = document.getElementById("graph").height.baseVal.value,
		margin = {top: 20, right: 20, bottom: 30, left: 50},
		width = svgWidth - margin.left - margin.right,
		height = svgHeight - margin.top - margin.bottom
	;

  var
    x = d3.scaleLinear().range([0, width]),
	  y = d3.scaleLinear().range([height, 0])
  ;

	plot.attr("transform",
				"translate(" + margin.left + "," + margin.top + ")");


 var data = [], distance = [], time = [], dbar = 0, tbar = 0;
 d3.selectAll(".input").each(function(d) {
   let datum = {};
   datum.d = +d3.select(this).select(".distance").property("value");
   datum.t = +d3.select(this).select(".time").property("value");
   if (typeof(datum.d) == "number" && datum.d > 0
   && typeof(datum.t) == "number" && datum.t > 0) {
     distance.push(datum.d);
     time.push(datum.t);
     datum.v = datum.d / datum.t;
     dbar += datum.d;
     tbar += datum.t;
     data.push(datum);
   }
 });

 let n = distance.length;
 if (n < 2) {
   throw "Error: Two data points needed";
 }
 dbar /= n;
 tbar /= n;

 // Calculate coefficients
 let xy = 0, yr = 0, term1 = 0, term2 = 0;
 for (let i = 0; i != n; ++i) {
   let xr = time[i] - tbar;
   let yr = distance[i] - dbar;
   term1 += xr * yr;
   term2 += xr * xr;
 }

 function s_to_min (s) {
   let hrs = "", mins = 0;
   if (s >= 3600) {
     hrs = Math.floor(s / 3600) + ":";
     s = s % 3600;
     mins = (Math.floor(s / 60) + "").padStart(2, "0");
   } else {
     mins = Math.floor(s / 60);
   }
   return hrs + mins + ":" +
    (Math.round(s * 10 % 600) / 10).toFixed(1).padStart(4, "0");
 }
 function s_to_pace(s) {
  return s_to_min(s)  + " min / km";
 }
 function v_to_pace(v) {
  return s_to_pace(1000 / v);
 }

 var m = term1 / term2;
 var c = dbar - (m * tbar);
 document.getElementById("out-dprime").innerHTML = c.toPrecision(4) + " m";
 document.getElementById("out-v").innerHTML =
   m.toPrecision(4) + " m/s" + " = " +
    v_to_pace(m);

  x.domain([0, d3.max(data, d => d.t)]);
  y.domain([0, d3.max(data, d => d.d)]);

  // Line of best fit
  plot.select("#fitLine")
    .datum([0, 400, 10000])
    .attr("class", "line")
    .attr(
      "d",
       d3.line()
        .x(d => x(d))
        .y(d => y((m * d) + c))
    );

  // Points
  plot.select("#points")
	  .selectAll("dot")
    .data(data)
		.enter()
		.append("circle")
      .attr("cx", d => x(d.t))
      .attr("cy", d => y(d.d))
      .attr("r", 3.5)
      .style("fill", "#d86713")
	;

  plot.select("#xAxis")
   .attr("transform", "translate(0," + height + ")")
   .call(d3.axisBottom(x));

  plot.select("#yAxis")
   .call(d3.axisLeft(y));

  var ints = d3.select("#intervals");
  var intRows = ints.selectAll("tr")
    .data([1000, 1200, 1500, 1600, 2000])
    .enter()
    .append("tr");

	function t_at(d, pc) {
	  return (d - (c * pc / 100)) / m;
	}

	function v_at(d, pc) {
	  return (c * pc / 100) / t_at(d, pc) + m;
	}

  var intCells = intRows.selectAll("td")
    .data(function(d, i) {

      return [
        d + " m",
        v_to_pace(v_at(d, 100)),
        v_to_pace(v_at(d, 80)),
        s_to_min(t_at(d, 80)),
        s_to_min(t_at(d, 80) * 1.5),
        v_to_pace(v_at(d, 60)),
        s_to_min(t_at(d, 60)),
        s_to_min(t_at(d, 60)),
        v_to_pace(v_at(d, 40)),
        s_to_min(t_at(d, 40)),
        s_to_min(t_at(d, 40) * 0.5)
        ];
    })
    .enter()
    .append("td").text(d => d)

  var raceRows = races.selectAll("tr")
    .data([1500, 1609, 3000, 5000, 5 * 1609.34, 10000, 16093.4, 21090])
    .enter()
    .append("tr");

  var raceCells = raceRows.selectAll("td")
    .data(function(d, i) {
      let t = (d - c) / m;
      return [
        d + " m",
        s_to_pace(t * 1000 / d),
        s_to_min(t)
        ];
    })
    .enter()
    .append("td").text(d => d)

  var mara = d3.select("#marathon");
  var maraRows = mara.selectAll("tr")
    .data([96, 90, 85])
    .enter()
    .append("tr");

  var maraCells = maraRows.selectAll("td")
    .data(function(d, i) {
      let v = m * d / 100;
      return [
        d + " %",
        v_to_pace(v),
        s_to_min(42195 / v)
        ];
    })
    .enter()
    .append("td").text(d => d)
}
