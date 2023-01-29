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


 var data = [], distance = [], time = [],
     dbar = 0, tbar = 0,
     
     i = 0;
 d3.selectAll(".input").each(function(d) {
   let datum = {};
   datum.d = +d3.select(this).select("input.distance").property("value");
   let sec_value = d3.select(this).select("input.secs").property("value");
   datum.t = in_seconds(
	   d3.select(this).select("input.mins").property("value"),
	   sec_value
   );
   if (sec_value < 10 && (
	   	sec_value[0] != "0"
	    || sec_value[0] == "0" && sec_value[1] == "."
	   )
	   ) {
	   d3.select(this).select("input.secs").property("value",
	   "0" + sec_value);
   }
   datum.row = i++;
   if (typeof(datum.d) == "number" && datum.d > 0
   && typeof(datum.t) == "number" && datum.t > 0) {
     distance.push(datum.d);
     time.push(datum.t);
     datum.v = datum.d / datum.t;
     dbar += datum.d;
     tbar += datum.t;
     data.push(datum);
   } else if (datum.d == 0 && datum.t == 0) {
	 d3.select(this).remove();
   }
 });
localStorage.setItem("dist", distance);
localStorage.setItem("time", time);
AddDatum()

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

 var m = term1 / term2;
 var c = dbar - (m * tbar);
 var dPrimeText = c.toPrecision(4) + " m";
 document.getElementById("out-dprime").innerHTML = dPrimeText;
 document.getElementById("out-v").innerHTML =
   m.toPrecision(4) + " m/s" + " = " +
    v_to_pace(m);

  x.domain([0, d3.max(data, d => d.t)]);
  y.domain([0, d3.max(data, d => d.d)]);

  // Line of best fit
  plot.select("#criticalLine")
    .datum([0, 10000])
    .attr("class", "line")
    .attr(
      "d",
       d3.line()
        .x(d => x(d))
        .y(d => y((m * d) + c))
    );

  // Points
	var points = d3
	  .select("#points")
		.selectAll("circle")
	  .data(data, d => d.row)
		.join(
			enter =>
				enter.append("circle")
		      .attr("cx", d => x(d.t))
		      .attr("cy", d => y(d.d))
		      .attr("r", 3.5)
		      .attr("class", "datumPoint"),
			update =>
				update
		      .attr("cx", d => x(d.t))
		      .attr("cy", d => y(d.d))
		      .attr("r", 3.5)
		      .attr("class", "datumPoint"),
			exit => exit.remove()
		);


  // D' line
  plot.select("#dPrimeLine")
    .datum([0, 10000])
    .attr(
		"d",
		d3.line()
		  .x(d => x(d))
		  .y(d => y(c))
	);
	
  document.getElementById("dPrimeText").innerHTML = 
    "D&rsquo; = " + dPrimeText;
  plot.select("#dPrimeText")
    .attr("x", width)
    .attr("y", y(c) - (2 * height/ 100))
    ;
	
  plot.select("#xAxis")
   .attr("transform", "translate(0," + height + ")")
   .call(d3.axisBottom(x));
   
  d3.select("text#xLabel")
    .attr("text-anchor", "middle")
    .attr("x", margin.left + (width / 2))
    .attr("y", height + margin.top + margin.bottom)
    .text("Time");

  plot.select("#yAxis")
   .call(d3.axisLeft(y));
   
  d3.select("text#yLabel")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(90)")
    .attr("x", margin.left / 2)
    .attr("y", height / 2 + margin.top)
    .text("Distance");
    
  var ints = d3.select("#intervals tbody");
	ints.selectAll("tr").remove();
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
    .join(
			enter => enter.append("td").text(d => d),
			update => update.text(d => d)
		);

	var races = d3.select("#races tbody");
	races.selectAll("tr").remove();
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

  var mara = d3.select("#marathon tbody");
	mara.selectAll("tr").remove();
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
