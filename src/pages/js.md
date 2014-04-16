title: JavaScript


# Examples

- Cellular Automata
	- [Game of Life](js.life.html)
	- [Brian's Brain](js.brain.html)
	- [Forest fire](js.fire.html)
	- [Langton's ant](js.ants.html)
	- [Langton's ant (multiple ants + sound)](js.ants2.html)
	- [Block rules](js.block.html)
	- [Hodgepodge](js.hodgepodge.html)
- Agent systems
	- [Boids](js.boids.html)

# Using JavaScript and al.js

Since 2014 we are also offering class material using a browser-based JavaScript implementation. Most of the library code is in [http://grrrwaaa.github.io/gct753/al.min.js](http://grrrwaaa.github.io/gct753/al.min.js) (or, for an uncompressed version, see [http://grrrwaaa.github.io/gct753/al.js](http://grrrwaaa.github.io/gct753/al.js)). This library replicates many of the capabilities of last year's Lua based system, and adds a few new ones. Graphical rendering uses HTML5 Canvas API and sound is built on the ScriptProcessingNode API, so a recent version of Chrome, FireFox or Safari is recommended (IE probably won't work). 

Please look at [the Game of Life example](js.life.html) and **view source** to get an idea of the template:

```
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="content-type" content="text/html; charset=UTF-8">
<script src="http://grrrwaaa.github.io/gct753/al.min.js"></script>
<style>
body {
	background: #eee;
	width: 512px;
	min-height: 100%;
	margin: 50px auto 50px auto;
}
</style>
</head>
<body>
<script>
al.init();

/// put your JavaScript code here ///

</script>
</body>
</html>
```

The html, head, body etc. structure is standard. The class library code is pulled in by the line ```<script src="http://grrrwaaa.github.io/gct753/al.min.js"></script>```. The following ```<style>``` section is just to make the page a little prettier. The body contains a ```<script>``` tag for JavaScript code, the first line of which should be ```al.init();```. This call creates a ```<canvas>``` object, sets up a rendering loop, and creates the *start, stop, once, reset* buttons underneath it. 

## Globals

The al.js library adds a few global functions to the JavaScript envrionment, to make it easier to port examples from Lua. The ```random()``` function can be used to generate random numbers. The ```wrap()``` applies a Euclidean modulo (remainder after division) in such a way that the result is always positive and without reflections:

```javascript
random(); 		// a floating-point number between 0 and 1
random(6);		// an integer between 0 and 5
wrap(-1, 4);	// returns 3 (whereas -1 % 4 would return -1)
```


## Callbacks

To define how the canvas renders, implement a function called ```draw()```. The ```draw``` function receives the canvas context as its first argument, so any [HTML5 canvas API](http://www.w3schools.com/tags/ref_canvas.asp) calls can be used. For simulation updates, implement a function called ```update()```. This function will receive a delta-time argument, representing the time in seconds since the last time it was called. For example:

```javascript
var x = 0;

draw = function(ctx) {
	ctx.fillStyle = "green";
	ctx.fillRect(x, 10, 100, 100);
}

update = function(dt) {
	x = x + dt;
}
```

### Interaction

Two additional callbacks exist to detect mouse and keyboard interaction respectively. 

```javascript

// event can be "down" or "up" for clicks,
// or "drag" when moving with a mouse button pressed,
// or "move" when moving with no button pressed,
// event is "enter" when the mouse enters the canvas, and "exit" when the mouse goes outside it
// in all the above cases, 
// x and y are the mouse position from 0,0 (top left) to 1,1 (bottom right)
// event is "scroll" when the mouse wheel is scrolled (in which case y gives the scroll delta)
// button is the mouse button (for "down", "up" and "drag" events)
mouse = function(event, button, x, y) {
	console.log(event, button, x, y);
}

// if event is "press", key is a single character string
// if event is "down" or "up", key is a numeric code
key = function(event, key) {
	console.log(event, key);
}
```

## field2D

We have a ```field2D``` type to represent grids of cells, where each cell holds a floating point number (typically but not necessarily in the range of zero to one). You can create a field like this:

```javascript
var field = new field2D(width, height);
```

By default field cells will be zero. You can get and set individual field cells this way:

```javascript
var value = field.get(x, y);
field.set(value, x, y);
```

Note that if x or y is out of bounds for the field, it will wrap around from the other side. So you are always guaranteed it will return or set a value. 

To set the value of all cells at once, omit the x and y:

```javascript
// set all field cells to 1:
field.set(1);
```

A more powerful feature of ```field2D.set()``` is that it can take a function instead of a number. It calls this function to derive a new value for each cell in the field. The function receives as arguments the x and y position of the cell, so for example, this code initializes the field with a horizontal gradient:

```javascript
field.set(function(x, y) {
	return x / field.width;
);
```

Typically we will render the field in the ```draw()``` callback by calling the field's draw method:

```javascript
draw = function(ctx) {
	field.draw();
}
```

More useful methods:

```javascript

field.min();	// returns the lowest cell value in the array
field.max();	// returns the highest cell value in the array
field.sum();	// adds up all cell values and returns the total

field.clear(); 		// set all field cells to zero
field.normalize();	 // re-scales the field into a 0..1 range
```

There are some methods for interpolated reading/writing/modifying fields. These methods use x and y indices in a normalized 0..1 floating-point range rather than 0..width or 0..height integer range:

```javascript
// returns interpolated value at the normalized position x,y
field.sample(x, y);			

// set the field at position x,y to value v 
// (the four nearest cells will be interpolated)
// if v is a function, it is evaluated for each cell. The function arguments are cellvalue, x, y.
field.update(v, x, y);

// adds v to a field at position x, y
// (interpolated addition to nearest four cells)
field.splat(v, x, y);

// scale a field at x,y by factor v
// (interpolated scale over nearest four cells)
field.scale(v, x, y);
// if x and y are ommitted, the scale factor is applied to the whole field:
field.scale(v);
```

The field2D type also includes a diffusion method, which can be used to smoothly distribute values over time. It requires a second (previous) copy of the field to diffuse from:

```javascript
// field_previous is another field2D of equal dimensions
// diffusion_rate is a value between 0 and 1; a rate of 0 means no diffusion.
// accuracy is an optional integer for the number of diffusion steps; the default is 10.
field.diffuse(field_previous, diffusion_rate, accuracy);
```

There are also a couple of classic functional programming methods. The ```map(function)``` method applies a function to each cell of the field in turn. The function arguments will be the current value of the cell and the x and y position, and the return value should be the new value of the cell (or nil to indicate no change). 

The ```reduce(function, initial)``` method is used to reduce a field to a single value, such as calculating the total of all cells. This value is defined by the ```initial``` argument, passed to the function for each cell, and updated by its return value. Easier to explain by example:

```javascript
// multiply all cells by 2: 
field.map(function(value, x, y) { return value * 2; });

// find the sum total of all cell values:
var total = field.reduce(function(sum, value, x, y) {
	return sum + value;
}, 0);
```

## Audio

Audio will be enabled if any audio objects are created. If that occurs, the ```update()``` function will be triggered by audio processing rather than graphical rendering. 

You can create a sine oscillator like this:

```javascript
// create the oscillator and start it playing:
var osc = new al.audio.SinOsc().connect();
```

The oscillator includes several parameters that can be modified:

```javascript
osc.freq = 440; 	// frequency in Hz
osc.amp = 0.1;		// amplitude. linear range between 0 (silent) and 1 (loud)
osc.pan = 0.5;		// spatial position. linear range between 0 (left) and 1 (right)
```

More audio capabilities will be added soon.

## Why JavaScript?

JavaScript (JS) is a language of growing importance at the intersection of media/culture technology. 

> Note: Despite the similarity of name, JavaScript has no particular relation to Java. JavaScript is however also known as [ECMAScript](http://en.wikipedia.org/wiki/ECMAScript), JScript, and ActionScript.

### JS is everywhere:

- It has become the de facto 'language of the web', having evolved from lightweight scripting roots to a full-fledged application language with powerful capabilities in HTML5. 
- Not only is it used pervasively in client browser-based applications, it is also used for high-performance server applications, particularly using the [node.js](http://nodejs.org/) system. 
- JS has also been used as an embedded scripting language for desktop applications by Google, Adobe, OpenOffice, Apple, MicroSoft, Qt, GNOME, etc., including many media-oriented applications such as Max/MSP/Jitter, [Processing](http://en.wikipedia.org/wiki/Processing.js), Logic Pro, Unity, DX Studio, Maxwell Render, Flash, etc., and many games/game engines.

### For media/culture technology purposes:

- A browser-based JS application will run on Windows, OSX, Linux, Android, iOS etc., so long as browser applications are up to date. In recent years this has meant that even low-level audio signal processing and 3D OpenGL are available for use. 
- Browser and server-based applications open up easy possibilities to reach out to vast audiences and connect to social and other media networks, to explore collaborative interfaces, to interact with the increasing number of devices supporting websocket APIs, etc.

### Flexible, fast, well-supported:

- JS is a primarily imperative, procedural language (just like C, Java, Python, etc.), however it also supports functional programming features such as first-class functions. It is dynamically-typed and object-based, but uses a more flexible, dynamic [prototype-based](http://en.wikipedia.org/wiki/Prototype-based_programming) rather than static class-based inheritance. 

- Although it is a dynamic language, JS virtual machines such as [Google's V8](http://en.wikipedia.org/wiki/V8_(JavaScript_engine)) can achieve remarkably high performance through implicit Just-In-Time compilation to machine code.  

- The JS community is vast, and the available libraries, modules, frameworks, extensions, etc. are correspondingly huge. For example [npm](https://www.npmjs.org/) lists almost 60,000 (at time of writing) libraries for node.js desktop/server-side applications. 

- JS has become the language of choice for several Introduction to Computer Science (CS101) courses, including at [Stanford University](http://www.stanford.edu/class/cs101/) (also [here](https://www.coursera.org/course/cs101)). The Khan Academy also offers [a free, online course](https://www.khanacademy.org/cs).

## Additional learning resources:

- [Eloquent JavaScript](http://eloquentjavascript.net/contents.html)
- [W3C JavaScript Guide](http://www.w3schools.com/js/)
- [Mozilla JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)
- [Codecadamy](http://www.codecademy.com/tracks/javascript)
- [Khan Academy](https://www.khanacademy.org/cs/programming)
- [Stanford CS101](https://www.coursera.org/course/cs101)
- [The Node handbook](http://www.nodebeginner.org/)
- [How to Node](http://howtonode.org/)