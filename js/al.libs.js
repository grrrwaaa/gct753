/*
npm install -g browserify
npm install -g minify
npm install ndarray zeros
// etc.

browserify js/al.libs.js -o al.js && minify al.js al.min.js
*/

ndarray = require("ndarray");
//ndarray.normalize = require("ndarray-normalize");
//ndarray.distance = require("distance-transform");	// create a distance field from an array
zeros = require("zeros");
//codemirror = require("codemirror");

var seedrandom = require("seedrandom");

var rng = new Math.seedrandom();

// return integer in 0..(n-1)
random = function (n) {
	if (n) {
		return Math.floor(rng()*n);
	} else {
		return rng();
	}
}

// a modulo operation that handles negative n more appropriately
// e.g. wrap(-1, 3) returns 2
// see http://en.wikipedia.org/wiki/Modulo_operation
// see also http://jsperf.com/modulo-for-negative-numbers 
wrap = function (n, m) {
	return ((n%m)+m)%m;
}

////////////////////////////////////////////////////////////////////////////////

// the exported module:
al = {};

var al_rendering = false;
var al_now = Date.now();
var al_dt = 1/60.;


al.once = function() {
	if (update && typeof update === "function") update(al_dt);
	if (draw && typeof draw === "function") draw();
}

var al_render = function() {
	var now = Date.now();
	al_dt = now - al_now;
	al_now = now;
	// wrap in a try/catch?
	if (al_rendering) {
		al.once();
		requestAnimationFrame(al_render);
	}
}

al.start = function() {
	al_now = Date.now();
	al_rendering = true;
	al_render();
}

al.stop = function() {
	al_rendering = false;
}

var canvas, ctx;
var offscreen_canvas, offscreen_ctx, offscreen_image, offscreen_data;

al.init = function () {
	canvas = document.createElement("canvas");
	canvas.setAttribute("width", 512);
	canvas.setAttribute("height", 256);
	document.body.appendChild(canvas);
	
	ctx = canvas.getContext('2d');
	
	// create an off-screen rendering context (should this be per-field?)
	offscreen_canvas = document.createElement('canvas');
	offscreen_canvas.width = canvas.width;
	offscreen_canvas.height = canvas.height;
	offscreen_ctx = offscreen_canvas.getContext("2d");
	offscreen_image = offscreen_ctx.getImageData(0, 0, offscreen_canvas.width, offscreen_canvas.height);
	offscreen_data = offscreen_image.data;
	
	// add a bit of UI:
	
	var b = document.createElement('button');
	b.innerHTML = 'start';
	b.onclick = function(){ al.start(); return false; };
	document.body.appendChild(b);
	
	var b = document.createElement('button');
	b.innerHTML = 'stop';
	b.onclick = function(){ al.stop(); return false; };
	document.body.appendChild(b);
	
	var b = document.createElement('button');
	b.innerHTML = 'once';
	b.onclick = function(){ al.once(); return false; };
	document.body.appendChild(b);
	
	var b = document.createElement('button');
	b.innerHTML = 'reset';
	b.onclick = function(){ reset(); draw(); return false; };
	document.body.appendChild(b);
}

field2D = function (width, height) {
	this.dim = [ width, height ];
	this.width = width;
	this.height = height;
	this.data = zeros(this.dim);
}

field2D.prototype.draw = function() {
	var x, y, i = 0;
	var w = offscreen_canvas.width, h = offscreen_canvas.height;
	var W = this.data.shape[0], H = this.data.shape[1];
	var dx = W/w, dy = H/h;
	
	for (y = 0; y < h; y++) {
		var y1 = Math.floor(y * dy);
		for (x = 0; x < w; x++, i += 4) {
			var x1 = Math.floor(x * dx);
			var r = this.data.get(x1, y1) * 255;
			offscreen_data[i  ] = r;
			offscreen_data[i+1] = r;
			offscreen_data[i+2] = r;
			offscreen_data[i+3] = 255;
		}
	}
	offscreen_ctx.putImageData(offscreen_image, 0, 0);
		
	ctx.drawImage(offscreen_canvas,
		0,0,offscreen_canvas.width,offscreen_canvas.height,
		0,0,canvas.width,canvas.height
	);
}

field2D.prototype.set = function(value, x, y) {
	if (x != null && y != null) {
		x = wrap(x, this.width);
		y = wrap(y, this.height);
		if (typeof value === "function") {
			var v = value(x, y);
			if (v != null) this.data.set(i,j,v);
		} else {
			this.data.set(x,y,value);
		}
	} else {
		var data = this.data;
		var w = this.width;
		var h = this.height;
		if (typeof value === "function") {
			for(var y=0; y<h; ++y) {
				for(var x=0; x<w; ++x) {
					var v = value(x, y);
					if (v != null) data.set(x, y, v);
				}
			}
		} else {
			for(var y=0; y<h; ++y) {
				for(var x=0; x<w; ++x) {
					data.set(x, y, value);
				}
			}
		}
	}
}

field2D.prototype.get = function(x, y) {
	x = wrap(x, this.width);
	y = wrap(y, this.height);
	return this.data.get(x, y);
}
