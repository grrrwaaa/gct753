(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
npm install -g browserify
npm install -g minify
npm install ndarray zeros
// etc.

browserify js/gibberish_2.0.min.js js/al.libs.js  -o al.js && minify al.js al.min.js
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
	al_dt = (now - al_now) * 0.001;
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

},{"ndarray":3,"seedrandom":5,"zeros":6}],2:[function(require,module,exports){
function createInput(){navigator.webkitGetUserMedia({audio:!0},function(e){console.log("CONNECTING INPUT"),Gibberish.mediaStreamSource=Gibberish.context.createMediaStreamSource(e),Gibberish.mediaStreamSource.connect(Gibberish.node),_hasInput=!0})}Gibberish={memo:{},codeblock:[],analysisCodeblock:[],analysisUgens:[],dirtied:[],id:0,isDirty:!1,out:null,debug:!1,callback:"",audioFiles:{},sequencers:[],callbackArgs:["input"],callbackObjects:[],analysisCallbackArgs:[],analysisCallbackObjects:[],createCallback:function(){this.memo={},this.codeblock.length=0,this.callbackArgs.length=0,this.callbackObjects.length=0,this.analysisCallbackArgs.length=0,this.dirtied.length=0,this.codestring="Gibberish.callback = function(input,",this.memo={},this.out.codegen();var e=this.codeblock.slice(0);if(this.analysisUgens.length>0){this.analysisCodeblock.length=0;for(var t=0;t<this.analysisUgens.length;t++)this.analysisCallbackArgs.push(this.analysisUgens[t].analysisSymbol)}for(var t=0;t<this.callbackArgs.length;t++)this.codestring+=this.callbackArgs[t],t<this.callbackArgs.length-1&&(this.codestring+=", ");for(var t=0;t<this.analysisCallbackArgs.length;t++)this.codestring+=", ",this.codestring+=this.analysisCallbackArgs[t];if(this.codestring+="){\n	",this.codestring+=e.join("	"),this.codestring+="\n	",this.analysisUgens.length>0){this.analysisCodeblock.length=0;for(var t=0;t<this.analysisUgens.length;t++)this.codeblock.length=0,this.analysisUgens[t].analysisCodegen();this.codestring+=this.analysisCodeblock.join("\n	"),this.codestring+="\n	"}return this.codestring+="return "+this.out.variable+";\n",this.codestring+="}",this.callbackString=this.codestring,this.debug&&console.log(this.callbackString),this.codestring},audioProcess:function(e){var bufferL=e.outputBuffer.getChannelData(0),bufferR=e.outputBuffer.getChannelData(1),input=e.inputBuffer.getChannelData(0),me=Gibberish,callback=me.callback,sequencers=me.sequencers,out=Gibberish.out.callback,objs=me.callbackObjects.slice(0),_callback;objs.unshift(0);for(var i=0,_bl=e.outputBuffer.length;_bl>i;i++){for(var j=0;j<sequencers.length;j++)sequencers[j].tick();if(me.isDirty){_callback=me.createCallback();try{callback=eval(_callback)}catch(e){console.error("ERROR WITH CALLBACK : \n\n",_callback)}me.isDirty=!1,objs=me.callbackObjects.slice(0),objs.unshift(0)}objs[0]=input[i],val=callback.apply(null,objs),bufferL[i]=val[0],bufferR[i]=val[1]}},audioProcessFirefox:function(soundData){var me=Gibberish,callback=me.callback,sequencers=me.sequencers,objs=me.callbackObjects.slice(0);objs.unshift(0);for(var i=0,size=soundData.length;size>i;i+=2){for(var j=0;j<sequencers.length;j++)sequencers[j].tick();if(me.isDirty){callback=me.createCallback();try{callback=eval(callback)}catch(e){console.error("ERROR WITH CALLBACK : \n\n",callback)}me.isDirty=!1,objs=me.callbackObjects.slice(0),objs.unshift(0)}var val=callback.apply(null,objs);soundData[i]=val[0],soundData[i+1]=val[1]}},clear:function(){this.out.inputs.length=0,this.analysisUgens.length=0,this.sequencers.length=0,this.callbackArgs.length=2,this.callbackObjects.length=1,Gibberish.dirty(this.out)},dirty:function(e){if("undefined"!=typeof e){for(var t=!1,i=0;i<this.dirtied.length;i++)this.dirtied[i].variable===e.variable&&(t=!0);t||(this.isDirty=!0,this.dirtied.push(e))}else this.isDirty=!0},generateSymbol:function(e){return e+"_"+this.id++},AudioDataDestination:function(e,t){var i=new Audio;i.mozSetup(2,e);var s,r=0,n=e/2,a=null;setInterval(function(){var e;if(a){if(e=i.mozWriteAudio(a.subarray(s)),r+=e,s+=e,s<a.length)return;a=null}var o=i.mozCurrentSampleOffset(),h=o+n-r;if(h>0){var u=new Float32Array(h);t(u),e=i.mozWriteAudio(u),o=i.mozCurrentSampleOffset(),e<u.length&&(a=u,s=e),r+=e}},100)},init:function(){Gibberish.out=new Gibberish.Bus2,Gibberish.out.codegen(),Gibberish.dirty(Gibberish.out);var e,t="undefined"==typeof arguments[0]?1024:arguments[0];return"undefined"!=typeof webkitAudioContext?e=webkitAudioContext:"undefined"!=typeof AudioContext&&(e=AudioContext),start=function(){if("undefined"!=typeof e){if(document.getElementsByTagName("body")[0].removeEventListener("touchstart",start),Gibberish.context=new e,Gibberish.node=Gibberish.context.createScriptProcessor(t,2,2,Gibberish.context.sampleRate),Gibberish.node.onaudioprocess=Gibberish.audioProcess,Gibberish.node.connect(Gibberish.context.destination),"ontouchstart"in document.documentElement){var i=Gibberish.context.createBufferSource();i.connect(Gibberish.context.destination),i.noteOn(0)}}else-1===navigator.userAgent.indexOf("Firefox")?(Gibberish.AudioDataDestination(44100,Gibberish.audioProcessFirefox),Gibberish.context={sampleRate:44100}):alert("Your browser does not support javascript audio synthesis. Please download a modern web browser that is not Internet Explorer.")},"ontouchstart"in document.documentElement?document.getElementsByTagName("body")[0].addEventListener("touchstart",start):start(),this},makePanner:function(){var e=Math.sin,t=Math.cos,i=Math.sqrt(2)/2,s=function(s,r,n){var a="object"==typeof s,o=a?s[0]:s,h=a?s[1]:s;return n[0]=o*i*(t(r)-e(r)),n[1]=h*i*(t(r)+e(r)),n};return s},defineUgenProperty:function(e,t,i){var s=i.properties[e]={value:t,binops:[],parent:i,name:e};Object.defineProperty(i,e,{configurable:!0,get:function(){return s.value},set:function(e){s.value=e,Gibberish.dirty(i)}})},polyInit:function(e){e.mod=e.polyMod,e.removeMod=e.removePolyMod;for(var t in e.polyProperties)!function(t){var i=e.polyProperties[t];Object.defineProperty(e,t,{configurable:!0,get:function(){return i},set:function(s){i=s;for(var r=0;r<e.children.length;r++)e.children[r][t]=i}})}(t)},interpolate:function(e,t){var i=0|t,s=i+1>e.length-1?0:i+1;return frac=t-i,e[i]+frac*(e[s]-e[i])},pushUnique:function(e,t){for(var i=e,s=!0,r=0;r<t.length;r++)if(i===t[r]){s=!1;break}s&&t.push(i)},"export":function(e,t){for(var i in Gibberish[e])t[i]=Gibberish[e][i]},ugen:function(){Gibberish.extend(this,{processProperties:function(){if("object"!=typeof arguments[0][0]||"undefined"!=typeof arguments[0][0].type||Array.isArray(arguments[0][0])||"op"===arguments[0][0].name){var e=0;for(var t in this.properties)"object"==typeof this.properties[t]&&"undefined"!=typeof this.properties[t].binops?"undefined"!=typeof arguments[0][e]&&(this.properties[t].value=arguments[0][e++]):"undefined"!=typeof arguments[0][e]&&(this.properties[t]=arguments[0][e++])}else{var i=arguments[0][0];for(var t in i)"undefined"!=typeof i[t]&&("object"==typeof this.properties[t]&&"undefined"!=typeof this.properties[t].binops?this.properties[t].value=i[t]:this[t]=i[t])}return this},codegen:function(){var e="",t=null;if(Gibberish.memo[this.symbol])return Gibberish.memo[this.symbol];t=this.variable?this.variable:Gibberish.generateSymbol("v"),Gibberish.memo[this.symbol]=t,this.variable=t,e+="var "+t+" = "+this.symbol+"(";for(var i in this.properties){var s=this.properties[i],r="";if(Array.isArray(s.value)){0===s.value.length&&(r=0);for(var n=0;n<s.value.length;n++){var a=s.value[n];r+="object"==typeof a?null!==a?a.codegen():"null":"function"==typeof s.value?s.value():s.value,r+=n<s.value.length-1?", ":""}}else"object"==typeof s.value?null!==s.value&&(r=s.value.codegen?s.value.codegen():s.value):"undefined"!==s.name&&(r="function"==typeof s.value?s.value():s.value);if(0!=s.binops.length){for(var o=0;o<s.binops.length;o++)e+="(";for(var h=0;h<s.binops.length;h++){var u,c=s.binops[h];u="number"==typeof c.ugen?c.ugen:null!==c.ugen?c.ugen.codegen():"null","="===c.binop?(e=e.replace(r,""),e+=u):"++"===c.binop?e+=" + Math.abs("+u+")":(0===h&&(e+=r),e+=" "+c.binop+" "+u+")")}}else e+=r;e+=", "}return" "===e.charAt(e.length-1)&&(e=e.slice(0,-2)),e+=");\n",this.codeblock=e,-1===Gibberish.codeblock.indexOf(this.codeblock)&&Gibberish.codeblock.push(this.codeblock),-1===Gibberish.callbackArgs.indexOf(this.symbol)&&"op"!==this.name&&Gibberish.callbackArgs.push(this.symbol),-1===Gibberish.callbackObjects.indexOf(this.callback)&&"op"!==this.name&&Gibberish.callbackObjects.push(this.callback),this.dirty=!1,t},init:function(){if(this.initalized||(this.symbol=Gibberish.generateSymbol(this.name),this.codeblock=null,this.variable=null),"undefined"==typeof this.properties&&(this.properties={}),!this.initialized){this.destinations=[];for(var e in this.properties)Gibberish.defineUgenProperty(e,this.properties[e],this)}if(arguments.length>0&&"object"==typeof arguments[0][0]&&"undefined"===arguments[0][0].type){var t=arguments[0][0];for(var e in t)this[e]=t[e]}return this.initialized=!0,this},mod:function(e,t,i){var s=this.properties[e],r={ugen:t,binop:i};s.binops.push(r),Gibberish.dirty(this)},removeMod:function(e,t){if("undefined"==typeof t)this.properties[e].binops.length=0;else if("number"==typeof t)this.properties[e].binops.splice(t,1);else if("object"==typeof t)for(var i=0,s=this.properties[e].binops.length;s>i;i++)this.properties[e].binops[i].ugen===t&&this.properties[e].binops.splice(i,1);Gibberish.dirty(this)},polyMod:function(e,t,i){for(var s=0;s<this.children.length;s++)this.children[s].mod(e,t,i);Gibberish.dirty(this)},removePolyMod:function(){var e=Array.prototype.slice.call(arguments,0);if("amp"!==arguments[0]&&"pan"!==arguments[0])for(var t=0;t<this.children.length;t++)this.children[t].removeMod.apply(this.children[t],e);else this.removeMod.apply(this,e);Gibberish.dirty(this)},smooth:function(e){var t=new Gibberish.OnePole;this.mod(e,t,"=")},connect:function(e){return"undefined"==typeof e&&(e=Gibberish.out),-1===this.destinations.indexOf(e)&&(e.addConnection(this,1),this.destinations.push(e)),this},send:function(e,t){return-1===this.destinations.indexOf(e)?(e.addConnection(this,t),this.destinations.push(e)):e.adjustSendAmount(this,t),this},disconnect:function(e,t){var i;if(e)i=this.destinations.indexOf(e),i>-1&&this.destinations.splice(i,1),e.removeConnection(this);else{for(var s=0;s<this.destinations.length;s++)this.destinations[s].removeConnection(this);this.destinations=[]}return Gibberish.dirty(this),this}})}},Array2=function(){this.length=0},Array2.prototype=[],Array2.prototype.remove=function(e,t){if(t="undefined"==typeof t?!0:t,"undefined"==typeof e){for(var i=0;i<this.length;i++)delete this[i];this.length=0}else if("number"==typeof e)this.splice(e,1);else if("string"==typeof e){for(var s=[],i=0;i<this.length;i++){var r=this[i];if(r.type===e||r.name===e){if(!t)return this.splice(i,1),void 0;s.push(i)}}for(var i=0;i<s.length;i++)this.splice(s[i],1)}else if("object"==typeof e)for(var n=this.indexOf(e);n>-1;)this.splice(n,1),n=this.indexOf(e);this.parent&&Gibberish.dirty(this.parent)},Array2.prototype.get=function(e){if("number"==typeof e)return this[e];if("string"==typeof e)for(var t=0;t<this.length;t++){var i=this[t];if(i.name===e)return i}else if("object"==typeof e){var s=this.indexOf(e);if(s>-1)return this[s]}return null},Array2.prototype.replace=function(e,t){if(t.parent=this,t.input=e.input,"number"!=typeof e){var i=this.indexOf(e);i>-1&&this.splice(i,1,t)}else this.splice(e,1,t);this.parent&&Gibberish.dirty(this.parent)},Array2.prototype.insert=function(e,t){if(e.parent=this,this.input=this.parent,Array.isArray(e))for(var i=0;i<e.length;i++)this.splice(t+i,0,e[i]);else this.splice(t,0,e);this.parent&&Gibberish.dirty(this.parent)},Array2.prototype.add=function(){for(var e=0;e<arguments.length;e++)arguments[e].parent=this,arguments[e].input=this.parent,this.push(arguments[e]);this.parent&&(console.log("DIRTYING"),Gibberish.dirty(this.parent))};var rnd=Math.random;Gibberish.rndf=function(e,t,i,s){if(s="undefined"==typeof s?!0:s,"undefined"==typeof i&&"object"!=typeof e){1==arguments.length?(e=0,t=arguments[0]):2==arguments.length?(e=arguments[0],t=arguments[1]):(e=0,t=1);var r=t-e,n=Math.random(),a=r*n;return e+a}var o=[],h=[];"undefined"==typeof i&&(i=t||e.length);for(var u=0;i>u;u++){var c;if("object"==typeof arguments[0])c=arguments[0][rndi(0,arguments[0].length-1)];else if(s)c=Gibberish.rndf(e,t);else{for(c=Gibberish.rndf(e,t);h.indexOf(c)>-1;)c=Gibberish.rndf(e,t);h.push(c)}o.push(c)}return o},Gibberish.Rndf=function(){{var e,t,i,s,r=Math.random;Math.round}return 0===arguments.length?(e=0,t=1):1===arguments.length?(e=0,t=arguments[0]):2===arguments.length?(e=arguments[0],t=arguments[1]):(e=arguments[0],t=arguments[1],i=arguments[2]),s=t-e,function(){var t;if("undefined"==typeof i)t=e+r()*s;else{t=[];for(var n=0;i>n;n++)t.push(e+r()*s)}return t}},Gibberish.rndi=function(e,t,i,s){var r;if(0===arguments.length?(e=0,t=1):1===arguments.length?(e=0,t=arguments[0]):(e=arguments[0],t=arguments[1]),"undefined"==typeof i)return r=t-e,Math.round(e+Math.random()*r);for(var n=[],a=[],o=0;i>o;o++){var h;if(s)h=Gibberish.rndi(e,t);else{for(h=Gibberish.rndi(e,t);a.indexOf(h)>-1;)h=Gibberish.rndi(e,t);a.push(h)}n.push(h)}return n},Gibberish.Rndi=function(){var e,t,i,s,r=Math.random,n=Math.round;return 0===arguments.length?(e=0,t=1):1===arguments.length?(e=0,t=arguments[0]):2===arguments.length?(e=arguments[0],t=arguments[1]):(e=arguments[0],t=arguments[1],i=arguments[2]),s=t-e,function(){var t;if("undefined"==typeof i)t=n(e+r()*s);else{t=[];for(var a=0;i>a;a++)t.push(n(e+r()*s))}return t}},Gibberish.extend=function(e,t){for(var i in t){{i.split(".")}t[i]instanceof Array&&t[i].length<100?(e[i]=t[i].slice(0),"fx"===i&&(e[i].parent=t[i].parent)):"object"!=typeof t[i]||null===t[i]||t[i]instanceof Float32Array?e[i]=t[i]:(e[i]=e[i]||{},arguments.callee(e[i],t[i]))}return e},Function.prototype.clone=function(){return eval("["+this.toString()+"]")[0]},String.prototype.format=function(e,t,i){function s(){var s=this,r=arguments.length+1;for(e=0;r>e;i=arguments[e++])t=i,s=s.replace(RegExp("\\{"+(e-1)+"\\}","g"),t);return s}return s.native=String.prototype.format,s}(),Gibberish.future=function(e,t){var i=new Gibberish.Sequencer({values:[function(){},function(){e(),i.stop(),i.disconnect()}],durations:[t]}).start()},Gibberish.Proxy=function(){var e=0;Gibberish.extend(this,{name:"proxy",type:"effect",properties:{},callback:function(){return e}}).init(),this.input=arguments[0],e=this.input.parent[this.input.name],delete this.input.parent[this.input.name],this.input.parent.properties[this.input.name].value=this,Object.defineProperty(this.input.parent,this.input.name,{get:function(){return e},set:function(t){e=t}}),Gibberish.dirty(this.input.parent)},Gibberish.Proxy.prototype=new Gibberish.ugen,Gibberish.Proxy2=function(){var e=arguments[0],t=arguments[1];Gibberish.extend(this,{name:"proxy2",type:"effect",properties:{},callback:function(){var i=e[t];return Array.isArray(i)?(i[0]+i[1]+i[2])/3:i}}).init(),this.getInput=function(){return e},this.setInput=function(t){e=t},this.getName=function(){return t},this.setName=function(e){t=e}},Gibberish.Proxy2.prototype=new Gibberish.ugen,Gibberish.Proxy3=function(){var e=arguments[0],t=arguments[1];Gibberish.extend(this,{name:"proxy3",type:"effect",properties:{},callback:function(){var i=e[t];return i||0}}),this.init(),this.codegen=function(){console.log(" CALLED "),this.variable||(this.variable=Gibberish.generateSymbol("v")),Gibberish.callbackArgs.push(this.symbol),Gibberish.callbackObjects.push(this.callback),this.codeblock="var "+this.variable+" = "+this.symbol+"("+e.properties[t].codegen()+");\n"}},Gibberish.Proxy3.prototype=new Gibberish.ugen,Gibberish.oscillator=function(){this.type="oscillator",this.oscillatorInit=function(){return this.fx=new Array2,this.fx.parent=this,this}},Gibberish.oscillator.prototype=new Gibberish.ugen,Gibberish._oscillator=new Gibberish.oscillator,Gibberish.Wavetable=function(){var e=0,t=null,i=Gibberish.context.sampleRate/1024;this.properties={frequency:440,amp:.25},this.getTable=function(){return t},this.setTable=function(e){t=e,i=Gibberish.context.sampleRate/t.length},this.getTableFreq=function(){return i},this.setTableFreq=function(e){i=e},this.getPhase=function(){return e},this.setPhase=function(t){e=t},this.callback=function(s,r){var n,a,o,h,u;for(e+=s/i;e>=1024;)e-=1024;return n=0|e,a=e-n,n=1023&n,o=1023===n?0:n+1,h=t[n],u=t[o],(h+a*(u-h))*r}},Gibberish.Wavetable.prototype=Gibberish._oscillator,Gibberish.Table=function(e){this.__proto__=new Gibberish.Wavetable,this.name="table";var t=2*Math.PI;if("undefined"==typeof e){e=new Float32Array(1024);for(var i=1024;i--;)e[i]=Math.sin(i/1024*t)}this.setTable(e),this.init(),this.oscillatorInit()},Gibberish.asmSine=function(e,t,i){"use asm";function s(){for(var e=1024,t=1024;e=e-1|0;)t-=1,h[e>>2]=+a(+(t/1024)*6.2848);c=44100/1024}function r(e,t,i){e=+e,t=+t,i=+i;var s=0,r=0,n=0,a=0,l=0,b=0;return o=+(o+e/c),o>=1024&&(o=+(o-1024)),s=+u(o),a=o-s,r=~~s,n=(r|0)==1024?0:r+1|0,l=+h[r>>2],b=+h[n>>2],+((l+a*(b-l))*t)}function n(e){return e|=0,+h[e>>2]}var a=e.Math.sin,o=0,h=new e.Float32Array(i),u=e.Math.floor,c=0;return{init:s,gen:r,get:n}},Gibberish.asmSine2=function(){this.properties={frequency:440,amp:.5,sr:Gibberish.context.sampleRate},this.name="sine";var e=new ArrayBuffer(4096),t=Gibberish.asmSine(window,null,e);return t.init(),this.getTable=function(){return e},this.get=t.get,this.callback=t.gen,this.init(),this.oscillatorInit(),this.processProperties(arguments),this},Gibberish.asmSine2.prototype=Gibberish._oscillator,Gibberish.Sine=function(){this.__proto__=new Gibberish.Wavetable,this.name="sine";for(var e=2*Math.PI,t=new Float32Array(1024),i=1024;i--;)t[i]=Math.sin(i/1024*e);this.setTable(t),this.init(arguments),this.oscillatorInit(),this.processProperties(arguments)},Gibberish.Sine2=function(){this.__proto__=new Gibberish.Sine,this.name="sine2";var e=this.__proto__.callback,t=Gibberish.makePanner(),i=[0,0];this.callback=function(s,r,n){var a=e(s,r);return i=t(a,n,i)},this.init(),this.oscillatorInit(),Gibberish.defineUgenProperty("pan",0,this),this.processProperties(arguments)},Gibberish.Square=function(){this.__proto__=new Gibberish.Wavetable,this.name="square";for(var e=(2*Math.PI,new Float32Array(1024)),t=1024;t--;)e[t]=t/1024>.5?1:-1;this.setTable(e),this.init(arguments),this.oscillatorInit(),this.processProperties(arguments)},Gibberish.Saw=function(){this.__proto__=new Gibberish.Wavetable,this.name="saw";for(var e=new Float32Array(1024),t=1024;t--;)e[t]=4*((t/1024/2+.25)%.5-.25);this.setTable(e),this.init(arguments),this.oscillatorInit(),this.processProperties(arguments)},Gibberish.Saw2=function(){this.__proto__=new Gibberish.Saw,this.name="saw2";var e=this.__proto__.callback,t=Gibberish.makePanner(),i=[0,0];this.callback=function(s,r,n){var a=e(s,r);return i=t(a,n,i)},this.init(),Gibberish.defineUgenProperty("pan",0,this)},Gibberish.Triangle=function(){this.__proto__=new Gibberish.Wavetable,this.name="triangle";for(var e=new Float32Array(1024),t=Math.abs,i=1024;i--;)e[i]=1-4*t((i/1024+.25)%1-.5);this.setTable(e),this.init(arguments),this.oscillatorInit(),this.processProperties(arguments)},Gibberish.Triangle2=function(){this.__proto__=new Gibberish.Triangle,this.name="triangle2";var e=this.__proto__.callback,t=Gibberish.makePanner(),i=[0,0];this.callback=function(s,r,n){var a=e(s,r);return t(a,n,i)},this.init(),this.oscillatorInit(),Gibberish.defineUgenProperty("pan",0,this),this.processProperties(arguments)},Gibberish.Saw3=function(){var e=0,t=0,i=2.5,s=-1.5,r=0,n=Math.sin,a=11;pi_2=2*Math.PI,sr=Gibberish.context.sampleRate,Gibberish.extend(this,{name:"saw",properties:{frequency:440,amp:.15,sr:Gibberish.context.sampleRate},callback:function(o){var h=o/sr,u=.5-h,c=a*u*u*u*u,l=.376-.752*h,b=1-2*h,p=0;return t+=h,t-=t>1?2:0,e=.5*(e+n(pi_2*(t+e*c))),p=i*e+s*r,r=e,p+=l,p*b}}),Object.defineProperty(this,"scale",{get:function(){return a},set:function(e){a=e}}),this.init(),this.oscillatorInit(),this.processProperties(arguments)},Gibberish.Saw3.prototype=Gibberish._oscillator,Gibberish.PWM=function(){var e=0,t=0,i=0,s=0,r=0,n=2.5,a=-1.5,o=Math.sin,h=11;pi_2=2*Math.PI,test=0,sr=Gibberish.context.sampleRate,Gibberish.extend(this,{name:"pwm",properties:{frequency:440,amp:.15,pulsewidth:.05,sr:Gibberish.context.sampleRate},callback:function(u,c,l){var b=u/sr,p=.5-b,f=h*p*p*p*p,d=1-2*b,g=0;return r+=b,r-=r>1?2:0,e=.5*(e+o(pi_2*(r+e*f))),t=.5*(t+o(pi_2*(r+t*f+l))),g=t-e,g=n*g+a*(i-s),i=e,s=t,g*d*c}}),Object.defineProperty(this,"scale",{get:function(){return h},set:function(e){h=e}}),this.init(),this.oscillatorInit(),this.processProperties(arguments)},Gibberish.PWM.prototype=Gibberish._oscillator,Gibberish.Noise=function(){var e=Math.random;Gibberish.extend(this,{name:"noise",properties:{amp:1},callback:function(t){return(2*e()-1)*t}}),this.init(),this.oscillatorInit(),this.processProperties(arguments)},Gibberish.Noise.prototype=Gibberish._oscillator,Gibberish.KarplusStrong=function(){var e=[0],t=0,i=Math.random,s=Gibberish.makePanner(),r=Gibberish.context.sampleRate,n=[0,0];Gibberish.extend(this,{name:"karplus_strong",frequency:0,properties:{blend:1,damping:0,amp:1,channels:2,pan:0},note:function(t){var s=Math.floor(r/t);e.length=0;for(var n=0;s>n;n++)e[n]=2*i()-1;this.frequency=t},callback:function(r,a,o,h,u){var c=e.shift(),l=i()>r?-1:1;a=a>0?a:0;var b=l*(c+t)*(.5-a/100);return t=b,e.push(b),b*=o,1===h?b:s(b,u,n)}}).init().oscillatorInit().processProperties(arguments)},Gibberish.KarplusStrong.prototype=Gibberish._oscillator,Gibberish.PolyKarplusStrong=function(){this.__proto__=new Gibberish.Bus2,Gibberish.extend(this,{name:"poly_karplus_strong",maxVoices:5,voiceCount:0,polyProperties:{blend:1,damping:0},note:function(e,t){var i=this.children[this.voiceCount++];this.voiceCount>=this.maxVoices&&(this.voiceCount=0),i.note(e,t)}}),this.amp=1/this.maxVoices,Gibberish.polyInit(this),this.children=[],"object"==typeof arguments[0]&&(this.maxVoices=arguments[0].maxVoices?arguments[0].maxVoices:this.maxVoices);for(var e=0;e<this.maxVoices;e++){var t={blend:this.blend,damping:this.damping,channels:2,amp:1},i=new Gibberish.KarplusStrong(t).connect(this);this.children.push(i)}this.processProperties(arguments),this.initialized=!1,Gibberish._synth.oscillatorInit.call(this),Gibberish.dirty(this)},Gibberish.bus=function(){this.type="bus",this.inputCodegen=function(){var e=this.value.codegen(),t=1===this.amp?e:e+" * "+this.amp;return this.codeblock=t,t},this.addConnection=function(){var e={value:arguments[0],amp:arguments[1],codegen:this.inputCodegen};this.inputs.push(e),Gibberish.dirty(this)},this.removeConnection=function(e){for(var t=0;t<this.inputs.length;t++)if(this.inputs[t].value===e){this.inputs.splice(t,1),Gibberish.dirty(this);break}},this.adjustSendAmount=function(e,t){for(var i=0;i<this.inputs.length;i++)if(this.inputs[i].value===e){this.inputs[i].amp=t,Gibberish.dirty(this);break}},this.callback=function(){var e=arguments[arguments.length-2],t=arguments[arguments.length-1];output[0]=output[1]=0;for(var i=0;i<arguments.length-2;i++){var s="object"==typeof arguments[i];output[0]+=s?arguments[i][0]:arguments[i],output[1]+=s?arguments[i][1]:arguments[i]}return output[0]*=e,output[1]*=e,panner(output,t,output)}},Gibberish.bus.prototype=new Gibberish.ugen,Gibberish._bus=new Gibberish.bus,Gibberish.Bus=function(){return Gibberish.extend(this,{name:"bus",properties:{inputs:[],amp:1},callback:function(){for(var e=0,t=arguments.length-1,i=arguments[t],s=0;t>s;s++)e+=arguments[s];return e*=i}}),this.init(),this.processProperties(arguments),this},Gibberish.Bus.prototype=Gibberish._bus,Gibberish.Bus2=function(){this.name="bus2",this.type="bus",this.properties={inputs:[],amp:1,pan:0};var e=[0,0],t=Gibberish.makePanner();this.callback=function(){var i=arguments,s=i.length,r=i[s-2],n=i[s-1];e[0]=e[1]=0;for(var a=0,o=s-2;o>a;a++){var h="object"==typeof i[a];e[0]+=h?i[a][0]||0:i[a]||0,e[1]+=h?i[a][1]||0:i[a]||0}return e[0]*=r,e[1]*=r,t(e,n,e)},this.show=function(){console.log(e,args)},this.getOutput=function(){return e},this.getArgs=function(){return args},this.init(arguments),this.processProperties(arguments)},Gibberish.Bus2.prototype=Gibberish._bus,Gibberish.envelope=function(){this.type="envelope"},Gibberish.envelope.prototype=new Gibberish.ugen,Gibberish._envelope=new Gibberish.envelope,Gibberish.ExponentialDecay=function(){var e=Math.pow,t=0,i=0;Gibberish.extend(this,{name:"ExponentialDecay",properties:{decay:.5,length:11050},callback:function(s,r){return t=e(s,i),i+=1/r,t},trigger:function(){i="number"==typeof arguments[0]?arguments[0]:0}}).init()},Gibberish.ExponentialDecay.prototype=Gibberish._envelope,Gibberish.Line=function(e,t,i,s){var r={name:"line",properties:{start:e||0,end:isNaN(t)?1:t,time:i||Gibberish.context.sampleRate,loops:s||!1}},n=0,a=(t-e)/i;return this.callback=function(e,t,i,s){var r=i>n?e+n++*a:t;return n=r>=t&&s?0:n,r},Gibberish.extend(this,r),this.init(),this},Gibberish.Line.prototype=Gibberish._envelope,Gibberish.AD=function(e,t){var i=0,s=0;Gibberish.extend(this,{name:"AD",properties:{attack:e||1e4,decay:t||1e4},run:function(){return s=0,i=0,this},callback:function(e,t){if(e=0>e?22050:e,t=0>t?22050:t,0===s){var r=1/e;i+=r,i>=1&&s++}else if(1===s){var r=1/t;i-=r,0>=i&&(i=0,s++)}return i},getState:function(){return s}}).init().processProperties(arguments)},Gibberish.AD.prototype=Gibberish._envelope,Gibberish.ADSR=function(e,t,i,s,r,n,a){var o={name:"adsr",type:"envelope",requireReleaseTrigger:"undefined"!=typeof a?a:!1,properties:{attack:isNaN(e)?1e4:e,decay:isNaN(t)?1e4:t,sustain:isNaN(i)?22050:i,release:isNaN(s)?1e4:s,attackLevel:r||1,sustainLevel:n||.5,releaseTrigger:0},run:function(){this.setPhase(0),this.setState(0)},stop:function(){this.releaseTrigger=1}};Gibberish.extend(this,o);var h=0,u=0,c=0,l=this;return this.callback=function(e,t,i,s,r,n,a){var o=0;return c=1===c?1:a,0===u?(o=h/e*r,++h/e===1&&(u++,h=t)):1===u?(o=h/t*(r-n)+n,--h<=0&&(null!==i?(u+=1,h=i):(u+=2,h=s))):2===u?(o=n,l.requireReleaseTrigger&&c?(u++,h=s,l.releaseTrigger=0,c=0):0!==h--||l.requireReleaseTrigger||(u++,h=s)):3===u&&(h--,o=h/s*n,0>=h&&u++),o},this.call=function(){return this.callback(this.attack,this.decay,this.sustain,this.release,this.attackLevel,this.sustainLevel,this.releaseTrigger)},this.setPhase=function(e){h=e},this.setState=function(e){u=e,h=0},this.getState=function(){return u},this.init(),this},Gibberish.ADSR.prototype=Gibberish._envelope,Gibberish.ADR=function(e,t,i,s,r){var n={name:"adr",type:"envelope",properties:{attack:isNaN(e)?11025:e,decay:isNaN(t)?11025:t,release:isNaN(i)?22050:i,attackLevel:s||1,releaseLevel:r||.2},run:function(){this.setPhase(0),this.setState(0)}};Gibberish.extend(this,n);var a=0,o=0;return this.callback=function(e,t,i,s,r){var n=0;return 0===o?(n=a/e*s,++a/e===1&&(o++,a=t)):1===o?(n=a/t*(s-r)+r,--a<=0&&(o+=1,a=i)):2===o&&(a--,n=a/i*r,0>=a&&o++),n},this.setPhase=function(e){a=e},this.setState=function(e){o=e,a=0},this.getState=function(){return o},this.init(),this},Gibberish.ADR.prototype=Gibberish._envelope,Gibberish.analysis=function(){this.type="analysis",this.codegen=function(){if(Gibberish.memo[this.symbol])return Gibberish.memo[this.symbol];var e=this.variable?this.variable:Gibberish.generateSymbol("v");return Gibberish.memo[this.symbol]=e,this.variable=e,Gibberish.callbackArgs.push(this.symbol),Gibberish.callbackObjects.push(this.callback),this.codeblock="var "+this.variable+" = "+this.symbol+"();\n",-1===Gibberish.codeblock.indexOf(this.codeblock)&&Gibberish.codeblock.push(this.codeblock),this.variable},this.analysisCodegen=function(){var e=0;this.input.codegen?(e=this.input.codegen(),e.indexOf("op")>-1&&console.log("ANALYSIS BUG")):e=this.input.value?"undefined"!=typeof this.input.value.codegen?this.input.value.codegen():this.input.value:"null";var t=this.analysisSymbol+"("+e+",";for(var i in this.properties)"input"!==i&&(t+=this[i]+",");return t=t.slice(0,-1),t+=");",this.analysisCodeblock=t,-1===Gibberish.analysisCodeblock.indexOf(this.analysisCodeblock)&&Gibberish.analysisCodeblock.push(this.analysisCodeblock),-1===Gibberish.callbackObjects.indexOf(this.analysisCallback)&&Gibberish.callbackObjects.push(this.analysisCallback),t},this.remove=function(){Gibberish.analysisUgens.splice(Gibberish.analysisUgens.indexOf(this),1)},this.analysisInit=function(){this.analysisSymbol=Gibberish.generateSymbol(this.name),Gibberish.analysisUgens.push(this),Gibberish.dirty()}},Gibberish.analysis.prototype=new Gibberish.ugen,Gibberish._analysis=new Gibberish.analysis,Gibberish.Follow=function(){this.name="follow",this.properties={input:0,bufferSize:4410,mult:1};var e=Math.abs,t=[0],i=0,s=0,r=0;this.analysisCallback=function(n,a,o){"object"==typeof n&&(n=n[0]+n[1]),i+=e(n),i-=t[s],t[s]=e(n),s=(s+1)%a,t[s]=t[s]?t[s]:0,r=i/a*o},this.callback=this.getValue=function(){return r},this.init(),this.analysisInit(),this.processProperties(arguments)},Gibberish.Follow.prototype=Gibberish._analysis,Gibberish.SingleSampleDelay=function(){this.name="single_sample_delay",this.properties={input:arguments[0]||0,amp:arguments[1]||1};var e=0;this.analysisCallback=function(t){e=t},this.callback=function(){return e},this.getValue=function(){return e},this.init(),this.analysisInit(),this.processProperties(arguments)},Gibberish.SingleSampleDelay.prototype=Gibberish._analysis,Gibberish.Record=function(e,t,i){var s=new Float32Array(t),r=0,n=!1,a=this;Gibberish.extend(this,{name:"record",oncomplete:i,properties:{input:0,size:t||0},analysisCallback:function(e,t){n&&(s[r++]="object"==typeof e?e[0]+e[1]:e,r>=t&&(n=!1,a.remove()))},record:function(){return r=0,n=!0,this},getBuffer:function(){return s},getPhase:function(){return r},remove:function(){"undefined"!=typeof this.oncomplete&&this.oncomplete();for(var e=0;e<Gibberish.analysisUgens.length;e++){var t=Gibberish.analysisUgens[e];if(t===this)return Gibberish.callbackArgs.indexOf(this.analysisSymbol)>-1&&Gibberish.callbackArgs.splice(Gibberish.callbackArgs.indexOf(this.analysisSymbol),1),Gibberish.callbackObjects.indexOf(this.analysisCallback)>-1&&Gibberish.callbackObjects.splice(Gibberish.callbackObjects.indexOf(this.analysisCallback),1),Gibberish.analysisUgens.splice(e,1),void 0}}}),this.properties.input=e,this.init(),this.analysisInit(),Gibberish.dirty()},Gibberish.Record.prototype=Gibberish._analysis,Gibberish.effect=function(){this.type="effect"},Gibberish.effect.prototype=new Gibberish.ugen,Gibberish._effect=new Gibberish.effect,Gibberish.Distortion=function(){var e=Math.abs,t=Math.log,i=Math.LN2;Gibberish.extend(this,{name:"distortion",properties:{input:0,amount:50},callback:function(s,r){var n;return r=r>2?r:2,"number"==typeof s?(n=s*r,s=n/(1+e(n))/(t(r)/i)):(n=s[0]*r,s[0]=n/(1+e(n))/(t(r)/i),n=s[1]*r,s[1]=n/(1+e(n))/(t(r)/i)),s}}).init().processProperties(arguments)},Gibberish.Distortion.prototype=Gibberish._effect,Gibberish.Delay=function(){var e=[],t=0;e.push(new Float32Array(2*Gibberish.context.sampleRate)),e.push(new Float32Array(2*Gibberish.context.sampleRate)),Gibberish.extend(this,{name:"delay",properties:{input:0,time:22050,feedback:.5,wet:1,dry:1},callback:function(i,s,r,n,a){var o="number"==typeof i?1:2,h=t++%88200,u=(h+(0|s))%88200;return 1===o?(e[0][u]=(i+e[0][h])*r,i=i*a+e[0][h]*n):(e[0][u]=(i[0]+e[0][h])*r,i[0]=i[0]*a+e[0][h]*n,e[1][u]=(i[1]+e[1][h])*r,i[1]=i[1]*a+e[1][h]*n),i}});var i=Math.round(this.properties.time);Object.defineProperty(this,"time",{configurable:!0,get:function(){return i},set:function(e){i=Math.round(e),Gibberish.dirty(this)}}),this.init(),this.processProperties(arguments)},Gibberish.Delay.prototype=Gibberish._effect,Gibberish.Decimator=function(){var e=0,t=[],i=Math.pow,s=Math.floor;Gibberish.extend(this,{name:"decimator",properties:{input:0,bitDepth:16,sampleRate:1},callback:function(r,n,a){e+=a;var o="number"==typeof r?1:2;if(1===o){if(e>=1){var h=i(n,2);t[0]=s(r*h)/h,e-=1}r=t[0]}else{if(e>=1){var h=i(n,2);t[0]=s(r[0]*h)/h,t[1]=s(r[1]*h)/h,e-=1}r=t}return r}}).init().processProperties(arguments)},Gibberish.Decimator.prototype=Gibberish._effect,Gibberish.RingModulation=function(){var e=(new Gibberish.Sine).callback,t=[0,0];Gibberish.extend(this,{name:"ringmod",properties:{input:0,frequency:440,amp:.5,mix:.5},callback:function(i,s,r,n){var a="number"==typeof i?1:2,o=1===a?i:i[0],h=e(s,r);if(o=o*(1-n)+o*h*n,2===a){var u=i[1];return u=u*(1-n)+u*h*n,t[0]=o,t[1]=u,t}return o}}).init().processProperties(arguments)},Gibberish.RingModulation.prototype=Gibberish._effect,Gibberish.DCBlock=function(){var e=0,t=0;
Gibberish.extend(this,{name:"dcblock",type:"effect",properties:{input:0},reset:function(){e=0,t=0},callback:function(i){var s=i-e+.9997*t;return e=i,t=s,s}}).init().processProperties(arguments)},Gibberish.DCBlock.prototype=Gibberish._effect,Gibberish.Tremolo=function(){var e=(new Gibberish.Sine).callback;Gibberish.extend(this,{name:"tremolo",type:"effect",properties:{input:0,frequency:2.5,amp:.5},callback:function(t,i,s){var r="number"==typeof t?1:2,n=e(i,s);return 1===r?t*=n:(t[0]*=n,t[1]*=n),t}}).init().processProperties(arguments)},Gibberish.Tremolo.prototype=Gibberish._effect,Gibberish.OnePole=function(){var e=0;Gibberish.extend(this,{name:"onepole",type:"effect",properties:{input:0,a0:.15,b1:.85},callback:function(t,i,s){var r=t*i+e*s;return e=r,r},smooth:function(t,i){this.input=i[t],e=this.input,i[t]=this,this.obj=i,this.property=t,this.oldSetter=i.__lookupSetter__(t),this.oldGetter=i.__lookupGetter__(t);var s=this;Object.defineProperty(i,t,{get:function(){return s.input},set:function(e){s.input=e}})},remove:function(){Object.defineProperty(this.obj,this.property,{get:this.oldGetter,set:this.oldSetter}),this.obj[this.property]=this.input}}).init().processProperties(arguments)},Gibberish.OnePole.prototype=Gibberish._effect,Gibberish.Filter24=function(){var e=[0,0,0,0],t=[0,0,0,0],i=[0,0],s=isNaN(arguments[0])?.1:arguments[0],r=isNaN(arguments[1])?3:arguments[1];_isLowPass="undefined"!=typeof arguments[2]?arguments[2]:!0,Gibberish.extend(this,{name:"filter24",properties:{input:0,cutoff:s,resonance:r,isLowPass:_isLowPass},callback:function(s,r,n,a){var o="number"==typeof s?1:2,h=1===o?s:s[0],u=e[3]*n;if(u=u>1?1:u,r=0>r?0:r,r=r>1?1:r,h-=u,e[0]=e[0]+(-e[0]+h)*r,e[1]=e[1]+(-e[1]+e[0])*r,e[2]=e[2]+(-e[2]+e[1])*r,e[3]=e[3]+(-e[3]+e[2])*r,h=a?e[3]:h-e[3],2===o){var c=s[1];return u=t[3]*n,u=u>1?1:u,c-=u,t[0]=t[0]+(-t[0]+c)*r,t[1]=t[1]+(-t[1]+t[0])*r,t[2]=t[2]+(-t[2]+t[1])*r,t[3]=t[3]+(-t[3]+t[2])*r,c=a?t[3]:c-t[3],i[0]=h,i[1]=c,i}return h}}).init().processProperties(arguments)},Gibberish.Filter24.prototype=Gibberish._effect,Gibberish.SVF=function(){var e=[0,0],t=[0,0],i=Math.PI,s=[0,0];Gibberish.extend(this,{name:"SVF",properties:{input:0,cutoff:440,Q:2,mode:0,sr:Gibberish.context.sampleRate},callback:function(r,n,a,o,h){var u="number"==typeof r?1:2,c=1===u?r:r[0],l=2*i*n/h;a=1/a;var b=t[0]+l*e[0],p=c-b-a*e[0],f=l*p+e[0],d=p+b;if(e[0]=f,t[0]=b,c=0===o?b:1===o?p:2===o?f:d,2===u){var g=r[1],b=t[1]+l*e[1],p=g-b-a*e[1],f=l*p+e[1],d=p+b;e[1]=f,t[1]=b,g=0===o?b:1===o?p:2===o?f:d,s[0]=c,s[1]=g}else s=c;return s}}).init().processProperties(arguments)},Gibberish.SVF.prototype=Gibberish._effect,Gibberish.Biquad=function(){var e=x2=y1=y2=0,t=[0,0],i=.001639,s=.003278,r=.001639,n=-1.955777,a=.960601,o="LP",h=2e3,u=.5,c=Gibberish.context.sampleRate;Gibberish.extend(this,{name:"biquad",properties:{input:null},calculateCoefficients:function(){switch(o){case"LP":var e=2*Math.PI*h/c,t=Math.sin(e),l=Math.cos(e),b=t/(2*u);i=(1-l)/2,s=1-l,r=i,a0=1+b,n=-2*l,a=1-b;break;case"HP":var e=2*Math.PI*h/c,t=Math.sin(e),l=Math.cos(e),b=t/(2*u);i=(1+l)/2,s=-(1+l),r=i,a0=1+b,n=-2*l,a=1-b;break;case"BP":var e=2*Math.PI*h/c,t=Math.sin(e),l=Math.cos(e),p=Math.log(2)/2*u*e/t,b=t*(Math.exp(p)-Math.exp(-p))/2;i=b,s=0,r=-b,a0=1+b,n=-2*l,a=1-b;break;default:return}i/=a0,s/=a0,r/=a0,n/=a0,a/=a0},callback:function(o){var h="number"==typeof o?1:2,u=0,c=0,l=1===h?o:o[0];return u=i*l+s*e+r*x2-n*y1-a*y2,x2=e,e=o,y2=y1,y1=u,2===h&&(inR=o[1],c=i*inR+s*e[1]+r*x2[1]-n*y1[1]-a*y2[1],x2[1]=e[1],e[1]=o[1],y2[1]=y1[1],y1[1]=c,t[0]=u,t[1]=c),1===h?u:t}}).init(),Object.defineProperties(this,{mode:{get:function(){return o},set:function(e){o=e,this.calculateCoefficients()}},cutoff:{get:function(){return h},set:function(e){h=e,this.calculateCoefficients()}},Q:{get:function(){return u},set:function(e){u=e,this.calculateCoefficients()}}}),this.processProperties(arguments),this.calculateCoefficients()},Gibberish.Biquad.prototype=Gibberish._effect,Gibberish.Flanger=function(){var e=[new Float32Array(88200),new Float32Array(88200)],t=88200,i=(new Gibberish.Sine).callback,s=Gibberish.interpolate,r=-100,n=0;Gibberish.extend(this,{name:"flanger",properties:{input:0,rate:.25,feedback:0,amount:125,offset:125},callback:function(a,o,h,u){var c="number"==typeof a?1:2,l=r+i(o,.95*u);l>t?l-=t:0>l&&(l+=t);var b=s(e[0],l);return e[0][n]=1===c?a+b*h:a[0]+b*h,2===c?(a[0]+=b,b=s(e[1],l),e[1][n]=a[1]+b*h,a[1]+=b):a+=b,++n>=t&&(n=0),++r>=t&&(r=0),a}}).init().processProperties(arguments),r=-1*this.offset},Gibberish.Flanger.prototype=Gibberish._effect,Gibberish.Vibrato=function(){var e=[new Float32Array(88200),new Float32Array(88200)],t=88200,i=(new Gibberish.Sine).callback,s=Gibberish.interpolate,r=-100,n=0;Gibberish.extend(this,{name:"vibrato",properties:{input:0,rate:5,amount:.5,offset:125},callback:function(a,o,h,u){var c="number"==typeof a?1:2,l=r+i(o,h*u-1);l>t?l-=t:0>l&&(l+=t);var b=s(e[0],l);return e[0][n]=1===c?a:a[0],2===c?(a[0]=b,b=s(e[1],l),e[1][n]=a[1],a[1]=b):a=b,++n>=t&&(n=0),++r>=t&&(r=0),a}}).init().processProperties(arguments),r=-1*this.offset},Gibberish.Vibrato.prototype=Gibberish._effect,Gibberish.BufferShuffler=function(){var e=[new Float32Array(88200),new Float32Array(88200)],t=88200,i=0,s=0,r=0,n=0,a=0,o=Math.random,h=1,u=!1,c=!1,l=!1,b=Gibberish.interpolate,p=!1,f=1,d=!1,g=Gibberish.rndf,m=[0,0];Gibberish.extend(this,{name:"buffer_shuffler",properties:{input:0,chance:.25,rate:11025,length:22050,reverseChange:.5,pitchChance:.5,pitchMin:.25,pitchMax:2,wet:1,dry:0},callback:function(y,G,v,k,x,_,w,A,S,P){var R="number"==typeof y?1:2;a?++n%(k-400)===0&&(u=!1,c=!0,h=1,n=0):(e[0][s]=1===R?y:y[0],e[1][s]=1===R?y:y[1],s++,s%=t,d=0===s?1:d,r++,r%v==0&&o()<G&&(l=o()<x,a=!0,l||(i=s-k,0>i&&(i=t+i)),p=o()<_,p&&(f=g(w,A)),h=1,u=!0,c=!1)),i+=l?-1*f:f,0>i?i+=t:i>=t&&(i-=t);var q,C,M,T,I=b(e[0],i);return u?(h-=.0025,M=I*(1-h),q=1===R?M+y*h:M+y[0]*h,2===R&&(T=b(e[1],i),M=T*(1-h),C=1===R?q:M+y[1]*h),.0025>=h&&(u=!1)):c?(h-=.0025,M=I*h,q=1===R?M+y*h:M+y[0]*(1-h),2===R&&(T=b(e[1],i),M=T*h,C=M+y[1]*(1-h)),.0025>=h&&(c=!1,a=!1,l=!1,f=1,p=0)):1===R?q=a&&d?I*S+y*P:y:(T=b(e[1],i),q=a&&d?I*S+y[0]*P:y[0],C=a&&d?T*S+y[1]*P:y[1]),m=[q,C],1===R?q:m}}).init().processProperties(arguments)},Gibberish.BufferShuffler.prototype=Gibberish._effect,Gibberish.AllPass=function(e){var t=-1,i=new Float32Array(e||500),s=i.length;Gibberish.extend(this,{name:"allpass",properties:{input:0},callback:function(e){t=++t%s;var r=i[t],n=-1*e+r;return i[t]=e+.5*r,n}})},Gibberish.Comb=function(e){var t=new Float32Array(e||1200),i=t.length,s=0,r=0;Gibberish.extend(this,{name:"comb",properties:{input:0,feedback:.84,damping:.2},callback:function(e,n,a){var o=++s%i,h=t[o];return r=h*(1-a)+r*a,t[o]=e+r*n,h}})},Gibberish.Reverb=function(){var e={combCount:8,combTuning:[1116,1188,1277,1356,1422,1491,1557,1617],allPassCount:4,allPassTuning:[556,441,341,225],allPassFeedback:.5,fixedGain:.015,scaleDamping:.4,scaleRoom:.28,offsetRoom:.7,stereoSpread:23},t=.84,i=[],s=[],r=[0,0];Gibberish.extend(this,{name:"reverb",roomSize:.5,properties:{input:0,wet:.5,dry:.55,roomSize:.84,damping:.5},callback:function(e,t,n,a,o){for(var h="object"==typeof e?2:1,u=1===h?e:e[0]+e[1],c=.015*u,l=c,b=0;8>b;b++){var p=i[b](c,.98*a,.4*o);l+=p}for(var b=0;4>b;b++)l=s[b](l);return r[0]=r[1]=u*n+l*t,r}}).init().processProperties(arguments),this.setFeedback=function(e){t=e};for(var n=0;8>n;n++)i.push(new Gibberish.Comb(e.combTuning[n]).callback);for(var n=0;4>n;n++)s.push(new Gibberish.AllPass(e.allPassTuning[n],e.allPassFeedback).callback)},Gibberish.Reverb.prototype=Gibberish._effect,Gibberish.Granulator=function(e){var t=[];buffer=null,interpolate=Gibberish.interpolate,panner=Gibberish.makePanner(),bufferLength=0,debug=0,write=0,self=this,out=[0,0],_out=[0,0],rndf=Gibberish.rndf,numberOfGrains=e.numberOfGrains||20,Gibberish.extend(this,{name:"granulator",bufferLength:88200,reverse:!0,spread:.5,properties:{speed:1,speedMin:-0,speedMax:0,grainSize:1e3,position:.5,positionMin:0,positionMax:0,amp:.2,fade:.1,pan:0,shouldWrite:!1},setBuffer:function(e){buffer=e,bufferLength=e.length},callback:function(e,i,s,r,n,a,o,h,u,c){for(var l=0;numberOfGrains>l;l++){var b=t[l];if(b._speed>0){b.pos>b.end&&(b.pos=(o+rndf(n,a))*buffer.length,b.start=b.pos,b.end=b.start+r,b._speed=e+rndf(i,s),b._speed=b._speed<.1?.1:b._speed,b._speed=b._speed<.1&&b._speed>0?.1:b._speed,b._speed=b._speed>-.1&&b._speed<0?-.1:b._speed,b.fadeAmount=b._speed*u*r,b.pan=rndf(-1*self.spread,self.spread));for(var p=b.pos;p>buffer.length;)p-=buffer.length;for(;0>p;)p+=buffer.length;var f=interpolate(buffer,p);f*=b.pos<b.fadeAmount+b.start?(b.pos-b.start)/b.fadeAmount:1,f*=b.pos>b.end-b.fadeAmount?(b.end-b.pos)/b.fadeAmount:1}else{b.pos<b.end&&(b.pos=(o+rndf(n,a))*buffer.length,b.start=b.pos,b.end=b.start-r,b._speed=e+rndf(i,s),b._speed=b._speed<.1&&b._speed>0?.1:b._speed,b._speed=b._speed>-.1&&b._speed<0?-.1:b._speed,b.fadeAmount=b._speed*u*r);for(var p=b.pos;p>buffer.length;)p-=buffer.length;for(;0>p;)p+=buffer.length;var f=interpolate(buffer,p);f*=b.pos>b.start-b.fadeAmount?(b.start-b.pos)/b.fadeAmount:1,f*=b.pos<b.end+b.fadeAmount?(b.end-b.pos)/b.fadeAmount:1}_out=panner(f*h,b.pan,_out),out[0]+=_out[0],out[1]+=_out[1],b.pos+=b._speed}return panner(out,c,out)}}).init().processProperties(arguments);for(var i=0;numberOfGrains>i;i++)t[i]={pos:self.position+Gibberish.rndf(self.positionMin,self.positionMax),_speed:self.speed+Gibberish.rndf(self.speedMin,self.speedMax)},t[i].start=t[i].pos,t[i].end=t[i].pos+self.grainSize,t[i].fadeAmount=t[i]._speed*self.fade*self.grainSize,t[i].pan=Gibberish.rndf(-1*self.spread,self.spread);"undefined"!=typeof e.buffer&&(buffer=e.buffer,bufferLength=buffer.length)},Gibberish.Granulator.prototype=Gibberish._effect,Gibberish.synth=function(){this.type="oscillator",this.oscillatorInit=function(){this.fx=new Array2,this.fx.parent=this}},Gibberish.synth.prototype=new Gibberish.ugen,Gibberish._synth=new Gibberish.synth,Gibberish.Synth=function(e){this.name="synth",this.properties={frequency:0,pulsewidth:.5,attack:22050,decay:22050,sustain:22050,release:22050,attackLevel:1,sustainLevel:.5,releaseTrigger:0,glide:.15,amp:.25,channels:2,pan:0,sr:Gibberish.context.sampleRate},this.note=function(e,s){if(0!==s){if("object"!=typeof this.frequency){if(t&&e===c)return this.releaseTrigger=1,void 0;this.frequency=c=e,this.releaseTrigger=0}else this.frequency[0]=c=e,this.releaseTrigger=0,Gibberish.dirty(this);"undefined"!=typeof s&&(this.amp=s),i.run()}else this.releaseTrigger=1},e=e||{};var t="undefined"==typeof e.useADSR?!1:e.useADSR,i=t?new Gibberish.ADSR:new Gibberish.AD,s=i.getState,r=i.callback,n=new Gibberish.PWM,a=n.callback,o=(new Gibberish.OnePole).callback,h=Gibberish.makePanner(),u=this,c=0,l=[0,0];i.requireReleaseTrigger=e.requireReleaseTrigger||!1,this.callback=function(e,i,n,c,b,p,f,d,g,m,y,G,v,k){m=m>=1?.99999:m,e=o(e,1-m,m);var x,_;return t?(x=r(n,c,b,p,f,d,g),g&&(u.releaseTrigger=0),s()<4?(_=a(e,1,i,k)*x*y,1===G?_:h(_,v,l)):(_=l[0]=l[1]=0,1===G?_:l)):s()<2?(x=r(n,c),_=a(e,1,i,k)*x*y,1===G?_:h(_,v,l)):(_=l[0]=l[1]=0,1===G?_:l)},this.getEnv=function(){return i},this.getOsc=function(){return n},this.setOsc=function(e){n=e,a=n.callback};var b="PWM";Object.defineProperty(this,"waveform",{get:function(){return b},set:function(e){this.setOsc(new Gibberish[e])}}),this.init(),this.oscillatorInit(),this.processProperties(arguments)},Gibberish.Synth.prototype=Gibberish._synth,Gibberish.PolySynth=function(){this.__proto__=new Gibberish.Bus2,Gibberish.extend(this,{name:"polysynth",maxVoices:5,voiceCount:0,frequencies:[],polyProperties:{frequency:0,glide:0,attack:22050,decay:22050,pulsewidth:.5,waveform:"PWM"},note:function(e,t){var i=this.frequencies.indexOf(e),s=i>-1?i:this.voiceCount++,r=this.children[s];r.note(e,t),this.frequencies[s]=e,this.voiceCount>=this.maxVoices&&(this.voiceCount=0)}}),this.amp=1/this.maxVoices,Gibberish.polyInit(this),this.children=[],"object"==typeof arguments[0]&&(this.maxVoices=arguments[0].maxVoices?arguments[0].maxVoices:this.maxVoices,this.useADSR="undefined"!=typeof arguments[0].useADSR?arguments[0].useADSR:!1,this.requireReleaseTrigger="undefined"!=typeof arguments[0].requireReleaseTrigger?arguments[0].requireReleaseTrigger:!1),this.dirty=!0;for(var e=0;e<this.maxVoices;e++){var t={waveform:this.waveform,attack:this.attack,decay:this.decay,pulsewidth:this.pulsewidth,channels:2,amp:1,useADSR:this.useADSR||!1,requireReleaseTrigger:this.requireReleaseTrigger||!1},i=new Gibberish.Synth(t).connect(this);this.children.push(i)}this.processProperties(arguments),Gibberish._synth.oscillatorInit.call(this)},Gibberish.Synth2=function(e){this.name="synth2",this.properties={frequency:0,pulsewidth:.5,attack:22050,decay:22050,sustain:22050,release:22050,attackLevel:1,sustainLevel:.5,releaseTrigger:0,cutoff:.25,resonance:3.5,useLowPassFilter:!0,glide:.15,amp:.25,channels:1,pan:0,sr:Gibberish.context.sampleRate},this.note=function(e,s){if(0!==s){if("object"!=typeof this.frequency){if(t&&e===l)return this.releaseTrigger=1,void 0;this.frequency=l=e,this.releaseTrigger=0}else this.frequency[0]=l=e,this.releaseTrigger=0,Gibberish.dirty(this);"undefined"!=typeof s&&(this.amp=s),i.run()}else this.releaseTrigger=1},e=e||{};var t="undefined"==typeof e.useADSR?!1:e.useADSR,i=t?new Gibberish.ADSR:new Gibberish.AD,s=i.getState,r=i.callback,n=new Gibberish.PWM,a=n.callback,o=new Gibberish.Filter24,h=o.callback,u=(new Gibberish.OnePole).callback,c=Gibberish.makePanner(),l=0,b=this,p=[0,0];i.requireReleaseTrigger=e.requireReleaseTrigger||!1,this.callback=function(e,i,n,o,l,f,d,g,m,y,G,v,k,x,_,w,A){k=k>=1?.99999:k,e=u(e,1-k,k);var S,P;return t?(S=r(n,o,l,f,d,g,m),m&&(b.releaseTrigger=0),s()<4?(P=h(a(e,.15,i,A),y*S,G,v)*S*x,1===_?P:c(P,w,p)):(P=p[0]=p[1]=0,1===_?P:p)):s()<2?(S=r(n,o),P=h(a(e,.15,i,A),y*S,G,v)*S*x,1===_?P:c(P,w,p)):(P=p[0]=p[1]=0,1===_?P:p)},this.getUseADSR=function(){return t},this.getEnv=function(){return i},this.getOsc=function(){return n},this.setOsc=function(e){n=e,a=n.callback};var f="PWM";Object.defineProperty(this,"waveform",{get:function(){return f},set:function(e){this.setOsc(new Gibberish[e])}}),this.init(),this.oscillatorInit(),this.processProperties(arguments)},Gibberish.Synth2.prototype=Gibberish._synth,Gibberish.PolySynth2=function(){this.__proto__=new Gibberish.Bus2,Gibberish.extend(this,{name:"polysynth2",maxVoices:5,voiceCount:0,frequencies:[],polyProperties:{frequency:0,glide:0,attack:22050,decay:22050,pulsewidth:.5,resonance:3.5,cutoff:.25,useLowPassFilter:!0,waveform:"PWM"},note:function(e,t){var i=this.frequencies.indexOf(e),s=i>-1?i:this.voiceCount++,r=this.children[s];r.note(e,t),this.frequencies[s]=e,this.voiceCount>=this.maxVoices&&(this.voiceCount=0)}}),this.amp=1/this.maxVoices,Gibberish.polyInit(this),this.children=[],"object"==typeof arguments[0]&&(this.maxVoices=arguments[0].maxVoices?arguments[0].maxVoices:this.maxVoices,this.useADSR="undefined"!=typeof arguments[0].useADSR?arguments[0].useADSR:!1,this.requireReleaseTrigger="undefined"!=typeof arguments[0].requireReleaseTrigger?arguments[0].requireReleaseTrigger:!1),this.dirty=!0;for(var e=0;e<this.maxVoices;e++){var t={attack:this.attack,decay:this.decay,pulsewidth:this.pulsewidth,channels:2,amp:1,useADSR:this.useADSR||!1,requireReleaseTrigger:this.requireReleaseTrigger||!1},i=new Gibberish.Synth2(t);i.connect(this),this.children.push(i)}this.processProperties(arguments),Gibberish._synth.oscillatorInit.call(this)},Gibberish.FMSynth=function(e){this.name="fmSynth",this.properties={frequency:0,cmRatio:2,index:5,attack:22050,decay:22050,sustain:22050,release:22050,attackLevel:1,sustainLevel:.5,releaseTrigger:0,glide:.15,amp:.25,channels:2,pan:0},this.note=function(e,s){if(0!==s){if("object"!=typeof this.frequency){if(t&&e===l)return this.releaseTrigger=1,void 0;this.frequency=l=e,this.releaseTrigger=0}else this.frequency[0]=l=e,this.releaseTrigger=0,Gibberish.dirty(this);"undefined"!=typeof s&&(this.amp=s),i.run()}else this.releaseTrigger=1},e=e||{};var t="undefined"==typeof e.useADSR?!1:e.useADSR,i=t?new Gibberish.ADSR:new Gibberish.AD,s=i.getState,r=i.callback,n=(new Gibberish.Sine).callback,a=(new Gibberish.Sine).callback,o=(new Gibberish.OnePole).callback,h=Gibberish.makePanner(),u=[0,0],c=this,l=0;i.requireReleaseTrigger=e.requireReleaseTrigger||!1,this.callback=function(e,i,l,b,p,f,d,g,m,y,G,v,k,x){var _,w,A;return G>=1&&(G=.9999),e=o(e,1-G,G),t?(_=r(b,p,f,d,g,m,y),y&&(c.releaseTrigger=0),s()<4?(A=a(e*i,e*l)*_,w=n(e+A,1)*_*v,1===k?w:h(w,x,u)):(w=u[0]=u[1]=0,1===k?w:u)):s()<2?(_=r(b,p),A=a(e*i,e*l)*_,w=n(e+A,1)*_*v,u[0]=u[1]=w,1===k?w:h(w,x,u)):(w=u[0]=u[1]=0,1===k?w:h(w,x,u))},this.init(),this.oscillatorInit(),this.processProperties(arguments)},Gibberish.FMSynth.prototype=Gibberish._synth,Gibberish.PolyFM=function(){this.__proto__=new Gibberish.Bus2,Gibberish.extend(this,{name:"polyfm",maxVoices:5,voiceCount:0,children:[],frequencies:[],polyProperties:{glide:0,attack:22050,decay:22050,index:5,cmRatio:2},note:function(e,t){var i=this.frequencies.indexOf(e),s=i>-1?i:this.voiceCount++,r=this.children[s];r.note(e,t),this.frequencies[s]=e,this.voiceCount>=this.maxVoices&&(this.voiceCount=0)}}),this.amp=1/this.maxVoices,Gibberish.polyInit(this),this.children=[],"object"==typeof arguments[0]&&(this.maxVoices=arguments[0].maxVoices?arguments[0].maxVoices:this.maxVoices,this.useADSR="undefined"!=typeof arguments[0].useADSR?arguments[0].useADSR:!1,this.requireReleaseTrigger="undefined"!=typeof arguments[0].requireReleaseTrigger?arguments[0].requireReleaseTrigger:!1);for(var e=0;e<this.maxVoices;e++){var t={attack:this.attack,decay:this.decay,cmRatio:this.cmRatio,index:this.index,channels:2,useADSR:this.useADSR||!1,requireReleaseTrigger:this.requireReleaseTrigger||!1,amp:1},i=new Gibberish.FMSynth(t);i.connect(this),this.children.push(i)}this.processProperties(arguments),Gibberish._synth.oscillatorInit.call(this)},Gibberish.Sampler=function(){function e(e){Gibberish.context.decodeAudioData(e,function(e){n=e.getChannelData(0),o.length=t=o.end=a=n.length,o.isPlaying=!0,console.log("LOADED",o.file,a),Gibberish.audioFiles[o.file]=n,o.onload&&o.onload(),0!==o.playOnLoad&&o.note(o.playOnLoad),o.isLoaded=!0},function(e){console.log("Error decoding file",e)})}var t=1,i=Gibberish.interpolate,s=Gibberish.makePanner(),r=[0,0],n=null,a=1,o=this;if(Gibberish.extend(this,{name:"sampler",file:null,isLoaded:!1,playOnLoad:0,properties:{pitch:1,amp:1,isRecording:!1,isPlaying:!0,input:0,length:0,start:0,end:1,loops:0,pan:0},_onload:function(e){n=e.channels[0],a=e.length,o.end=a,o.length=t=a,o.isPlaying=!0,console.log("LOADED ",o.file,a),Gibberish.audioFiles[o.file]=n,o.onload&&o.onload(),0!==o.playOnLoad&&o.note(o.playOnLoad),o.isLoaded=!0},floatTo16BitPCM:function(e,t,i){for(var s=0;s<i.length-1;s++,t+=2){var r=Math.max(-1,Math.min(1,i[s]));e.setInt16(t,0>r?32768*r:32767*r,!0)}},encodeWAV:function(){function e(e,t,i){for(var s=0;s<i.length;s++)e.setUint8(t+s,i.charCodeAt(s))}var t=this.getBuffer(),i=new ArrayBuffer(44+2*t.length),s=new DataView(i),r=Gibberish.context.sampleRate;return e(s,0,"RIFF"),s.setUint32(4,32+2*t.length,!0),e(s,8,"WAVE"),e(s,12,"fmt "),s.setUint32(16,16,!0),s.setUint16(20,1,!0),s.setUint16(22,1,!0),s.setUint32(24,r,!0),s.setUint32(28,4*r,!0),s.setUint16(32,2,!0),s.setUint16(34,16,!0),e(s,36,"data"),s.setUint32(40,2*t.length,!0),this.floatTo16BitPCM(s,44,t),s},download:function(){var e=this.encodeWAV(),t=new Blob([e]),i=window.webkitURL.createObjectURL(t),s=window.document.createElement("a");s.href=i,s.download="output.wav";var r=document.createEvent("Event");r.initEvent("click",!0,!0),s.dispatchEvent(r)},note:function(e,i){switch(typeof e){case"number":this.pitch=e;break;case"function":this.pitch=e();break;case"object":this.pitch=e[0]}if("number"==typeof i&&(this.amp=i),null!==this.function){this.isPlaying=!0;var s;switch(typeof this.pitch){case"number":s=this.pitch;break;case"function":s=this.pitch();break;case"object":s=this.pitch[0],isNaN(s)&&(s=s())}t=s>0?this.start:this.end}},getBuffer:function(){return n},setBuffer:function(e){n=e},getPhase:function(){return t},setPhase:function(e){t=e},callback:function(e,a,o,h,u,c,l,b,p,f){var d=0;return t+=e,b>t&&t>0?(e>0?d=null!==n&&h?i(n,t):0:t>l?d=null!==n&&h?i(n,t):0:t=p?b:t,s(d*a,f,r)):(t=p&&e>0?l:t,t=p&&0>e?b:t,r[0]=r[1]=d,r)}}).init().oscillatorInit().processProperties(arguments),"undefined"!=typeof arguments[0]&&("string"==typeof arguments[0]?(this.file=arguments[0],this.pitch=0):"object"==typeof arguments[0]&&arguments[0].file&&(this.file=arguments[0].file)),"undefined"!=typeof Gibberish.audioFiles[this.file])n=Gibberish.audioFiles[this.file],this.end=this.bufferLength=n.length,t=this.bufferLength,Gibberish.dirty(this),this.onload&&this.onload();else if(null!==this.file){var e,h=new XMLHttpRequest;h.open("GET",this.file,!0),h.responseType="arraybuffer",h.onload=function(){e(this.response)},h.send()}else"undefined"!=typeof this.buffer&&(this.isLoaded=!0,n=this.buffer,this.end=this.bufferLength=n.length||88200,t=this.bufferLength,arguments[0]&&arguments[0].loops&&(this.loops=1),Gibberish.dirty(this),this.onload&&this.onload())},Gibberish.Sampler.prototype=Gibberish._oscillator,Gibberish.Sampler.prototype.record=function(e,t){this.isRecording=!0;var i=this;return this.recorder=new Gibberish.Record(e,t,function(){i.setBuffer(this.getBuffer()),i.end=bufferLength=i.getBuffer().length,i.setPhase(i.end),i.isRecording=!1}).record(),this},Gibberish.MonoSynth=function(){Gibberish.extend(this,{name:"monosynth",properties:{attack:1e4,decay:1e4,cutoff:.2,resonance:2.5,amp1:1,amp2:1,amp3:1,filterMult:.3,isLowPass:!0,pulsewidth:.5,amp:.6,detune2:.01,detune3:-.01,octave2:1,octave3:-1,glide:0,pan:0,frequency:0,channels:1},waveform:"Saw3",note:function(e,s){"undefined"!=typeof s&&0!==s&&(this.amp=s),0!==s&&("object"!=typeof this.frequency?this.frequency=e:(this.frequency[0]=e,Gibberish.dirty(this)),i()>0&&t.run())},_note:function(e,i){if("object"!=typeof this.frequency){if(useADSR&&e===lastFrequency&&0===i)return this.releaseTrigger=1,void 0;0!==i&&(this.frequency=lastFrequency=e),this.releaseTrigger=0}else 0!==i&&(this.frequency[0]=lastFrequency=e),this.releaseTrigger=0,Gibberish.dirty(this);"undefined"!=typeof i&&0!==i&&(this.amp=i),0!==i&&t.run()}});var e=this.waveform;Object.defineProperty(this,"waveform",{get:function(){return e},set:function(t){e!==t&&(e=t,n=(new Gibberish[t]).callback,a=(new Gibberish[t]).callback,o=(new Gibberish[t]).callback)}});var t=new Gibberish.AD(this.attack,this.decay),i=t.getState,s=t.callback,r=(new Gibberish.Filter24).callback,n=new Gibberish[this.waveform](this.frequency,this.amp1).callback,a=new Gibberish[this.waveform](this.frequency2,this.amp2).callback,o=new Gibberish[this.waveform](this.frequency3,this.amp3).callback,h=(new Gibberish.OnePole).callback,u=Gibberish.makePanner(),c=[0,0];this.callback=function(e,t,l,b,p,f,d,g,m,y,G,v,k,x,_,w,A,S,P){if(i()<2){w>=1&&(w=.9999),S=h(S,1-w,w);var R=S;if(x>0)for(var q=0;x>q;q++)R*=2;else if(0>x)for(var q=0;q>x;q--)R/=2;var C=S;if(_>0)for(var q=0;_>q;q++)C*=2;else if(0>_)for(var q=0;q>_;q--)C/=2;R+=v>0?(2*S-S)*v:(S-S/2)*v,C+=k>0?(2*S-S)*k:(S-S/2)*k;var M=n(S,p,y)+a(R,f,y)+o(C,d,y),T=s(e,t),I=r(M,l+g*T,b,m,1)*T;return I*=G,c[0]=c[1]=I,1===P?c:u(I,A,c)}return c[0]=c[1]=0,c},this.init(),this.oscillatorInit(),this.processProperties(arguments)},Gibberish.MonoSynth.prototype=Gibberish._synth,Gibberish.Binops={"export":function(e){Gibberish.export("Binops",e||window)},operator:function(){var e=new Gibberish.ugen,t=arguments[0],i=Array.prototype.slice.call(arguments,1);e.name="op",e.properties={};for(var s=0;s<i.length;s++)e.properties[s]=i[s];return e.init.apply(e,i),e.codegen=function(){var e,i="( ";e=Object.keys(this.properties);for(var s=0;s<e.length;s++){var r="object"==typeof this[s];i+=r?this[s].codegen():this[s],s<e.length-1&&(i+=" "+t+" ")}return i+=" )",this.codeblock=i,i},e},Add:function(){var e=Array.prototype.slice.call(arguments,0);return e.unshift("+"),Gibberish.Binops.operator.apply(null,e)},Sub:function(){var e=Array.prototype.slice.call(arguments,0);return e.unshift("-"),Gibberish.Binops.operator.apply(null,e)},Mul:function(){var e=Array.prototype.slice.call(arguments,0);return e.unshift("*"),Gibberish.Binops.operator.apply(null,e)},Div:function(){var e=Array.prototype.slice.call(arguments,0);return e.unshift("/"),Gibberish.Binops.operator.apply(null,e)},Mod:function(){var e=Array.prototype.slice.call(arguments,0);return e.unshift("%"),Gibberish.Binops.operator.apply(null,e)},Abs:function(){var e=Array.prototype.slice.call(arguments,0),t={name:"abs",properties:{},callback:Math.abs.bind(t)};return t.__proto__=new Gibberish.ugen,t.properties[0]=e[0],t.init(),t},Sqrt:function(){var e=(Array.prototype.slice.call(arguments,0),{name:"sqrt",properties:{},callback:Math.sqrt.bind(e)});return e.__proto__=new Gibberish.ugen,e.properties[i]=arguments[0],e.init(),e},Pow:function(){var e=Array.prototype.slice.call(arguments,0),t={name:"pow",properties:{},callback:Math.pow.bind(t)};t.__proto__=new Gibberish.ugen;for(var i=0;i<e.length;i++)t.properties[i]=e[i];return t.init(),console.log(t.callback),t},Clamp:function(){var e=Array.prototype.slice.call(arguments,0),t={name:"clamp",properties:{input:0,min:0,max:1},callback:function(e,t,i){return t>e?e=t:e>i&&(e=i),e}};return t.__proto__=new Gibberish.ugen,t.init(),t.processProperties(e),t},Merge:function(){var e=Array.prototype.slice.call(arguments,0),t={name:"merge",properties:{},callback:function(e){return e[0]+e[1]}};t.__proto__=new Gibberish.ugen;for(var i=0;i<e.length;i++)t.properties[i]=e[i];return t.init(),t},Map:function(e,t,i,s,r,n,a){var o=Math.pow,h=0,u=0,c={name:"map",properties:{input:e,outputMin:t,outputMax:i,inputMin:s,inputMax:r,curve:n||h,wrap:a||!1},callback:function(e,t,i,s,r,n,a){var h,c=i-t,l=r-s,b=(e-s)/l;return b>1?b=a?b%1:1:0>b&&(b=a?1+b%1:0),h=0===n?t+b*c:t+o(b,1.5)*c,u=h,h},getValue:function(){return u}};return c.__proto__=new Gibberish.ugen,c.init(),c}},Gibberish.Time={bpm:120,"export":function(e){Gibberish.export("Time",e||window)},ms:function(e){return e*Gibberish.context.sampleRate/1e3},seconds:function(e){return e*Gibberish.context.sampleRate},beats:function(e){return function(){var t=Gibberish.context.sampleRate/(Gibberish.Time.bpm/60);return t*e}}},Gibberish.Sequencer2=function(){var e=this,t=0;Gibberish.extend(this,{target:null,key:null,values:null,valuesIndex:0,durations:null,durationsIndex:0,nextTime:0,playOnce:!1,repeatCount:0,repeatTarget:null,isConnected:!0,keysAndValues:null,counts:{},properties:{rate:1,isRunning:!1,nextTime:0},offset:0,name:"seq",callback:function(i,s,r){if(s){if(t>=r){if(null!==e.values){if(e.target){var n=e.values[e.valuesIndex++];"function"==typeof n&&(n=n()),"function"==typeof e.target[e.key]?e.target[e.key](n):e.target[e.key]=n}else"function"==typeof e.values[e.valuesIndex]&&e.values[e.valuesIndex++]();e.valuesIndex>=e.values.length&&(e.valuesIndex=0)}else if(null!==e.keysAndValues)for(var a in e.keysAndValues){var o=e.counts[a]++,n=e.keysAndValues[a][o];"function"==typeof n&&(n=n()),"function"==typeof e.target[a]?e.target[a](n):e.target[a]=n,e.counts[a]>=e.keysAndValues[a].length&&(e.counts[a]=0)}else"function"==typeof e.target[e.key]&&e.target[e.key]();if(t-=r,Array.isArray(e.durations)){var h=e.durations[e.durationsIndex++];e.nextTime="function"==typeof h?h():h,e.durationsIndex>=e.durations.length&&(e.durationsIndex=0)}else{var h=e.durations;e.nextTime="function"==typeof h?h():h}return e.repeatTarget&&(e.repeatCount++,e.repeatCount===e.repeatTarget&&(e.isRunning=!1,e.repeatCount=0)),0}t+=i}return 0},start:function(e){return e||(t=0),this.isRunning=!0,this},stop:function(){return this.isRunning=!1,this},repeat:function(e){return this.repeatTarget=e,this},shuffle:function(){for(i in this.keysAndValues)this.shuffleArray(this.keysAndValues[i])},shuffleArray:function(e){for(var t,i,s=e.length;s;t=parseInt(Math.random()*s),i=e[--s],e[s]=e[t],e[t]=i);}}),this.init(arguments),this.processProperties(arguments);for(var i in this.keysAndValues)this.counts[i]=0;this.oscillatorInit(),t+=this.offset,this.connect()},Gibberish.Sequencer2.prototype=Gibberish._oscillator,Gibberish.Sequencer=function(){Gibberish.extend(this,{target:null,key:null,values:null,valuesIndex:0,durations:null,durationsIndex:0,nextTime:0,phase:0,isRunning:!1,playOnce:!1,repeatCount:0,repeatTarget:null,isConnected:!0,keysAndValues:null,counts:{},offset:0,name:"seq",tick:function(){if(this.isRunning){if(this.phase>=this.nextTime){if(null!==this.values){if(this.target){var e=this.values[this.valuesIndex++];if("function"==typeof e)try{e=e()}catch(t){console.error("ERROR: Can't execute function triggered by Sequencer:\n"+e.toString()),this.values.splice(this.valuesIndex-1,1),this.valuesIndex--}"function"==typeof this.target[this.key]?this.target[this.key](e):this.target[this.key]=e}else if("function"==typeof this.values[this.valuesIndex])try{this.values[this.valuesIndex++]()}catch(t){console.error("ERROR: Can't execute function triggered by Sequencer:\n"+this.values[this.valuesIndex-1].toString()),this.values.splice(this.valuesIndex-1,1),this.valuesIndex--}this.valuesIndex>=this.values.length&&(this.valuesIndex=0)}else if(null!==this.keysAndValues)for(var i in this.keysAndValues){var s="function"==typeof this.keysAndValues[i].pick?this.keysAndValues[i].pick():this.counts[i]++,e=this.keysAndValues[i][s];if("function"==typeof e)try{e=e()}catch(t){console.error("ERROR: Can't execute function triggered by Sequencer:\n"+e.toString()),this.keysAndValues[i].splice(s,1),"function"!=typeof this.keysAndValues[i].pick&&this.counts[i]--}"function"==typeof this.target[i]?this.target[i](e):this.target[i]=e,this.counts[i]>=this.keysAndValues[i].length&&(this.counts[i]=0)}else"function"==typeof this.target[this.key]&&this.target[this.key]();if(this.phase-=this.nextTime,Array.isArray(this.durations)){var r="function"==typeof this.durations.pick?this.durations[this.durations.pick()]:this.durations[this.durationsIndex++];this.nextTime="function"==typeof r?r():r,this.durationsIndex>=this.durations.length&&(this.durationsIndex=0)}else{var r=this.durations;this.nextTime="function"==typeof r?r():r}return this.repeatTarget&&(this.repeatCount++,this.repeatCount===this.repeatTarget&&(this.isRunning=!1,this.repeatCount=0)),void 0}this.phase++}},start:function(e){return e||(this.phase=this.offset),this.isRunning=!0,this},stop:function(){return this.isRunning=!1,this},repeat:function(e){return this.repeatTarget=e,this},shuffle:function(){for(e in this.keysAndValues)this.shuffleArray(this.keysAndValues[e])},shuffleArray:function(e){for(var t,i,s=e.length;s;t=parseInt(Math.random()*s),i=e[--s],e[s]=e[t],e[t]=i);},disconnect:function(){var e=Gibberish.sequencers.indexOf(this);Gibberish.sequencers.splice(e,1),this.isConnected=!1},connect:function(){return-1===Gibberish.sequencers.indexOf(this)&&Gibberish.sequencers.push(this),this.isConnected=!0,this}});for(var e in arguments[0])this[e]=arguments[0][e];for(var e in this.keysAndValues)this.counts[e]=0;this.connect(),this.phase+=this.offset},Gibberish.Sequencer.prototype=Gibberish._oscillator,Gibberish.PolySeq=function(){var e=this,t=0;Gibberish.extend(this,{seqs:[],timeline:{},playOnce:!1,repeatCount:0,repeatTarget:null,isConnected:!1,properties:{rate:1,isRunning:!1,nextTime:0},offset:0,name:"polyseq",getPhase:function(){return t},add:function(t){t.valuesIndex=t.durationsIndex=0,e.seqs.push(t),"undefined"!=typeof e.timeline[0]?e.timeline[0].push(t):e.timeline[0]=[t],!e.scale||"frequency"!==t.key&&"note"!==t.key||e.applyScale&&e.applyScale(),e.nextTime=0,t.shouldStop=!1},callback:function(i,s,r){var n;if(s){if(t>=r){var a=e.timeline[r],o=t-r;if("undefined"==typeof a)return;for(var h=0;h<a.length;h++){var u=a[h];if(!u.shouldStop){if(u.target){var c=u.values.pick?u.values.pick():u.valuesIndex++%u.values.length,l=u.values[c];"function"==typeof l&&(l=l()),"function"==typeof u.target[u.key]?u.target[u.key](l):u.target[u.key]=l}else"function"==typeof u.values[u.valuesIndex]&&u.values[u.valuesIndex++%u.values.length]();
if(Array.isArray(u.durations)){var c=u.durations.pick?u.durations.pick():u.durationsIndex++,b=u.durations[c];n="function"==typeof b?b():b,u.durationsIndex>=u.durations.length&&(u.durationsIndex=0)}else{var b=u.durations;n="function"==typeof b?b():b}var p;p="undefined"!=typeof Gibber?Gibber.Clock.time(n)+t:n+t,p-=o,n-=o,"undefined"==typeof e.timeline[p]?e.timeline[p]=[u]:e.timeline[p].push(u)}}delete e.timeline[r];var f=Object.keys(e.timeline),d=f.length;if(d>1){for(var g=0;d>g;g++)f[g]=parseFloat(f[g]);f=f.sort(function(e,t){return t>e?-1:e>t?1:0}),e.nextTime=f[0]}else e.nextTime=parseFloat(f[0])}t+=i}return 0},start:function(e){if(!e){t=0,this.nextTime=0,this.timeline={0:[]};for(var i=0;i<this.seqs.length;i++){var s=this.seqs[i];s.valuesIndex=s.durationsIndex=s.shouldStop=0,this.timeline[0].push(s)}}return this.isConnected||(this.connect(),this.isConnected=!0),this.isRunning=!0,this},stop:function(){return this.isRunning=!1,this.isConnected&&(this.disconnect(),this.isConnected=!1),this},repeat:function(e){return this.repeatTarget=e,this},shuffle:function(){for(key in this.keysAndValues)this.shuffleArray(this.keysAndValues[key])},shuffleArray:function(e){for(var t,i,s=e.length;s;t=parseInt(Math.random()*s),i=e[--s],e[s]=e[t],e[t]=i);}}),this.init(arguments),this.processProperties(arguments),this.oscillatorInit()},Gibberish.PolySeq.prototype=Gibberish._oscillator;var _hasInput=!1;Gibberish.Input=function(){var e=[];_hasInput||createInput(),this.type=this.name="input",this.fx=new Array2,this.fx.parent=this,this.properties={input:"input",amp:.5,channels:1},this.callback=function(t,i,s){return 1===s?e=t*i:(e[0]=t[0]*i,e[1]=t[1]*i),e},this.init(arguments),this.processProperties(arguments)},Gibberish.Input.prototype=new Gibberish.ugen,Gibberish.Kick=function(){var e=!1,t=(new Gibberish.SVF).callback,i=(new Gibberish.SVF).callback,s=.2,r=.8;Gibberish.extend(this,{name:"kick",properties:{pitch:50,__decay:20,__tone:1e3,amp:2,sr:Gibberish.context.sampleRate},callback:function(s,r,n,a,o){var h=e?60:0;return h=t(h,s,r,2,o),h=i(h,n,.5,0,o),h*=a,e=!1,h},note:function(t,i,s,r){"number"==typeof t&&(this.pitch=t),"number"==typeof i&&(this.decay=i),"number"==typeof s&&(this.tone=s),"number"==typeof r&&(this.amp=r),e=!0}}).init().oscillatorInit(),Object.defineProperties(this,{decay:{get:function(){return s},set:function(e){s=e>1?1:e,this.__decay=100*s}},tone:{get:function(){return r},set:function(e){r=e>1?1:e,this.__tone=220+1400*e}}}),this.processProperties(arguments)},Gibberish.Kick.prototype=Gibberish._oscillator,Gibberish.Conga=function(){var e=!1,t=(new Gibberish.SVF).callback;Gibberish.extend(this,{name:"conga",properties:{pitch:190,amp:2,sr:Gibberish.context.sampleRate},callback:function(i,s,r){var n=e?60:0;return n=t(n,i,50,2,r),n*=s,e=!1,n},note:function(t,i){"number"==typeof t&&(this.pitch=t),"number"==typeof i&&(this.amp=i),e=!0}}).init().oscillatorInit(),this.processProperties(arguments)},Gibberish.Conga.prototype=Gibberish._oscillator,Gibberish.Clave=function(){var e=!1,t=new Gibberish.SVF,i=t.callback;Gibberish.extend(this,{name:"clave",properties:{pitch:2500,amp:1,sr:Gibberish.context.sampleRate},callback:function(t,s,r){var n=e?2:0;return n=i(n,t,5,2,r),n*=s,e=!1,n},note:function(t,i){"number"==typeof t&&(this.pitch=t),"number"==typeof i&&(this.amp=i),e=!0}}).init().oscillatorInit(),this.bpf=t,this.processProperties(arguments)},Gibberish.Clave.prototype=Gibberish._oscillator,Gibberish.Tom=function(){var e=!1,t=(new Gibberish.SVF).callback,i=(new Gibberish.SVF).callback,s=new Gibberish.ExponentialDecay,r=s.callback,n=Math.random;Gibberish.extend(this,{name:"tom",properties:{pitch:80,amp:.5,sr:Gibberish.context.sampleRate},callback:function(s,a,o){var h,u=e?60:0;return u=t(u,s,30,2,o),h=16*n()-8,h=h>0?h:0,h*=r(.05,11025),h=i(h,120,.5,0,o),u+=h,u*=a,e=!1,u},note:function(t,i){"number"==typeof t&&(this.pitch=t),"number"==typeof i&&(this.amp=i),s.trigger(),e=!0}}).init().oscillatorInit(),s.trigger(1),this.processProperties(arguments)},Gibberish.Tom.prototype=Gibberish._oscillator,Gibberish.Cowbell=function(){var e=new Gibberish.Square,t=new Gibberish.Square,i=e.callback,s=t.callback,r=new Gibberish.SVF({mode:2}),n=r.callback,a=new Gibberish.ExponentialDecay(.0025,10500),o=a.callback;Gibberish.extend(this,{name:"cowbell",properties:{amp:1,pitch:560,bpfFreq:1e3,bpfRez:3,decay:22050,decayCoeff:1e-4,sr:Gibberish.context.sampleRate},callback:function(e,t,r,a,h,u,c){var l;return l=i(t,1,1,0),l+=s(845,1,1,0),l=n(l,r,a,2,c),l*=o(u,h),l*=e},note:function(e){a.trigger(),e&&(this.decay=e)}}).init().oscillatorInit().processProperties(arguments),this.bpf=r,this.eg=a,a.trigger(1)},Gibberish.Cowbell.prototype=Gibberish._oscillator,Gibberish.Snare=function(){var e=(new Gibberish.SVF).callback,t=(new Gibberish.SVF).callback,i=(new Gibberish.SVF).callback,s=new Gibberish.ExponentialDecay(.0025,11025),r=s.callback,n=Math.random,a=0;Gibberish.extend(this,{name:"snare",properties:{cutoff:1e3,decay:11025,tune:0,snappy:.5,amp:1,sr:Gibberish.context.sampleRate},callback:function(s,o,h,u,c,l){var b,p,f=0,d=0;return f=r(.0025,o),f>.005&&(d=(2*n()-1)*f,d=i(d,s+1e3*h,.5,1,l),d*=u,d=d>0?d:0,a=f,b=e(a,180*(h+1),15,2,l),p=t(a,330*(h+1),15,2,l),d+=b,d+=.8*p,d*=c),d},note:function(e,t,i,r){"number"==typeof e&&(this.tune=e),"number"==typeof r&&(this.cutoff=r),"number"==typeof i&&(this.snappy=i),"number"==typeof t&&(this.amp=t),s.trigger()}}).init().oscillatorInit().processProperties(arguments),s.trigger(1)},Gibberish.Snare.prototype=Gibberish._oscillator,Gibberish.Hat=function(){{var e=new Gibberish.Square,t=new Gibberish.Square,i=new Gibberish.Square,s=new Gibberish.Square,r=new Gibberish.Square,n=new Gibberish.Square,a=e.callback,o=t.callback,h=i.callback,u=s.callback,c=r.callback,l=n.callback,b=new Gibberish.SVF({mode:2}),p=b.callback,f=new Gibberish.Filter24,d=f.callback,g=new Gibberish.ExponentialDecay(.0025,10500),m=g.callback,y=new Gibberish.ExponentialDecay(.1,7500);y.callback}Gibberish.extend(this,{name:"hat",properties:{amp:1,pitch:325,bpfFreq:7e3,bpfRez:2,hpfFreq:.975,hpfRez:0,decay:3500,decay2:3e3,sr:Gibberish.context.sampleRate},callback:function(e,t,i,s,r,n,b,f,g){var y;return y=a(t,1,.5,0),y+=o(1.4471*t,.75,1,0),y+=h(1.617*t,1,1,0),y+=u(1.9265*t,1,1,0),y+=c(2.5028*t,1,1,0),y+=l(2.6637*t,.75,1,0),y=p(y,i,s,2,g),y*=m(.001,b),y=d(y,r,n,0,1),y*=e},note:function(e,t){g.trigger(),y.trigger(),e&&(this.decay=e),t&&(this.decay2=t)}}).init().oscillatorInit().processProperties(arguments),this.bpf=b,this.hpf=f,g.trigger(1),y.trigger(1)},Gibberish.Hat.prototype=Gibberish._oscillator;
},{}],3:[function(require,module,exports){
(function (Buffer){
"use strict"

var iota = require("iota-array")

var arrayMethods = [
  "concat",
  "join",
  "slice",
  "toString",
  "indexOf",
  "lastIndexOf",
  "forEach",
  "every",
  "some",
  "filter",
  "map",
  "reduce",
  "reduceRight"
]

function compare1st(a, b) {
  return a[0] - b[0]
}

function order() {
  var stride = this.stride
  var terms = new Array(stride.length)
  var i
  for(i=0; i<terms.length; ++i) {
    terms[i] = [Math.abs(stride[i]), i]
  }
  terms.sort(compare1st)
  var result = new Array(terms.length)
  for(i=0; i<result.length; ++i) {
    result[i] = terms[i][1]
  }
  return result
}

function compileConstructor(dtype, dimension) {
  var className = ["View", dimension, "d", dtype].join("")
  var useGetters = (dtype === "generic")
  
  //Special case for 0d arrays
  if(dimension === 0) {
    var code = [
      "function ", className, "(a,d) {\
this.data = a;\
this.offset = d\
};\
var proto=", className, ".prototype;\
proto.dtype='", dtype, "';\
proto.index=function(){return this.offset};\
proto.dimension=0;\
proto.size=1;\
proto.shape=\
proto.stride=\
proto.order=[];\
proto.lo=\
proto.hi=\
proto.transpose=\
proto.step=\
proto.pick=function ", className, "_copy() {\
return new ", className, "(this.data,this.offset)\
};\
proto.get=function ", className, "_get(){\
return ", (useGetters ? "this.data.get(this.offset)" : "this.data[this.offset]"),
"};\
proto.set=function ", className, "_set(v){\
return ", (useGetters ? "this.data.get(this.offset)" : "this.data[this.offset]"), "=v\
};\
return function construct_", className, "(a,b,c,d){return new ", className, "(a,d)}"].join("")
    var procedure = new Function(code)
    return procedure()
  }

  var code = ["'use strict'"]
    
  //Create constructor for view
  var indices = iota(dimension)
  var args = indices.map(function(i) { return "i"+i })
  var index_str = "this.offset+" + indices.map(function(i) {
        return ["this._stride", i, "*i",i].join("")
      }).join("+")
  code.push(["function ", className, "(a,",
    indices.map(function(i) {
      return "b"+i
    }).join(","), ",",
    indices.map(function(i) {
      return "c"+i
    }).join(","), ",d){this.data=a"].join(""))
  for(var i=0; i<dimension; ++i) {
    code.push(["this._shape",i,"=b",i,"|0"].join(""))
  }
  for(var i=0; i<dimension; ++i) {
    code.push(["this._stride",i,"=c",i,"|0"].join(""))
  }
  code.push("this.offset=d|0}")
  
  //Get prototype
  code.push(["var proto=",className,".prototype"].join(""))
  
  //view.dtype:
  code.push(["proto.dtype='", dtype, "'"].join(""))
  code.push("proto.dimension="+dimension)
  
  //view.stride and view.shape
  var strideClassName = ["VStride", dimension, "d", dtype].join("")
  var shapeClassName = ["VShape", dimension, "d", dtype].join("")
  var props = {"stride":strideClassName, "shape":shapeClassName}
  for(var prop in props) {
    var arrayName = props[prop]
    code.push(["function ", arrayName, "(v) {this._v=v} var aproto=", arrayName, ".prototype"].join(""))
    code.push(["aproto.length=",dimension].join(""))
    
    var array_elements = []
    for(var i=0; i<dimension; ++i) {
      array_elements.push(["this._v._", prop, i].join(""))
    }
    code.push(["aproto.toJSON=function ", arrayName, "_toJSON(){return [", array_elements.join(","), "]}"].join(""))
    code.push(["aproto.toString=function ", arrayName, "_toString(){return [", array_elements.join(","), "].join()}"].join(""))
    
    for(var i=0; i<dimension; ++i) {
      code.push(["Object.defineProperty(aproto,", i, ",{get:function(){return this._v._", prop, i, "},set:function(v){return this._v._", prop, i, "=v|0},enumerable:true})"].join(""))
    }
    for(var i=0; i<arrayMethods.length; ++i) {
      if(arrayMethods[i] in Array.prototype) {
        code.push(["aproto.", arrayMethods[i], "=Array.prototype.", arrayMethods[i]].join(""))
      }
    }
    code.push(["Object.defineProperty(proto,'",prop,"',{get:function ", arrayName, "_get(){return new ", arrayName, "(this)},set: function ", arrayName, "_set(v){"].join(""))
    for(var i=0; i<dimension; ++i) {
      code.push(["this._", prop, i, "=v[", i, "]|0"].join(""))
    }
    code.push("return v}})")
  }
  
  //view.size:
  code.push(["Object.defineProperty(proto,'size',{get:function ",className,"_size(){\
return ", indices.map(function(i) { return ["this._shape", i].join("") }).join("*"),
"}})"].join(""))

  //view.order:
  if(dimension === 1) {
    code.push("proto.order=[0]")
  } else {
    code.push("Object.defineProperty(proto,'order',{get:")
    if(dimension < 4) {
      code.push(["function ",className,"_order(){"].join(""))
      if(dimension === 2) {
        code.push("return (Math.abs(this._stride0)>Math.abs(this._stride1))?[1,0]:[0,1]}})")
      } else if(dimension === 3) {
        code.push(
"var s0=Math.abs(this._stride0),s1=Math.abs(this._stride1),s2=Math.abs(this._stride2);\
if(s0>s1){\
if(s1>s2){\
return [2,1,0];\
}else if(s0>s2){\
return [1,2,0];\
}else{\
return [1,0,2];\
}\
}else if(s0>s2){\
return [2,0,1];\
}else if(s2>s1){\
return [0,1,2];\
}else{\
return [0,2,1];\
}}})")
      }
    } else {
      code.push("ORDER})")
    }
  }
  
  //view.set(i0, ..., v):
  code.push([
"proto.set=function ",className,"_set(", args.join(","), ",v){"].join(""))
  if(useGetters) {
    code.push(["return this.data.set(", index_str, ",v)}"].join(""))
  } else {
    code.push(["return this.data[", index_str, "]=v}"].join(""))
  }
  
  //view.get(i0, ...):
  code.push(["proto.get=function ",className,"_get(", args.join(","), "){"].join(""))
  if(useGetters) {
    code.push(["return this.data.get(", index_str, ")}"].join(""))
  } else {
    code.push(["return this.data[", index_str, "]}"].join(""))
  }
  
  //view.index:
  code.push([
    "proto.index=function ",
      className,
      "_index(", args.join(), "){return ", 
      index_str, "}"].join(""))

  //view.hi():
  code.push(["proto.hi=function ",className,"_hi(",args.join(","),"){return new ", className, "(this.data,",
    indices.map(function(i) {
      return ["(typeof i",i,"!=='number'||i",i,"<0)?this._shape", i, ":i", i,"|0"].join("")
    }).join(","), ",",
    indices.map(function(i) {
      return "this._stride"+i
    }).join(","), ",this.offset)}"].join(""))
  
  //view.lo():
  var a_vars = indices.map(function(i) { return "a"+i+"=this._shape"+i })
  var c_vars = indices.map(function(i) { return "c"+i+"=this._stride"+i })
  code.push(["proto.lo=function ",className,"_lo(",args.join(","),"){var b=this.offset,d=0,", a_vars.join(","), ",", c_vars.join(",")].join(""))
  for(var i=0; i<dimension; ++i) {
    code.push([
"if(typeof i",i,"==='number'&&i",i,">=0){\
d=i",i,"|0;\
b+=c",i,"*d;\
a",i,"-=d}"].join(""))
  }
  code.push(["return new ", className, "(this.data,",
    indices.map(function(i) {
      return "a"+i
    }).join(","),",",
    indices.map(function(i) {
      return "c"+i
    }).join(","), ",b)}"].join(""))
  
  //view.step():
  code.push(["proto.step=function ",className,"_step(",args.join(","),"){var ",
    indices.map(function(i) {
      return "a"+i+"=this._shape"+i
    }).join(","), ",",
    indices.map(function(i) {
      return "b"+i+"=this._stride"+i
    }).join(","),",c=this.offset,d=0,ceil=Math.ceil"].join(""))
  for(var i=0; i<dimension; ++i) {
    code.push([
"if(typeof i",i,"==='number'){\
d=i",i,"|0;\
if(d<0){\
c+=b",i,"*(a",i,"-1);\
a",i,"=ceil(-a",i,"/d)\
}else{\
a",i,"=ceil(a",i,"/d)\
}\
b",i,"*=d\
}"].join(""))
  }
  code.push(["return new ", className, "(this.data,",
    indices.map(function(i) {
      return "a" + i
    }).join(","), ",",
    indices.map(function(i) {
      return "b" + i
    }).join(","), ",c)}"].join(""))
  
  //view.transpose():
  var tShape = new Array(dimension)
  var tStride = new Array(dimension)
  for(var i=0; i<dimension; ++i) {
    tShape[i] = ["a[i", i, "|0]"].join("")
    tStride[i] = ["b[i", i, "|0]"].join("")
  }
  code.push(["proto.transpose=function ",className,"_transpose(",args,"){var a=this.shape,b=this.stride;return new ", className, "(this.data,", tShape.join(","), ",", tStride.join(","), ",this.offset)}"].join(""))
  
  //view.pick():
  code.push(["proto.pick=function ",className,"_pick(",args,"){var a=[],b=[],c=this.offset"].join(""))
  for(var i=0; i<dimension; ++i) {
    code.push(["if(typeof i",i,"==='number'&&i",i,">=0){c=(c+this._stride",i,"*i",i,")|0}else{a.push(this._shape",i,");b.push(this._stride",i,")}"].join(""))
  }
  code.push("var ctor=CTOR_LIST[a.length];return ctor(this.data,a,b,c)}")
    
  //Add return statement
  code.push(["return function construct_",className,"(data,shape,stride,offset){return new ", className,"(data,",
    indices.map(function(i) {
      return "shape["+i+"]"
    }).join(","), ",",
    indices.map(function(i) {
      return "stride["+i+"]"
    }).join(","), ",offset)}"].join(""))

  //Compile procedure
  var procedure = new Function("CTOR_LIST", "ORDER", code.join("\n"))
  return procedure(CACHED_CONSTRUCTORS[dtype], order)
}

function arrayDType(data) {
  if(data instanceof Float64Array) {
    return "float64";
  } else if(data instanceof Float32Array) {
    return "float32"
  } else if(data instanceof Int32Array) {
    return "int32"
  } else if(data instanceof Uint32Array) {
    return "uint32"
  } else if(data instanceof Uint8Array) {
    return "uint8"
  } else if(data instanceof Uint16Array) {
    return "uint16"
  } else if(data instanceof Int16Array) {
    return "int16"
  } else if(data instanceof Int8Array) {
    return "int8"
  } else if(data instanceof Uint8ClampedArray) {
    return "uint8_clamped"
  } else if((typeof Buffer !== "undefined") && (data instanceof Buffer)) {
    return "buffer"
  } else if(data instanceof Array) {
    return "array"
  }
  return "generic"
}

var CACHED_CONSTRUCTORS = {
  "float32":[],
  "float64":[],
  "int8":[],
  "int16":[],
  "int32":[],
  "uint8":[],
  "uint16":[],
  "uint32":[],
  "array":[],
  "uint8_clamped":[],
  "buffer":[],
  "generic":[]
}

function wrappedNDArrayCtor(data, shape, stride, offset) {
  if(shape === undefined) {
    shape = [ data.length ]
  }
  var d = shape.length
  if(stride === undefined) {
    stride = new Array(d)
    for(var i=d-1, sz=1; i>=0; --i) {
      stride[i] = sz
      sz *= shape[i]
    }
  }
  if(offset === undefined) {
    offset = 0
    for(var i=0; i<d; ++i) {
      if(stride[i] < 0) {
        offset -= (shape[i]-1)*stride[i]
      }
    }
  }
  var dtype = arrayDType(data)
  var ctor_list = CACHED_CONSTRUCTORS[dtype]
  while(ctor_list.length <= d) {
    ctor_list.push(compileConstructor(dtype, ctor_list.length))
  }
  var ctor = ctor_list[d]
  return ctor(data, shape, stride, offset)
}

module.exports = wrappedNDArrayCtor
}).call(this,require("buffer").Buffer)
},{"buffer":7,"iota-array":4}],4:[function(require,module,exports){
"use strict"

function iota(n) {
  var result = new Array(n)
  for(var i=0; i<n; ++i) {
    result[i] = i
  }
  return result
}

module.exports = iota
},{}],5:[function(require,module,exports){
// seedrandom.js version 2.3.3
// Author: David Bau
// Date: 2014 Feb 4
//
// Defines a method Math.seedrandom() that, when called, substitutes
// an explicitly seeded RC4-based algorithm for Math.random().  Also
// supports automatic seeding from local or network sources of entropy.
// Can be used as a node.js or AMD module.  Can be called with "new"
// to create a local PRNG without changing Math.random.
//
// Basic usage:
//
//   <script src=http://davidbau.com/encode/seedrandom.min.js></script>
//
//   Math.seedrandom('yay.');  // Sets Math.random to a function that is
//                             // initialized using the given explicit seed.
//
//   Math.seedrandom();        // Sets Math.random to a function that is
//                             // seeded using the current time, dom state,
//                             // and other accumulated local entropy.
//                             // The generated seed string is returned.
//
//   Math.seedrandom('yowza.', true);
//                             // Seeds using the given explicit seed mixed
//                             // together with accumulated entropy.
//
//   <script src="https://jsonlib.appspot.com/urandom?callback=Math.seedrandom">
//   </script>                 <!-- Seeds using urandom bits from a server. -->
//
//   Math.seedrandom("hello.");           // Behavior is the same everywhere:
//   document.write(Math.random());       // Always 0.9282578795792454
//   document.write(Math.random());       // Always 0.3752569768646784
//
// Math.seedrandom can be used as a constructor to return a seeded PRNG
// that is independent of Math.random:
//
//   var myrng = new Math.seedrandom('yay.');
//   var n = myrng();          // Using "new" creates a local prng without
//                             // altering Math.random.
//
// When used as a module, seedrandom is a function that returns a seeded
// PRNG instance without altering Math.random:
//
//   // With node.js (after "npm install seedrandom"):
//   var seedrandom = require('seedrandom');
//   var rng = seedrandom('hello.');
//   console.log(rng());                  // always 0.9282578795792454
//
//   // With require.js or other AMD loader:
//   require(['seedrandom'], function(seedrandom) {
//     var rng = seedrandom('hello.');
//     console.log(rng());                // always 0.9282578795792454
//   });
//
// More examples:
//
//   var seed = Math.seedrandom();        // Use prng with an automatic seed.
//   document.write(Math.random());       // Pretty much unpredictable x.
//
//   var rng = new Math.seedrandom(seed); // A new prng with the same seed.
//   document.write(rng());               // Repeat the 'unpredictable' x.
//
//   function reseed(event, count) {      // Define a custom entropy collector.
//     var t = [];
//     function w(e) {
//       t.push([e.pageX, e.pageY, +new Date]);
//       if (t.length < count) { return; }
//       document.removeEventListener(event, w);
//       Math.seedrandom(t, true);        // Mix in any previous entropy.
//     }
//     document.addEventListener(event, w);
//   }
//   reseed('mousemove', 100);            // Reseed after 100 mouse moves.
//
// The callback third arg can be used to get both the prng and the seed.
// The following returns both an autoseeded prng and the seed as an object,
// without mutating Math.random:
//
//   var obj = Math.seedrandom(null, false, function(prng, seed) {
//     return { random: prng, seed: seed };
//   });
//
// Version notes:
//
// The random number sequence is the same as version 1.0 for string seeds.
// * Version 2.0 changed the sequence for non-string seeds.
// * Version 2.1 speeds seeding and uses window.crypto to autoseed if present.
// * Version 2.2 alters non-crypto autoseeding to sweep up entropy from plugins.
// * Version 2.3 adds support for "new", module loading, and a null seed arg.
// * Version 2.3.1 adds a build environment, module packaging, and tests.
// * Version 2.3.3 fixes bugs on IE8, and switches to MIT license.
//
// The standard ARC4 key scheduler cycles short keys, which means that
// seedrandom('ab') is equivalent to seedrandom('abab') and 'ababab'.
// Therefore it is a good idea to add a terminator to avoid trivial
// equivalences on short string seeds, e.g., Math.seedrandom(str + '\0').
// Starting with version 2.0, a terminator is added automatically for
// non-string seeds, so seeding with the number 111 is the same as seeding
// with '111\0'.
//
// When seedrandom() is called with zero args or a null seed, it uses a
// seed drawn from the browser crypto object if present.  If there is no
// crypto support, seedrandom() uses the current time, the native rng,
// and a walk of several DOM objects to collect a few bits of entropy.
//
// Each time the one- or two-argument forms of seedrandom are called,
// entropy from the passed seed is accumulated in a pool to help generate
// future seeds for the zero- and two-argument forms of seedrandom.
//
// On speed - This javascript implementation of Math.random() is several
// times slower than the built-in Math.random() because it is not native
// code, but that is typically fast enough.  Some details (timings on
// Chrome 25 on a 2010 vintage macbook):
//
// seeded Math.random()          - avg less than 0.0002 milliseconds per call
// seedrandom('explicit.')       - avg less than 0.2 milliseconds per call
// seedrandom('explicit.', true) - avg less than 0.2 milliseconds per call
// seedrandom() with crypto      - avg less than 0.2 milliseconds per call
//
// Autoseeding without crypto is somewhat slower, about 20-30 milliseconds on
// a 2012 windows 7 1.5ghz i5 laptop, as seen on Firefox 19, IE 10, and Opera.
// Seeded rng calls themselves are fast across these browsers, with slowest
// numbers on Opera at about 0.0005 ms per seeded Math.random().
//
// LICENSE (BSD):
//
// Copyright 2013 David Bau, all rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
//   1. Redistributions of source code must retain the above copyright
//      notice, this list of conditions and the following disclaimer.
//
//   2. Redistributions in binary form must reproduce the above copyright
//      notice, this list of conditions and the following disclaimer in the
//      documentation and/or other materials provided with the distribution.
//
//   3. Neither the name of this module nor the names of its contributors may
//      be used to endorse or promote products derived from this software
//      without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//

/**
 * All code is in an anonymous closure to keep the global namespace clean.
 */
(function (
    global, pool, math, width, chunks, digits, module, define, rngname) {

//
// The following constants are related to IEEE 754 limits.
//
var startdenom = math.pow(width, chunks),
    significance = math.pow(2, digits),
    overflow = significance * 2,
    mask = width - 1,

//
// seedrandom()
// This is the seedrandom function described above.
//
impl = math['seed' + rngname] = function(seed, use_entropy, callback) {
  var key = [];

  // Flatten the seed string or build one from local entropy if needed.
  var shortseed = mixkey(flatten(
    use_entropy ? [seed, tostring(pool)] :
    (seed == null) ? autoseed() : seed, 3), key);

  // Use the seed to initialize an ARC4 generator.
  var arc4 = new ARC4(key);

  // Mix the randomness into accumulated entropy.
  mixkey(tostring(arc4.S), pool);

  // Calling convention: what to return as a function of prng, seed, is_math.
  return (callback ||
      // If called as a method of Math (Math.seedrandom()), mutate Math.random
      // because that is how seedrandom.js has worked since v1.0.  Otherwise,
      // it is a newer calling convention, so return the prng directly.
      function(prng, seed, is_math_call) {
        if (is_math_call) { math[rngname] = prng; return seed; }
        else return prng;
      })(

  // This function returns a random double in [0, 1) that contains
  // randomness in every bit of the mantissa of the IEEE 754 value.
  function() {
    var n = arc4.g(chunks),             // Start with a numerator n < 2 ^ 48
        d = startdenom,                 //   and denominator d = 2 ^ 48.
        x = 0;                          //   and no 'extra last byte'.
    while (n < significance) {          // Fill up all significant digits by
      n = (n + x) * width;              //   shifting numerator and
      d *= width;                       //   denominator and generating a
      x = arc4.g(1);                    //   new least-significant-byte.
    }
    while (n >= overflow) {             // To avoid rounding up, before adding
      n /= 2;                           //   last byte, shift everything
      d /= 2;                           //   right using integer math until
      x >>>= 1;                         //   we have exactly the desired bits.
    }
    return (n + x) / d;                 // Form the number within [0, 1).
  }, shortseed, this == math);
};

//
// ARC4
//
// An ARC4 implementation.  The constructor takes a key in the form of
// an array of at most (width) integers that should be 0 <= x < (width).
//
// The g(count) method returns a pseudorandom integer that concatenates
// the next (count) outputs from ARC4.  Its return value is a number x
// that is in the range 0 <= x < (width ^ count).
//
/** @constructor */
function ARC4(key) {
  var t, keylen = key.length,
      me = this, i = 0, j = me.i = me.j = 0, s = me.S = [];

  // The empty key [] is treated as [0].
  if (!keylen) { key = [keylen++]; }

  // Set up S using the standard key scheduling algorithm.
  while (i < width) {
    s[i] = i++;
  }
  for (i = 0; i < width; i++) {
    s[i] = s[j = mask & (j + key[i % keylen] + (t = s[i]))];
    s[j] = t;
  }

  // The "g" method returns the next (count) outputs as one number.
  (me.g = function(count) {
    // Using instance members instead of closure state nearly doubles speed.
    var t, r = 0,
        i = me.i, j = me.j, s = me.S;
    while (count--) {
      t = s[i = mask & (i + 1)];
      r = r * width + s[mask & ((s[i] = s[j = mask & (j + t)]) + (s[j] = t))];
    }
    me.i = i; me.j = j;
    return r;
    // For robust unpredictability discard an initial batch of values.
    // See http://www.rsa.com/rsalabs/node.asp?id=2009
  })(width);
}

//
// flatten()
// Converts an object tree to nested arrays of strings.
//
function flatten(obj, depth) {
  var result = [], typ = (typeof obj), prop;
  if (depth && typ == 'object') {
    for (prop in obj) {
      try { result.push(flatten(obj[prop], depth - 1)); } catch (e) {}
    }
  }
  return (result.length ? result : typ == 'string' ? obj : obj + '\0');
}

//
// mixkey()
// Mixes a string seed into a key that is an array of integers, and
// returns a shortened string seed that is equivalent to the result key.
//
function mixkey(seed, key) {
  var stringseed = seed + '', smear, j = 0;
  while (j < stringseed.length) {
    key[mask & j] =
      mask & ((smear ^= key[mask & j] * 19) + stringseed.charCodeAt(j++));
  }
  return tostring(key);
}

//
// autoseed()
// Returns an object for autoseeding, using window.crypto if available.
//
/** @param {Uint8Array|Navigator=} seed */
function autoseed(seed) {
  try {
    global.crypto.getRandomValues(seed = new Uint8Array(width));
    return tostring(seed);
  } catch (e) {
    return [+new Date, global, (seed = global.navigator) && seed.plugins,
            global.screen, tostring(pool)];
  }
}

//
// tostring()
// Converts an array of charcodes to a string
//
function tostring(a) {
  return String.fromCharCode.apply(0, a);
}

//
// When seedrandom.js is loaded, we immediately mix a few bits
// from the built-in RNG into the entropy pool.  Because we do
// not want to intefere with determinstic PRNG state later,
// seedrandom will not call math.random on its own again after
// initialization.
//
mixkey(math[rngname](), pool);

//
// Nodejs and AMD support: export the implemenation as a module using
// either convention.
//
if (module && module.exports) {
  module.exports = impl;
} else if (define && define.amd) {
  define(function() { return impl; });
}

// End anonymous scope, and pass initial values.
})(
  this,   // global window object
  [],     // pool: entropy pool starts empty
  Math,   // math: package containing random, pow, and seedrandom
  256,    // width: each RC4 output is 0 <= x < 256
  6,      // chunks: at least six RC4 outputs for each double
  52,     // digits: there are 52 significant digits in a double
  (typeof module) == 'object' && module,    // present in node.js
  (typeof define) == 'function' && define,  // present with an AMD loader
  'random'// rngname: name for Math.random and Math.seedrandom
);

},{}],6:[function(require,module,exports){
"use strict"

var ndarray = require("ndarray")

module.exports = function zeros(shape) {
  var sz = 1
  for(var i=0; i<shape.length; ++i) {
    sz *= shape[i]
  }
  return ndarray(new Float64Array(sz), shape)
}
},{"ndarray":3}],7:[function(require,module,exports){
/**
 * The buffer module from node.js, for the browser.
 *
 * Author:   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * License:  MIT
 *
 * `npm install buffer`
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192

/**
 * If `Buffer._useTypedArrays`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (compatible down to IE6)
 */
Buffer._useTypedArrays = (function () {
   // Detect if browser supports Typed Arrays. Supported browsers are IE 10+,
   // Firefox 4+, Chrome 7+, Safari 5.1+, Opera 11.6+, iOS 4.2+.
  if (typeof Uint8Array !== 'function' || typeof ArrayBuffer !== 'function')
    return false

  // Does the browser support adding properties to `Uint8Array` instances? If
  // not, then that's the same as no `Uint8Array` support. We need to be able to
  // add all the node Buffer API methods.
  // Bug in Firefox 4-29, now fixed: https://bugzilla.mozilla.org/show_bug.cgi?id=695438
  try {
    var arr = new Uint8Array(0)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() &&
        typeof arr.subarray === 'function' // Chrome 9-10 lack `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Workaround: node's base64 implementation allows for non-padded strings
  // while base64-js does not.
  if (encoding === 'base64' && type === 'string') {
    subject = stringtrim(subject)
    while (subject.length % 4 !== 0) {
      subject = subject + '='
    }
  }

  // Find the length
  var length
  if (type === 'number')
    length = coerce(subject)
  else if (type === 'string')
    length = Buffer.byteLength(subject, encoding)
  else if (type === 'object')
    length = coerce(subject.length) // Assume object is an array
  else
    throw new Error('First argument needs to be a number, array or string.')

  var buf
  if (Buffer._useTypedArrays) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (Buffer._useTypedArrays && typeof Uint8Array === 'function' &&
      subject instanceof Uint8Array) {
    // Speed optimization -- use set if we're copying from a Uint8Array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    for (i = 0; i < length; i++) {
      if (Buffer.isBuffer(subject))
        buf[i] = subject.readUInt8(i)
      else
        buf[i] = subject[i]
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer._useTypedArrays && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  return buf
}

// STATIC METHODS
// ==============

Buffer.isEncoding = function (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.isBuffer = function (b) {
  return !!(b !== null && b !== undefined && b._isBuffer)
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str + ''
  switch (encoding || 'utf8') {
    case 'hex':
      ret = str.length / 2
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.concat = function (list, totalLength) {
  assert(isArray(list), 'Usage: Buffer.concat(list, [totalLength])\n' +
      'list should be an Array.')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (typeof totalLength !== 'number') {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

// BUFFER INSTANCE METHODS
// =======================

function _hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  assert(strLen % 2 === 0, 'Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    assert(!isNaN(byte), 'Invalid hex string')
    buf[offset + i] = byte
  }
  Buffer._charsWritten = i * 2
  return i
}

function _utf8Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf8ToBytes(string), buf, offset, length)
  return charsWritten
}

function _asciiWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function _binaryWrite (buf, string, offset, length) {
  return _asciiWrite(buf, string, offset, length)
}

function _base64Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function _utf16leWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf16leToBytes(string), buf, offset, length)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0
  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = _asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = _binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = _base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leWrite(this, string, offset, length)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toString = function (encoding, start, end) {
  var self = this

  encoding = String(encoding || 'utf8').toLowerCase()
  start = Number(start) || 0
  end = (end !== undefined)
    ? Number(end)
    : end = self.length

  // Fastpath empty strings
  if (end === start)
    return ''

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexSlice(self, start, end)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Slice(self, start, end)
      break
    case 'ascii':
      ret = _asciiSlice(self, start, end)
      break
    case 'binary':
      ret = _binarySlice(self, start, end)
      break
    case 'base64':
      ret = _base64Slice(self, start, end)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leSlice(self, start, end)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (!target_start) target_start = 0

  // Copy 0 bytes; we're done
  if (end === start) return
  if (target.length === 0 || source.length === 0) return

  // Fatal error conditions
  assert(end >= start, 'sourceEnd < sourceStart')
  assert(target_start >= 0 && target_start < target.length,
      'targetStart out of bounds')
  assert(start >= 0 && start < source.length, 'sourceStart out of bounds')
  assert(end >= 0 && end <= source.length, 'sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  // copy!
  for (var i = 0; i < end - start; i++)
    target[i + target_start] = this[i + start]
}

function _base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function _utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function _asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++)
    ret += String.fromCharCode(buf[i])
  return ret
}

function _binarySlice (buf, start, end) {
  return _asciiSlice(buf, start, end)
}

function _hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function _utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i+1] * 256)
  }
  return res
}

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = clamp(start, len, 0)
  end = clamp(end, len, len)

  if (Buffer._useTypedArrays) {
    return augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    var newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
    return newBuf
  }
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  return this[offset]
}

