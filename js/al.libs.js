/*
npm install -g browserify
npm install -g minify
npm install ndarray zeros
// etc.

browserify js/gibberish_2.0.min.js js/al.libs.js  -o al.js && minify al.js al.min.js
browserify js/al.libs.js  -o al.js && minify al.js al.min.js
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

var floor = Math.floor;
var ceil = Math.ceil;
var min = Math.min;
var max = Math.max;

var piover2 = Math.PI/2.;

////////////////////////////////////////////////////////////////////////////////

// the exported module:
al = {};

al.fps = 30;

var al_updating = false;
var al_update_in_audio = false;
var al_now = Date.now();
var al_dt = 1/al.fps;

var hz2table = 1024 / 44100;

al.audio = {
	bufferSize: 4096,
	sampleRate: 44100,
	sampleRateInverse: 1/44100,
	outchannels: 2,
	context: null,
	node: null,
	
	tableSize: 1024,
	
	samples2radians: Math.PI * 2 / 44100,
	latency: 0.1,
	
	t: 0,
	dt: 1/10,
	nextUpdate: 0,
}

var tableSine = new Float32Array(al.audio.tableSize + 1);
for (var i = 0; i <= al.audio.tableSize; i++) { tableSine[i] = Math.sin((Math.PI * 2.0 * i)/al.audio.tableSize); }

var ugens = [];

al.audio.SinOsc = function() {
	al.audio_init();
	
	this.amp = 0.1;
	this.freq = 440.0;
	this.pan = 0.5;
	this.parameter_smooth = 0.005;
	
	this.phase = 0;
	this.table = tableSine;
	this.freqsmooth = this.freq;
	this.ampsmooth = this.amp;
	this.pansmooth = this.pan;
	this.last = 0;
	
	// start playing immediately
	ugens.push(this);
}

al.audio.SinOsc.prototype.connect = function() {
	ugens.push(this);
	return this;
}

al.audio.SinOsc.prototype.next = function() {
	var phase = this.phase;
	var table = this.table;
	
	this.freqsmooth += this.parameter_smooth * (this.freq - this.freqsmooth);
	this.pansmooth += this.parameter_smooth * (this.pan - this.pansmooth);
	this.ampsmooth += this.parameter_smooth * (this.amp - this.ampsmooth);
	
	var amp = this.ampsmooth;
	var pincr = this.freqsmooth * hz2table;
	
	phase += pincr;
	if (phase >= 1024.0) phase = (phase - 1024.0); 
	this.phase = phase;
	
	var index = floor(phase);
	var frac = phase - index;
	 
	// linear interp:
	var index2, index1 = (~~index);
	if((index1 | 0) == (1024 | 0)) {
		index2 = 0
	} else { 
		index2 = (index1 + 1) | 0;
	}
	var val1 = table[ index1 ];
	var val2 = table[ index2 ];
	return this.ampsmooth * (val1 + (frac * (val2 - val1)));
}

al.audio.audioProcess = function(event) {
	
	var outDataL = event.outputBuffer.getChannelData(0),
		outDataR = event.outputBuffer.getChannelData(1);
	var bufferSize = event.outputBuffer.length;
	
	var sampleRateInverse = al.audio.sampleRateInverse;
	
	//var samples2radians = al.audio.samples2radians;
	var hz2table = hz2table;
	
	var tableSize = al.audio.tableSize;
	var tableSizeHalf = tableSize/2;
	
	var t = al.audio.t;
	
	// Loop through the samples
	for (var i = 0; i < bufferSize; i++) {
	
		// update scene:
		if (t >= al.audio.nextUpdate) {
			if (update && typeof update === "function") update(al.audio.dt);
			al.audio.nextUpdate += 1/al.fps;
		}
		
		// loop over ugens:
		var l = 0, r = 0;
		for (var u = 0, ul = ugens.length; u < ul; u++) {
			var ugen = ugens[u];
			var v = ugen.next();
			var p = floor(ugen.pansmooth * tableSizeHalf);
			
			// pan: 
			// TODO: equal power pan!
			r += tableSine[p] * v;
			l += tableSine[p + tableSizeHalf] * v;
		}
		
		// Set the data in the output buffer for each sample
		outDataL[i] = l;
		outDataR[i] = r;
		
		t += sampleRateInverse;
	}
	
	if (al_updating) {
		al.audio.t += bufferSize * sampleRateInverse;
	}
}

var audioContext;
if( typeof webkitAudioContext !== 'undefined' ) {
	audioContext = webkitAudioContext
} else if ( typeof AudioContext !== 'undefined' ) {
	audioContext = AudioContext
}



// returns false if audio is not supported.
// audio might not start immediately however; check al.audio.context != null
al.audio_init = function() {
	if (al_update_in_audio) { return true; }
	
	// this would need to be deferred for iOS devices, since audio can only be started in response to a user event
	al.audio_start = function() {
		if( typeof audioContext !== 'undefined' ) {
			document.getElementsByTagName('body')[0].removeEventListener('touchstart', al.audio_start);
			al.audio.context = new audioContext();
			al.audio.sampleRate = al.audio.context.sampleRate;
			al.audio.node = al.audio.context.createScriptProcessor(al.audio.bufferSize, 0, al.audio.outchannels, al.audio.context.sampleRate);	
			al.audio.node.onaudioprocess = al.audio.audioProcess;
			al.audio.node.connect(al.audio.context.destination);
			
			al.audio.sampleRateInverse = 1 / al.audio.context.sampleRate;
			al.audio.samples2radians = Math.PI * 2 / al.audio.context.sampleRate;
			hz2table = al.audio.tableSize / al.audio.context.sampleRate;

			if('ontouchstart' in document.documentElement) { // required to start audio under iOS 6
				var mySource = al.audio.context.createBufferSource();
				mySource.connect(al.audio.context.destination);
				mySource.noteOn(0);
			}
			return true;
			
		} else if ( navigator.userAgent.indexOf( 'Firefox' ) === -1 ) {
			al.audio.AudioDataDestination(44100, Gibberish.audioProcessFirefox);
			al.audio.context = { sampleRate: 44100 }; // needed hack to determine samplerate in ugens
			return true;
			
		} else {
			alert('Your browser does not support javascript audio synthesis. Please try downloading a recent Chrome, FireFox or Safari (for example).');
			return false;
		}
	}
	
	if('ontouchstart' in document.documentElement) {
		console.log("touchstart");
		document.getElementsByTagName('body')[0].addEventListener('touchstart', al.audio_start);
		al_update_in_audio = true;
	} else {
		al_update_in_audio = al.audio_start();
	}
	console.log("starting audio", al_update_in_audio);
	return al_update_in_audio;
}

al.once = function() {
	if (update && typeof update === "function") {
		update(al_dt);
	}
	if (draw && typeof draw === "function") {
		ctx.clearRect(0,0, canvas.width, canvas.height);
		ctx.save();
		ctx.scale(canvas.width, canvas.height);
		draw(ctx);
		ctx.restore();
	}
}

var al_render = function() {
	var now = Date.now();
	al_dt = (now - al_now) * 0.001;
	al_now = now;
	// wrap in a try/catch?
	if (al_updating) {
		if ((!al_update_in_audio) && update && typeof update === "function") {
			update(al_dt);
		}
		if (draw && typeof draw === "function") {
			ctx.clearRect(0,0, canvas.width, canvas.height);
			ctx.save();
			ctx.scale(canvas.width, canvas.height);
			draw(ctx);
			ctx.restore();
		}
		requestAnimationFrame(al_render);
	}
}

al.start = function() {
	al_now = Date.now();
	al_updating = true;
	al_render();
}

al.stop = function() {
	al_updating = false;
}

al.init = function (options) {
	canvas = document.createElement("canvas");
	canvas.setAttribute("width", 512);
	canvas.setAttribute("height", 512);
	document.body.appendChild(canvas);
	
	
	ctx = canvas.getContext('2d');
	
	// create an off-screen rendering context (should this be per-field?)
	offscreen_canvas = document.createElement('canvas');
	offscreen_canvas.width = canvas.width;
	offscreen_canvas.height = canvas.height;
	offscreen_ctx = offscreen_canvas.getContext("2d");
	offscreen_image = offscreen_ctx.getImageData(0, 0, offscreen_canvas.width, offscreen_canvas.height);
	offscreen_data = offscreen_image.data;
	
	var mousepos = function(event) {
		
		var canvas_rect = canvas.getBoundingClientRect();
		return {
			x: (event.clientX - canvas_rect.left) / canvas_rect.width, 
			y: (event.clientY - canvas_rect.top) / canvas_rect.height 
		};
	}
	
	// add a bit of UI:
	var mouse_is_down = false;
	canvas.addEventListener("mousedown", function(event) {
		mouse_is_down = true;
		if (mouse && typeof mouse === "function") {
			var canvas_rect = canvas.getBoundingClientRect();
			mouse("down", event.button, (event.clientX - canvas_rect.left) / canvas_rect.width, (event.clientY - canvas_rect.top) / canvas_rect.height);
			return false;
		}
	}, false);
	canvas.addEventListener("mouseup", function(event) {
		mouse_is_down = false;
		if (mouse && typeof mouse === "function") {
			var canvas_rect = canvas.getBoundingClientRect();
			mouse("up", event.button, (event.clientX - canvas_rect.left) / canvas_rect.width, (event.clientY - canvas_rect.top) / canvas_rect.height);
			return false;
		}
	}, false);
	canvas.addEventListener("mouseover", function(event) {
		mouse_is_down = true;
		if (mouse && typeof mouse === "function") {
			var canvas_rect = canvas.getBoundingClientRect();
			mouse("enter", event.button, (event.clientX - canvas_rect.left) / canvas_rect.width, (event.clientY - canvas_rect.top) / canvas_rect.height);
			return false;
		}
	}, false);
	canvas.addEventListener("mouseout", function(event) {
		mouse_is_down = false;
		if (mouse && typeof mouse === "function") {
			var canvas_rect = canvas.getBoundingClientRect();
			mouse("exit", event.button, (event.clientX - canvas_rect.left) / canvas_rect.width, (event.clientY - canvas_rect.top) / canvas_rect.height);
			return false;
		}
	}, false);
	canvas.onmousemove = function(event) {
		if (mouse && typeof mouse === "function") {
			var canvas_rect = canvas.getBoundingClientRect();
			mouse(mouse_is_down ? "drag" : "move", event.button, (event.clientX - canvas_rect.left) / canvas_rect.width, (event.clientY - canvas_rect.top) / canvas_rect.height);
			return false;
		}
	}
	canvas.addEventListener('mousewheel', function(event){
		if (mouse && typeof mouse === "function") {
			var delta = 0;
			if (!event) /* For IE. */
					event = window.event;
			if (event.wheelDelta) { /* IE/Opera. */
					delta = event.wheelDelta/120;
			} else if (event.detail) { /** Mozilla case. */
					/** In Mozilla, sign of delta is different than in IE.
					 * Also, delta is multiple of 3.
					 */
					delta = -event.detail/3;
			}
			/** If delta is nonzero, handle it.
			 * Basically, delta is now positive if wheel was scrolled up,
			 * and negative, if wheel was scrolled down.
			 */
			if (delta) {
				mouse("scroll", event.button, 0, delta);
			}
			/** Prevent default actions caused by mouse wheel.
			 * That might be ugly, but we handle scrolls somehow
			 * anyway, so don't bother here..
			 */
			if (event.preventDefault)
					event.preventDefault();
			event.returnValue = false;
			return false;
		}
	}, false);
	
	window.addEventListener( "keydown", function(event) {
		if (key && typeof key == "function") {
			var k = event.keyCode;
			key("down", k);
			return true;
		}
	}, false);
	window.addEventListener( "keyup", function(event) {
		if (key && typeof key == "function") {
			var k = event.keyCode;
			key("up", k);
			return true;
		}
	}, false);
	window.addEventListener( "keypress", function(event) {
		if (key && typeof key == "function") {
			var k = event.keyCode;
			k = String.fromCharCode(k); 
			key("press", k);
			return true;
		}
	}, false);
	
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
	b.onclick = function(){ reset(); draw(ctx); return false; };
	document.body.appendChild(b);
	
	if (options) {
		if (options.audio) {
			al_update_in_audio = al.audio_init();
			console.log("enabling audio:", al_update_in_audio);
		}
	}
}

