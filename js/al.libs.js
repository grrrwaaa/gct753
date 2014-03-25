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

var floor = Math.floor;
var piover2 = Math.PI/2.;
var ugens = [];

al.audio.SinOsc = function() {
	al.audio_init();
	
	this.amp = 0.1;
	this.phase = 0;
	this.frequency = 440.0;
	this.table = tableSine;
	this.pan = 0.5;
	
	this.parameter_smooth = 0.005;
	this.freqsmooth = this.frequency;
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
	
	this.freqsmooth += this.parameter_smooth * (this.frequency - this.freqsmooth);
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
	if (draw && typeof draw === "function") draw(ctx);
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
		if (draw && typeof draw === "function") draw(ctx);
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

var canvas, ctx;
var offscreen_canvas, offscreen_ctx, offscreen_image, offscreen_data;

al.init = function (options) {
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