function _readUInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    val = buf[offset]
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
  } else {
    val = buf[offset] << 8
    if (offset + 1 < len)
      val |= buf[offset + 1]
  }
  return val
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  return _readUInt16(this, offset, true, noAssert)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  return _readUInt16(this, offset, false, noAssert)
}

function _readUInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    if (offset + 2 < len)
      val = buf[offset + 2] << 16
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
    val |= buf[offset]
    if (offset + 3 < len)
      val = val + (buf[offset + 3] << 24 >>> 0)
  } else {
    if (offset + 1 < len)
      val = buf[offset + 1] << 16
    if (offset + 2 < len)
      val |= buf[offset + 2] << 8
    if (offset + 3 < len)
      val |= buf[offset + 3]
    val = val + (buf[offset] << 24 >>> 0)
  }
  return val
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  return _readUInt32(this, offset, true, noAssert)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  return _readUInt32(this, offset, false, noAssert)
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null,
        'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  var neg = this[offset] & 0x80
  if (neg)
    return (0xff - this[offset] + 1) * -1
  else
    return this[offset]
}

function _readInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt16(buf, offset, littleEndian, true)
  var neg = val & 0x8000
  if (neg)
    return (0xffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  return _readInt16(this, offset, true, noAssert)
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  return _readInt16(this, offset, false, noAssert)
}