field2D = function (width, height) {
	this.dim = [ width, height ];
	this.width = width;
	this.height = height;
	this.array = zeros(this.dim);
}

field2D.prototype.draw = function() {
	var x, y, i = 0;
	var w = offscreen_canvas.width, h = offscreen_canvas.height;
	var W = this.array.shape[0], H = this.array.shape[1];
	var dx = W/w, dy = H/h;
	
	for (y = 0; y < h; y++) {
		var y1 = Math.floor(y * dy);
		for (x = 0; x < w; x++, i += 4) {
			var x1 = Math.floor(x * dx);
			var r = this.array.get(x1, y1) * 255;
			offscreen_data[i  ] = r;
			offscreen_data[i+1] = r;
			offscreen_data[i+2] = r;
			offscreen_data[i+3] = 255;
		}
	}
	offscreen_ctx.putImageData(offscreen_image, 0, 0);
	/*
	ctx.drawImage(offscreen_canvas,
		0,0,offscreen_canvas.width,offscreen_canvas.height,
		0,0,canvas.width,canvas.height
	);
	*/
	ctx.drawImage(offscreen_canvas,
		0,0,offscreen_canvas.width,offscreen_canvas.height,
		0,0,1,1
	);
	return this;
}

field2D.prototype.set = function(value, x, y) {
	if (x != null && y != null) {
		x = wrap(x, this.width);
		y = wrap(y, this.height);
		if (typeof value === "function") {
			var v = value(x, y);
			if (v != null) this.array.set(i,j,v);
		} else {
			this.array.set(x,y,value);
		}
	} else {
		var data = this.array;
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
	return this;
}

//- return the value of a cell
// If x or y is out of range of the field, it wraps around (positive modulo)
// If x or y are not integers, the fractional component is discarded (rounded down)
// @tparam ?int x coordinate (row) to get a single cell
// @tparam ?int y coordinate (column) to get a single cell
field2D.prototype.get = function(x, y) {
	x = wrap(x, this.width);
	y = wrap(y, this.height);
	return this.array.get(x, y);
}

//- return the value at a normalized index (0..1 range maps to field dimensions)
// Uses linear interpolation between nearest cells.
// Indices out of range will wrap.
// @param x coordinate (0..1) to sample
// @param y coordinate (0..1) to sample
field2D.prototype.sample = function(x, y) {
	//assert(x, "missing x coordinate for sampling")
	//assert(y, "missing y coordinate for sampling")
	var array = this.array;
	var x = wrap(((x * this.width) - 0.5), this.width);
	var y = wrap(((y * this.height) - 0.5), this.height);
	var x0 = floor(x);
	var y0 = floor(y);
	var x1 = wrap(x0 + 1, this.width);
	var y1 = wrap(y0 + 1, this.height);
	var xb = x - x0;
	var yb = y - y0;
	var xa = 1 - xb;
	var ya = 1 - yb;
	var v00 = array.get(x0, y0);
	var v10 = array.get(x1, y0);
	var v01 = array.get(x0, y1);
	var v11 = array.get(x1, y1);
	return v00 * xa * ya
		 + v10 * xb * ya
		 + v01 * xa * yb
		 + v11 * xb * yb;
}


//- Update the field at a normalized (0..1) index
// Like field2D:set(), but uses linear interpolation to distribute the update between nearest cells (thus it is an inverse of field:sample()). If the index falls exactly in the center of one cell, it is equivalent to field:set(). Otherwise, the four nearest cells will be updated as a weighted average of their current and the new value.
// If the value is a function, this function is called for each nearby cell to generate a new value. The function argument is the old value of the cell. 
// Indices out of range will wrap.
// @param value (number or function) the value to update the field
// @param x coordinate (0..1) to update
// @param y coordinate (0..1) to update
// @return this
field2D.prototype.update = function(value, x, y) {
	//assert(value, "missing value for update")
	//assert(x, "missing x coordinate for update")
	//assert(y, "missing y coordinate for update")
	var array = this.array;
	var x = wrap(((x * this.width) - 0.5), this.width);
	var y = wrap(((y * this.height) - 0.5), this.height);
	var x0 = floor(x);
	var y0 = floor(y);
	var x1 = wrap(x0 + 1, this.width);
	var y1 = wrap(y0 + 1, this.height);
	var xb = x - x0;
	var yb = y - y0;
	var xa = 1 - xb;
	var ya = 1 - yb;
	// old value
	var v00 = array.get(x0, y0);
	var v10 = array.get(x1, y0);
	var v01 = array.get(x0, y1);
	var v11 = array.get(x1, y1);
	// new value
	var o00, o10, o01, o11;
	if (typeof value == "function") {
		o00 = value(v00, x, y);
		o10 = value(v10, x, y);
		o01 = value(v01, x, y);
		o11 = value(v11, x, y);
	} else {
		o00 = value;
		o10 = value;
		o01 = value;
		o11 = value;
	}
	// interpolated application:
	array.set(x0, y0, v00 + xa*ya*(o00 - v00));
	array.set(x1, y0, v10 + xb*ya*(o10 - v10));
	array.set(x0, y1, v01 + xa*yb*(o01 - v01));
	array.set(x1, y1, v11 + xb*yb*(o11 - v11));
	return this;
}

//- Add a value to the field at a normalized (0..1) index
// Uses linear interpolation to distribute the value between nearest cells, for accumulation.
// Indices out of range will wrap.
// @param value the value to add to the field
// @param x coordinate (0..1) to update
// @param y coordinate (0..1) to update
// @return this
field2D.prototype.splat = function(value, x, y) {
	//assert(value, "missing value for splat")
	//assert(x, "missing x coordinate for splat")
	//assert(y, "missing y coordinate for splat")
	var array = this.array;
	var x = wrap(((x * this.width) - 0.5), this.width);
	var y = wrap(((y * this.height) - 0.5), this.height);
	var x0 = floor(x);
	var y0 = floor(y);
	var x1 = wrap(x0 + 1, this.width);
	var y1 = wrap(y0 + 1, this.height);
	var xb = x - x0;
	var yb = y - y0;
	var xa = 1 - xb;
	var ya = 1 - yb;
	array.set(x0, y0, array.get(x0, y0) + value * xa * ya);
	array.set(x1, y0, array.get(x1, y0) + value * xb * ya);
	array.set(x0, y1, array.get(x0, y1) + value * xa * yb);
	array.set(x1, y1, array.get(x1, y1) + value * xb * yb);
	return this;
}

//- Multiply the field by a value, optionally at a normalized (0..1) index
// If indices are not given, all cells are multipled by the value.
// Otherwise, uses linear interpolation to distribute the value between nearest cells, for multiplication. If the position index is exactly in the center of a cell, it performs a normal multiplcation. Otherwise the four nearest cells are updated according to a weighted average of their current and modified value.
// Indices out of range will wrap.
// @param value the value to scale to the field
// @param x coordinate (0..1) to update (optional)
// @param y coordinate (0..1) to update (optional)
// @return this
field2D.prototype.scale = function(value, x, y) {
	var array = this.array;
	//assert(value, "missing value for scale")
	if (x != null && y != null) {
		var x = wrap(((x * this.width) - 0.5), this.width);
		var y = wrap(((y * this.height) - 0.5), this.height);
		var x0 = floor(x);
		var y0 = floor(y);
		var x1 = wrap(x0 + 1, this.width);
		var y1 = wrap(y0 + 1, this.height);
		var xb = x - x0;
		var yb = y - y0;
		var xa = 1 - xb;
		var ya = 1 - yb;
		// old value
		var v00 = array.get(x0, y0); 
		var v10 = array.get(x1, y0); 
		var v01 = array.get(x0, y1); 
		var v11 = array.get(x1, y1); 
		// new value
		var o00 = v00 * value;
		var o10 = v10 * value;
		var o01 = v01 * value;
		var o11 = v11 * value;
		// interpolated application:
		array.set(x0, y0, v00 + xa*ya*(o00 - v00));
		array.set(x1, y0, v10 + xb*ya*(o10 - v10));
		array.set(x0, y1, v01 + xa*yb*(o01 - v01));
		array.set(x1, y1, v11 + xb*yb*(o11 - v11));
	} else {
		for (var i = 0, l = array.data.length; i < l; i++) {
			array.data[i] *= value;
		}
	}
	return this;
}

field2D.prototype.clear = function() {
	var array = this.array;
	for (var i = 0, l = array.data.length; i < l; i++) {
		array.data[i] = 0;
	}
	return this;
}

//- fill the field with a diffused (blurred) copy of another
// @param sourcefield the field to be diffused
// @param diffusion the rate of diffusion
// @param passes ?int the number of iterations to improve numerical accuracy (default 10)
field2D.prototype.diffuse = function(sourcefield, diffusion, passes) {
	var array = this.array;
	passes = passes || 10;
	var input = sourcefield.array;
	var div = 1.0/((1.+4.*diffusion));
	var w = sourcefield.width, h = sourcefield.height;	
	// Gauss-Seidel relaxation scheme:
	for (var n = 1; n < passes; n++) {
		for (var y = 0; y < h; y++) {
			for (var x = 0; x < w; x++) {
				var pre =	input.get(x,  y  );
				var va0 =	array.get(wrap(x-1,w),y  );
				var vb0 =	array.get(wrap(x+1,w),y  );
				var v0a =	array.get(x,  wrap(y-1,h));
				var v0b =	array.get(x,  wrap(y+1, h));
				array.set(x, y, div*(
					pre +
					diffusion * (
						va0 + vb0 +
						v0a + v0b
					)
				));
			}
		}
	}
	return this;
}

//- Apply a function to each cell of the field in turn
// The function arguments will be the current value of the cell and the x and y position, and the return value should be the new value of the cell (or nil to indicate no change). E.g. to multiply all cells by 2: field:map(function(value, x, y) return value * 2 })
// @param func the function to apply
// @return this
field2D.prototype.map = function(func) {
	var array = this.array;
	var w = this.width, h = this.height;	
	for (var y = 0; y < h; y++) {
		for (var x = 0; x < w; x++) {
			var old = array.get(x, y);
			var v = func(old, x, y);
			array.set(x, y, v != null ? v : old);
		}
	}
	return this;
}

field2D.prototype.reduce = function(func, result) {
	var array = this.array;
	var w = this.width, h = this.height;	
	for (var y = 0; y < h; y++) {
		for (var x = 0; x < w; x++) {
			result = func(result, array.get(x, y), x, y);
		}
	}
	return result;
}


//- normalize the field values to a 0..1 range
// @return this
field2D.prototype.normalize = function() {
	var array = this.array;
	var data = array.data;
	var w = this.width, h = this.height;
	var lo = data[0];
	var hi = lo;
	for (var i = 1, l = data.length; i < l; i++) {
		lo = min(lo, data[i]);
		hi = max(hi, data[i]);
	}
	var range = hi - lo;
	var scale = 1/range;
	for (var i = 0, l = data.length; i < l; i++) {
		data[i] = scale * (data[i] - lo);
	}
	return this;
}

//- return the sum of all cells
// @return sum
field2D.prototype.sum = function() {
	return this.reduce(function(total, cell) {
		return total + cell;
	}, 0);
}

//- return the maximum value of all cells
// @return max
field2D.prototype.max = function() {
	return this.reduce(Math.max, Number.NEGATIVE_INFINITY);
}

//- return the minimum value of all cells
// @return min
field2D.prototype.min = function() {
	return this.reduce(Math.min, Number.MAX_VALUE);
}

var cos = Math.cos,
	sin = Math.sin,
	pi = Math.PI,
	pow = Math.pow,
	sqrt = Math.sqrt,
	atan2 = Math.atan2;

vec2 = function(x, y) {
	if (typeof x == "object") {
		this.x = x.x;
		this.y = x.y;
	} else {
		this.x = (x != undefined) ? x : 0;
		this.y = (y != undefined) ? y : 0;
	}
	return this;
}

vec2.prototype.copy = function() {
	return new vec2(this.x, this.y);
}

vec2.prototype.set = function(x, y) {
	if (typeof x == "object") {
		this.x = x.x;
		this.y = x.y;
	} else {
		this.x = (x != undefined) ? x : 0;
		this.y = (y != undefined) ? y : 0;
	}
	return this;
}

vec2.prototype.fromAngle = function(a) {
	a = (a != undefined) ? a : 0;
	return new vec2(cos(a), sin(a));
}

vec2.prototype.fromPolar = function(r, a) {
	r = (r != undefined) ? r : 0;
	a = (a != undefined) ? a : 0;
	this.x = r*cos(a);
	this.y = r*sin(a);
	return this;
}

vec2.prototype.add = function(b) {
	if (typeof b == "object") {
		this.x += b.x;
		this.y += b.y;
	} else {
		this.x += b;
		this.y += b;
	}
	return this;
}

vec2.prototype.sub = function(b) {
	if (typeof b == "object") {
		this.x -= b.x;
		this.y -= b.y;
	} else {
		this.x -= b;
		this.y -= b;
	}
	return this;
}

vec2.prototype.mul = function(b) {
	if (typeof b == "object") {
		this.x *= b.x;
		this.y *= b.y;
	} else {
		this.x *= b;
		this.y *= b;
	}
	return this;
}

vec2.prototype.div = function(b) {
	if (typeof b == "object") {
		this.x /= b.x;
		this.y /= b.y;
	} else {
		this.x /= b;
		this.y /= b;
	}
	return this;
}

vec2.prototype.relativewrap = function(x, y) {
	x = (x != undefined) ? x : 1;
	y = (y != undefined) ? y : x;
	var halfx = x * 0.5;
	var halfy = y * 0.5;
	this.x = wrap(this.x + halfx, x) - halfx;
	this.y = wrap(this.x + halfy, y) - halfy;
	return this;
}

vec2.prototype.normalize = function() {
	var r = this.length();
	if (r > 0) {
		this.x /= r;
		this.y /= r;
	} else {
		this.random();
	}
	return this;
}

vec2.prototype.limit = function(m) {
	var r2 = this.dot(this);
	if (r2 > m*m) {
		this.mul(m / sqrt(r2));
	}
	return this;
}

vec2.prototype.setangle = function(a) {
	var r = this.length();
	this.x = r * cos(a);
	this.b = r * sin(a);
	return this;
}

vec2.prototype.setmag = function(m) {
	return this.mul(m / this.length());
}

vec2.prototype.rotate = function(angle) {
	var c = cos(angle);
	var s = sin(angle);
	var x = this.x, y = this.y;
	this.x = x * c - y * s;
	this.y = y * c + x * s;
	return this;
}

vec2.prototype.length = function() {
	return sqrt(this.x*this.x + this.y*this.y);
}

vec2.prototype.angle = function() {
	return atan2(this.y, this.x);
}

vec2.prototype.dot = function(b) {
	return this.x*b.x + this.y*b.y;
}

vec2.prototype.distance = function(b) {
	return vec2.sub(this, b).length();
}

vec2.prototype.anglebetween = function(b) {
	var am = this.length();
	var bm = b.length();
	return acos(this.dot(b) / (am*bm));
}

vec2.prototype.equals = function(a, b) {
	return this.x == b.x && this.y == b.y;
}

var fold2 = function(f) {
	return function(b) {
		if (typeof b == "object") {
			this.x = f(this.x, b.x);
			this.y = f(this.y, b.y);
		} else {
			this.x = f(this.x, b);
			this.y = f(this.y, b);
		}
		return this;
	}
}

vec2.prototype.pow = fold2(Math.pow);
vec2.prototype.wrap = fold2(wrap);
vec2.prototype.min = fold2(Math.min);
vec2.prototype.max = fold2(Math.max);

vec2.prototype.clip = function(lo, hi) {
	return this.min(hi).max(lo);
}
vec2.prototype.lerp = function(v, f) {
	return this.add(this.copy().sub(v).mul(-f));
}

vec2.prototype.random = function(r) {
	r = (r != undefined) ? r : 1;
	var a = random() * pi * 2;
	this.x = r * cos(a);
	this.y = r * sin(a);
	return this;
}

vec2.fromPolar = function(r, a) {
	r = (r != undefined) ? r : 0;
	a = (a != undefined) ? a : 0;
	return new vec2(r*cos(a), r*sin(a));
}

vec2.add = function(a, b) {
	if (typeof b == "object") {
		return new vec2(a.x + b.x, a.y + b.y);
	} else {
		return new vec2(a.x + b, a.y + b);
	}
}

vec2.sub = function(a, b) {
	if (typeof b == "object") {
		return new vec2(a.x - b.x, a.y - b.y);
	} else {
		return new vec2(a.x - b, a.y - b);
	}
}

vec2.mul = function(a, b) {
	if (typeof b == "object") {
		return new vec2(a.x * b.x, a.y * b.y);
	} else {
		return new vec2(a.x * b, a.y * b);
	}
}

vec2.div = function(a, b) {
	if (typeof b == "object") {
		return new vec2(a.x / b.x, a.y / b.y);
	} else {
		return new vec2(a.x / b, a.y / b);
	}
}

vec2.relativewrap = function(a, x, y) {
	x = (x != undefined) ? x : 1;
	y = (y != undefined) ? y : x;
	var halfx = x * 0.5;
	var halfy = y * 0.5;
	return new vec2(
		wrap(a.x + halfx, x) - halfx,
		wrap(a.x + halfy, y) - halfy
	);
}

var fold2 = function(f) {
	return function(a, b) {
		if (typeof b == "object") {
			return new vec2(f(a.x, b.x), f(a.y, b.y));
		} else {
			return new vec2(f(a.x, b), f(a.y, b));
		}
	}
}

vec2.pow = fold2(Math.pow);
vec2.wrap = fold2(wrap);
vec2.min = fold2(Math.min);
vec2.max = fold2(Math.max);

vec2.clip = function(a, lo, hi) {
	return vec2.min(a, hi).max(lo);
}
vec2.lerp = function(a, v, f) {
	return a.copy().sub(v).mul(-f).add(a);
}

vec2.equals = function(a, b) {
	return a.x == b.x && a.y == b.y;
}

vec2.random = function(r) {
	r = (r != undefined) ? r : 1;
	var a = random() * pi * 2;
	return new(cos(a), sin(a)) * r;
}

vec2.normalize = function(a) {
	var r = a.length();
	if (r > 0) {
		return new vec2(a.x / r, a.y / r);
	} else {
		return vec2.random();
	}
	return a;
}

vec2.limit = function(a, m) {
	var r2 = a.dot(a);
	if (r2 > m*m) {
		var d = 1 / sqrt(r2);
		return new vec2(a.x * d, a.y * d);
	}
	return a.copy();
}

vec2.setmag = function(a, m) {
	var d = m / a.length();
	return new vec2(a.x * d, a.y * d);
}

vec2.setangle = function(self, a) {
	var r = self.length();
	return new vec2(r * cos(a), r * sin(a));
}

vec2.rotate = function(a, angle) {
	var c = cos(angle);
	var s = sin(angle);
	var x = a.x, y = a.y;
	return new vec2(x * c - y * s, y * c + x * s);
}

draw2D = {};

draw2D.push = function() { 
	ctx.save();
	return draw2D; 
}
draw2D.pop = function() { 
	ctx.restore(); 
	return draw2D;
}
draw2D.translate = function(x, y) { 
	ctx.translate(x, y); 
	return draw2D;
}
draw2D.scale = function(x, y) { 
	y = (y != undefined) ? y : x;
	ctx.scale(x, y); 
	return draw2D;
}
draw2D.rotate = function(a) { 
	ctx.rotate(a); 
	return draw2D;
}

draw2D.line = function(x1, y1, x2, y2) {
	x1 = (x1 != undefined) ? x1 : 0;
	y1 = (y1 != undefined) ? y1 : 0;
	x2 = (x2 != undefined) ? x2 : 0;
	y2 = (y2 != undefined) ? y2 : 0;
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.stroke();
	return draw2D;
}

draw2D.rect = function(x, y, w, h) {
	x = (x != undefined) ? x : 0;
	y = (y != undefined) ? y : 0;
	w = (w != undefined) ? w : 0;
	h = (h != undefined) ? h : 0;
	var w2 = w/2;
	var h2 = h/2;
	var x1 = x - w2;
	var y1 = y - h2;
	ctx.fillRect(x1, y1, w, h);
	return draw2D;
}

draw2D.circle = function(x, y, d) {
	x = (x != undefined) ? x : 0;
	y = (y != undefined) ? y : 0;
	var r = (d != undefined) ? d/2 : 0.5;
	ctx.beginPath();
	ctx.arc(x, y, r, 0, 2*Math.PI);
	ctx.closePath();
	ctx.fill();
	return draw2D;
}

draw2D.arc = function(x, y, s, e, d) {
	x = (x != undefined) ? x : 0;
	y = (y != undefined) ? y : 0;
	var r = (d != undefined) ? d/2 : 0.5;
	ctx.beginPath();
	ctx.arc(x, y, r, s, e);
	ctx.closePath();
	ctx.fill();
	return draw2D;
}

draw2D.color = function(r, g, b, a) {
	r = (r != undefined) ? r : 0.5;
	g = (g != undefined) ? g : r;
	b = (b != undefined) ? b : r;
	a = (a != undefined) ? a : 1;
	color = "rgba("+Math.floor(r*255.)+", "+Math.floor(g*255.)+", "+Math.floor(b*255.)+", "+a+")";
	ctx.fillStyle = color;
	ctx.strokeStyle = color;
}