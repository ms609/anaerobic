"use strict";

const secsInMin = 60;

function in_seconds(mins, secs) {
  return mins * secsInMin + +secs;
}

function sToMin (s) {
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

function sToPace(s) {
  return sToMin(s)  + " / km";
}

function vToPace(v) {
  return sToPace(1000 / v);
}

function dPrimeText(dPrime) {
  return dPrime.toPrecision(4) + " m";
}

function vText(speed) {
  return speed.toPrecision(4) + " m/s" + " = " + vToPace(speed);
}
 
if (localStorage.getItem("nData") === null) {
	localStorage.setItem("dist", [5000, 1609, 10000]);	
	localStorage.setItem("time", [1111, 298.5, 2300]);	
	localStorage.setItem("nData", 3);
}

let dists = localStorage.getItem("dist").split(",");
let times = localStorage.getItem("time").split(",");

function addDatum(d = 0, t = 0) {
	let container = document.getElementById("inputs");
	let div = document.createElement("div");
	div.classList.add("input");
	let span_dist = document.createElement("span");
	span_dist.classList.add("distance");
	let input_dist = document.createElement("input");
	input_dist.setAttribute("type", "number");
	input_dist.setAttribute("value", d);  
	input_dist.setAttribute("onchange", "update()");
	input_dist.classList.add("distance");
    span_dist.appendChild(input_dist);
    div.appendChild(span_dist);

	let span_min= document.createElement("span");
	span_min.classList.add("mins");
	span_min.innerHTML = " in ";
    let input_min = document.createElement("input");
    input_min.setAttribute("type", "number");
    input_min.setAttribute("min", "0");
    input_min.setAttribute("onchange", "update()");
    input_min.setAttribute("value", Math.floor(t / 60));
    input_min.classList.add("mins");
    span_min.appendChild(input_min);
    div.appendChild(span_min);
    
	let span_sec = document.createElement("span");
	span_sec.classList.add("secs");
    let input_sec = document.createElement("input");
    input_sec.setAttribute("type", "number");
    input_sec.setAttribute("min", "0");
    input_sec.setAttribute("step", "0.1");
    input_sec.setAttribute("onchange", "update()");
    let pad_secs = Math.round(100 * (t % 60)) / 100;
    if (pad_secs < 10) {
		pad_secs = "0" + pad_secs;
	}
    input_sec.setAttribute("value", pad_secs);
    input_sec.classList.add("secs");
    span_sec.appendChild(input_sec);
    div.appendChild(span_sec);
    
    container.appendChild(div);
}

for (let i = 0; i != localStorage.getItem("nData"); ++i) {
	console.log(dists)
	addDatum(dists[i], times[i]);
}
addDatum(0, 0);