function _readInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt32(buf, offset, littleEndian, true)
  var neg = val & 0x80000000
  if (neg)
    return (0xffffffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  return _readInt32(this, offset, true, noAssert)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  return _readInt32(this, offset, false, noAssert)
}

function _readFloat (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 23, 4)
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  return _readFloat(this, offset, true, noAssert)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  return _readFloat(this, offset, false, noAssert)
}

function _readDouble (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 7 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 52, 8)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  return _readDouble(this, offset, true, noAssert)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  return _readDouble(this, offset, false, noAssert)
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'trying to write beyond buffer length')
    verifuint(value, 0xff)
  }

  if (offset >= this.length) return

  this[offset] = value
}

function _writeUInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 2); i < j; i++) {
    buf[offset + i] =
        (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
            (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, false, noAssert)
}

function _writeUInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffffffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 4); i < j; i++) {
    buf[offset + i] =
        (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, false, noAssert)
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7f, -0x80)
  }

  if (offset >= this.length)
    return

  if (value >= 0)
    this.writeUInt8(value, offset, noAssert)
  else
    this.writeUInt8(0xff + value + 1, offset, noAssert)
}

function _writeInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fff, -0x8000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt16(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt16(buf, 0xffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, false, noAssert)
}

function _writeInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fffffff, -0x80000000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt32(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt32(buf, 0xffffffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, false, noAssert)
}

