title: Software


# Software

We will be using the [Lua](www.lua.org) language (and the [LuaJIT](www.luajit.org) implementation) for lecture and lab sessions. Lua is very easy to learn, fast, flexible and powerful. It also scales well with abstraction, which is exactly what we will need as the course progresses. By itself, Lua is lightweight, with very few built-in libraries, and certainly no graphical or audio capabilities. For these purposes I am providing runtime implementation binaries that add audiovisual capabilities. 

## Download

The code and pre-compiled binaries are in the github repository at the links below. From time to time this repo will be updated with more examples and features, so please make sure to grab these changes. You can grab the zip directly or clone (or fork) the git repo and pull the changes:

- [Download](https://github.com/grrrwaaa/gct753/zipball/master) **ZIP file**
- [Download](https://github.com/grrrwaaa/gct753/tarball/master) **TAR ball**
- [Clone from](https://github.com/grrrwaaa/gct753) **Github**
- [Fork from](https://github.com/grrrwaaa/gct753/fork_select) **Github**

## Running

- **Windows:** drag a ```.lua``` file onto the ```av.exe``` application.
- **OSX / Linux:** open a terminal window, ```cd ``` to the downloaded folder, then run ```av_osx <filename>``` or ```av_linux <filename>``` where <filename> is the ```.lua``` file to run (e.g. ```draw.lua```).

While running, the **Esc** key will toggle full-screen mode, and the **Space** key will toggle the ```update``` function on and off. 

Also while the script is running it will monitor the ```.lua``` file for changes, and reload the script automatically if this file is updated on disk. To edit ```.lua``` files, any text editor will do. Freely available editors with Lua syntax highlighting include:

- **Windows:** [Notepad++](http://notepad-plus-plus.org/download/v6.3.html)
- **OSX:** [TextWrangler](http://www.barebones.com/products/textwrangler/)
- **Linux:** Most distributions already include a suitable text editor (such as Gedit), or can install one through apt-get.

## Reference

Most of the available functions and modules (both from Lua and AV) are [documented in the reference pages](docs/reference.html).

## Tutorial: Drawing with fields

See [Lua 5.1 quick tutorial](lua.html) for a quick introduction to the Lua language itself. 

Most scripts start with a bunch of ```require``` statements, which pull in needed functionality from external library *modules*. For example:

```lua
local field2D = require "field2D"
```

This code loads the *field2D* module (from /modules/field2D.lua), which gives us a bunch of utilities for working with 2D dense arrays. These could be useful for making cellular automata, for example. Modules usually return a table of functions. For example, the *field2D* module contains a function called *new*, which we can use to create a new field *object*:

```lua
-- allocate a field with default size:
local field = field2D.new()

-- allocate a field that is 64 cells wide and 48 cells high:
local field = field2D.new(64, 48)
```

Objects usually have internal state, and methods to read and modify that state or perform other behaviors. For example, we can set data in the field using the *:set* method:

```lua
-- set all cells to the value 0.2:
field:set(0.2)

-- set the cell at position (10,10) to the value 0.5:
field:set(0.5, 10, 10)
```

The *av* application looks at the script for specially named functions in order to know how to render the screen or handle mouse and keyboard input. For example, all graphical drawing should be put inside the global *draw* function. We can use another method of the *field2D* type object here:

```lua
-- the global function for rendering
function draw()
	-- use the :draw method of field2D to render the data stored in field:
	field:draw()
end
```

There are other functions like this; the *update* function is called frequently to update the state of the program (e.g. for animations); the *mouse* function is called whenever the mouse moves and clicks; and the *keydown* and *keyup* functions are called when keys are pressed. There are also some built-in key bindings: the Esc key will toggle full-screen, and the spacebar key will toggle updating on and off.

We can use the *mouse* function for example to draw into the field, whenever the mouse is down or dragging. The *mouse* function passes the kind of event, the button pressed, and the X and Y position of the mouse; but we will need to scale that position to the size of the field:

```lua
-- called whenever there is mouse activity:
function mouse(event, button, x, y)
	if event == "down" or event == "drag" then
		-- convert the mouse position from 0..1 range to the size of the field:
		local fieldx = x * field.width
		local fieldy = y * field.height
		-- write a random number into the field at this point:
		field:set(math.random(), fieldx, fieldy)
	end
end

-- called whenver a key is pressed:
function keydown(key)
	-- if the key pressed was "c"
	if key == "c" then
		-- set all cells of the field to zero:
		field:clear()
	end
end
```

If we wanted to add a continual behavior to the field, we could use the *update* global function. For example, this function copies the value from one randomly chosen cell to another randomly chosen cell:

```lua
-- called continually in the background:
-- (the argument is the time in seconds between updates)
function update(dt)
	-- pick a cell at random:
	local x = math.random(field.width)
	local y = math.random(field.height)
	-- get the value at this cell:
	local value = field:get(x, y)
	-- pick another cell at random:
	local x = math.random(field.width)
	local y = math.random(field.height)
	-- set this cell to the value of the first:
	field:set(value, x, y)
end
```

Another useful feature of *field2D:set* is that it can take a function as its argument, instead of a value. It calls this function to derive a new value for each cell in the field. The function receives as arguments the x and y position of the cell, so for example, this code initializes the field with a horizontal gradient:

```lua
field:set(function(x, y)
	return x / field.width
end)
```


We've learned almost enough now to implement Conway's *Game of Life*.

```lua
-- load in the "field2D" library module (from /modules/field2D.lua):
local field2D = require "field2D"

-- choose the size of the field
local dimx = 128
local dimy = dimx * 3/4 -- (with a 4:3 aspect ratio)

-- allocate the field
local field = field2D.new(dimx, dimy)

-- create a second field, to store the previous states of the cells:
local field_old = field2D.new(dimx, dimy)

-- create a function to return either 0 or 1
-- with a 50% chance of either (like flipping a coin)
function coin() 
	if math.random() < 0.5 then 
		return 0
	else
		return 1
	end
end

-- use this to initialize the field with random values:
-- (applies 'coin' to each cell of the field)
field:set(coin)

-- how to render the scene (toggle fullscreen with the Esc key):
function draw()	
	-- draw the field:
	field:draw()
end

-- the rule for an individual cell (at position x, y) in the field:
function game_of_life(x, y)

	-- check out the neighbors' previous states:
	local N  = field_old:get(x  , y+1)
	local NE = field_old:get(x+1, y+1)
	local E  = field_old:get(x+1, y  )
	local SE = field_old:get(x+1, y-1)
	local S  = field_old:get(x  , y-1)
	local SW = field_old:get(x-1, y-1)
	local W  = field_old:get(x-1, y  )
	local NW = field_old:get(x-1, y+1)
	local near = N + E + S + W + NE + NW + SE + SW
	
	-- check my own previous state:
	local C = field_old:get(x, y)
	
	-- apply the rule:
	if C == 1 then
		-- live cell
		if near < 2 then
			-- loneliness
			C = 0
		elseif near > 3 then
			-- overcrowding
			C = 0
		end
	else
		-- dead cell
		if near == 3 then
			-- reproduction
			C = 1
		end
	end
	
	-- return the new state:
	return C
end

-- update the state of the scene (toggle this on and off with spacebar):
function update(dt)
	-- swap field and field_old:
	-- (field now becomes old, and the new field is ready to be written)
	field, field_old = field_old, field
	
	-- apply the game_of_life function to each cell of the field: 
	field:set(game_of_life)
end

-- handle keypress events:
function keydown(k)
	if k == "c" then
		-- set all cells to zero:
		field:clear()
	elseif k == "r" then
		-- apply the coin rule to all cells of the field (randomizes)
		field:set(coin)
	end
end


-- handle mouse events:
function mouse(event, btn, x, y)
	-- clicking & dragging should draw values into the field:
	if event == "down" or event == "drag" then
		
		-- scale window coords (0..1) up to the size of the field:
		local x = x * field.width
		local y = y * field.height
	
		-- spread the updates over a wide area:
		for i = 1, 10 do
			-- pick a random cell near to the mouse position:
			local span = 3
			local fx = x + math.random(span) - math.random(span)
			local fy = y + math.random(span) - math.random(span)
			
			-- set this cell to either 0 or 1:
			field:set(coin(), fx, fy)
		end
	end
end
```