function _writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 23, 4)
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, false, noAssert)
}

function _writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 7 < buf.length,
        'Trying to write beyond buffer length')
    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 52, 8)
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, false, noAssert)
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (typeof value === 'string') {
    value = value.charCodeAt(0)
  }

  assert(typeof value === 'number' && !isNaN(value), 'value is not a number')
  assert(end >= start, 'end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  assert(start >= 0 && start < this.length, 'start out of bounds')
  assert(end >= 0 && end <= this.length, 'end out of bounds')

  for (var i = start; i < end; i++) {
    this[i] = value
  }
}

Buffer.prototype.inspect = function () {
  var out = []
  var len = this.length
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i])
    if (i === exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...'
      break
    }
  }
  return '<Buffer ' + out.join(' ') + '>'
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array === 'function') {
    if (Buffer._useTypedArrays) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1)
        buf[i] = this[i]
      return buf.buffer
    }
  } else {
    throw new Error('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

var BP = Buffer.prototype

/**
 * Augment the Uint8Array *instance* (not the class!) with Buffer methods
 */
function augment (arr) {
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

// slice(start, end)
function clamp (index, len, defaultValue) {
  if (typeof index !== 'number') return defaultValue
  index = ~~index;  // Coerce to integer.
  if (index >= len) return len
  if (index >= 0) return index
  index += len
  if (index >= 0) return index
  return 0
}

function coerce (length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length)
  return length < 0 ? 0 : length
}

function isArray (subject) {
  return (Array.isArray || function (subject) {
    return Object.prototype.toString.call(subject) === '[object Array]'
  })(subject)
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    var b = str.charCodeAt(i)
    if (b <= 0x7F)
      byteArray.push(str.charCodeAt(i))
    else {
      var start = i
      if (b >= 0xD800 && b <= 0xDFFF) i++
      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16))
    }
  }
  return byteArray
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(str)
}

function blitBuffer (src, dst, offset, length) {
  var pos
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

/*
 * We have to make sure that the value is a valid integer. This means that it
 * is non-negative. It has no fractional component and that it does not
 * exceed the maximum allowed value.
 */
function verifuint (value, max) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value >= 0, 'specified a negative value for writing an unsigned value')
  assert(value <= max, 'value is larger than maximum value for type')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifsint (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifIEEE754 (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
}

function assert (test, message) {
  if (!test) throw new Error(message || 'Failed assertion')
}

},{"base64-js":8,"ieee754":9}],8:[function(require,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var ZERO   = '0'.charCodeAt(0)
	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS)
			return 62 // '+'
		if (code === SLASH)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	module.exports.toByteArray = b64ToByteArray
	module.exports.fromByteArray = uint8ToBase64
}())

},{}],9:[function(require,module,exports){
exports.read = function(buffer, offset, isLE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isLE ? (nBytes - 1) : 0,
      d = isLE ? -1 : 1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isLE ? 0 : (nBytes - 1),
      d = isLE ? 1 : -1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

},{}]},{},[2,1])