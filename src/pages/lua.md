title: Lua


## Lua

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


# Lua 5.1 quick tutorial

Commonly compared to: JavaScript, Ruby, Python, Scheme. Notable characteristics:

- Fast (used widely for game engines). [LuaJIT](www.luajit.org) can approach and sometimes exceed C. 
- Clean & powerful array/dictionary data structure (table)
- Proper lexical scoping
- First-class functions
- Coroutines 
- Garbage collected
- Prototype inheritance (similar to [Self](http://en.wikipedia.org/wiki/Self_(programming_language))
- Small, portable & easy to embed with C
- [MIT license](http://www.opensource.org/licenses/mit-license.php)

## Syntax

```lua
-- Two dashes create a comment that ends at the line break
print("hello world")
-- Note: no need for semicolons to terminate statements.
```

### Simple types

```lua
-- Unlike C, the type information is stored with the value, not the variable; 
-- this means that the type of a variable can change dynamically.
x = 1 			-- x now refers to a number
x = "foo" 		-- x now refers to a string

-- check types like this:
if type(x) == "number" then 
	-- do stuff
end

-- these lines are all equivalent
-- they assign the number value 1 to the variable name x:
x = 1
x = 1.0
x = 100e-2  -- e base10 format
x = 0x1 --hexadecimal format
-- Note: all numbers in Lua are 64-bit doubles

-- strings:
print("a simple string")
print('a simple string')

-- embedding special characters and multi-line strings:
x = 'escape the \' character, and write \n a new line'
x = [[
The double square brackets are a simple way to write strings
that span
over several
lines]]

-- Boolean values:
t = true
f = false
if t then print("t!") end -- prints t!
if f then print("f!") end -- prints nothing

-- nil indicates the absence of value. 
-- Assigning nil to a variable marks the variable for garbage collection.
n = nil
-- nil also evaluates to false for a predicate:
if n then print("n!") end -- prints nothing
```

### Structured data

Lua provides only one data structure: the *table*. Tables in Lua are associative arrays, mapping **keys** to **values**. Both keys and values can be *any* valid Lua type except nil. However, the implementation makes sure that when used with continuous number keys, the table performs as a fast array. 

```lua
-- creating an array-like table of strings, the quick way:
t = { "one", "two", "three" }

-- creating a dictionary-like table, the quick way:
t = { one = 1, two = 2, three = 3 }

-- creating a table with both array-like and dictionary-like parts:
t = { "one", "two", "three", one = 1, two = 2, three = 3 }

-- create an empty table:
t = {}

-- add or replace key-value pairs in the table:
t[1] = "one"	-- array-like
t["two"] = 2	-- dictionary-like
-- a simpler way of saying that:
t.two = 2

print(t.two, t["two"]) 	--> 2 2

-- remove a key-value pair by assigning the value nil:
t.two = nil
print(t.two)			--> <nil>

-- create a table with a sub-table:
t = {
	numbers = { 1, 2, 3 },
	letters = { "a", "b", "c" },
}

-- any Lua type (except nil) can be used as key or value
-- (including functions, other tables, the table itself, ...)
t[x] = t
```

It’s important to remember that a Lua table has two parts; an array-portion and a hash-table portion. The array portion is indexed with integer keys, starting from 1 upwards. All other keys are stored in the hash (or record) portion.

The array portion gives Lua tables the capability to act as ordered lists, and can grow/shrink as needed (similar to C++ vectors). Sometimes the array portion is called the list portion, because it is useful for creating lists similarly to LISP. In particular, the table constructor will insert numeric keys in order for any values that are not explicitly keyed:

```lua
-- these two lines are equivalent
local mylist = { [1]="foo", [2]="bar", [3]="baz" }:
local mylist = { "foo", "bar", "baz" }

print(mylist[2]) 			--> bar
		
print(unpack(mylist)) 		--> foo bar baz 
```

Remember that Lua expects most tables to count from 1, not from 0.

### Iterating a table

To visit **all** key-value pairs of a table, use a for loop like the following. Note that the order of traversal is undefined; it may be different each time.

```lua
for key, value in pairs(mytable) do
	-- do things with the key and value
end
```

To visit **only** array-portion of a table, use one of these forms:

```lua
for i = 1, #mytable do
	local value = t[i]
	-- do things with the key and value
end

for key, value in ipairs(mytable) do
	-- do things with the key and value
end
```

### Functions

Unlike C, functions are first-class values, just like numbers, strings and tables. That means that functions can take functions as arguments, functions can return other functions as return values, functions can be keys and values in tables. It also means that functions can be created and garbage collected dynamically.

Functions can be declared in several ways:

```lua
-- these are equivalent:
sayhello = function(message)
  print("hello", message)
end

function sayhello(message)
  print("hello", message)
end

-- using the function:
sayhello("me")  -- prints: hello me
sayhello("you") -- prints: hello you

-- replacing the function
sayhello = function(message)
  print("hi", message)
end

sayhello("me")  -- prints: hi me
```

Functions can zero or more arguments. In Lua, they can also have more than one return vaue:

```lua
function minmax(a, b)
  return math.min(a, b), math.max(a, b)
end
print(minmax(42, 13)) -- prints: 13 42
```

### Logic and control flow

```lua
-- if blocks:
if x == 1 then
  print("one")
  -- as many elseifs as desired can be chained
elseif x == 2 then
  print("two")
elseif x == 3 then
  print("three")
else
  print("many")
end

-- while loops:
x = 10
while x > 0 do
  print(x)
  x = x - 1
end

repeat
  print(x)
  x = x + 1
until x == 10

-- numeric for loop:
-- count from 1 to 10
for i = 1, 10 do 
	print(i) 
end		
-- count 1, 3, 5, 7, 9:
for i = 1, 10, 2 do 
	print(i) 
end
-- count down from 10 to 1:
for i = 10, 1, -1 do 
	print(i) 
end

-- logical operators:
if x == y then print("equal") end
if x ~= y then print("not equal") end
if x > 0 and x < 1 then print("between 0 and 1") end
```

### Lexical scoping

If a variable is declared `local`, it exists for any code that follows it, until the `end` of that block. If a variable is not declared local, it becomes a global variable, belonging to the entire script. Use local variables as much as possible, as they are faster, and reduce bugs.

```lua
function foo(x)
  -- a function body is a new block
  local y = "mylocal"
  if x == y then
    -- this is a sub-block of the function
    -- y is still visible here
    print(y)  -- prints: mylocal
  end
end
-- y is not visible here:
print(y)    -- prints: nil
```

Assigning to a variable that has not been declared locally within the current block will search for that name in parent blocks, recursively, up to the top-level. If the name is found, the assignment is made to that variable. If the name is not found, the assignment becomes a global (either creating a new variable, or replacing an existing global). 

```lua
-- an outer variable:
local x = "outside"
print(x) -- prints: outside

-- sub-block uses a local, which does not affect the outer variable:
function safe()
  local x = "inside"
end
safe()
print(x) -- prints: outside

-- sub-block does not use a local, and overwrites the outer variable:
function unsafe()
  x = "inside"
end
unsafe()
print(x) -- prints: inside
```

### Method syntax

Objects in Lua that have functions as members can invoke these functions using a special colon syntax:

```lua
-- create an object:
myobject = { value = 10 }

-- add a function:
myobject.printvalue = function(self)
	print(self.value)
end

-- test it:
myobject.printvalue(myobject)	--> 10

-- use the colon syntax instead passes the 'self' argument implicitly:
function myobject:printvalue()
	print(self.value)
end

myobject:printvalue()			--> 10
```

### Closures

Closures arise from the mixed use of lexically scoped local variables, and higher order functions. Any function that makes use of non-local variables effectively keeps those variable references alive within it. An example explains this better:

```lua
function make_counter()
  local count = 0
  return function()
    count = count + 1
    print(count)
  end
end

-- call to make_counter() returns a function;
-- and 'captures' the local count as an 'upvalue' specific to it
local c1 = make_counter()
c1()  -- prints: 1
c1()  -- prints: 2
c1()  -- prints: 3

-- another call to make_counter() creates a new function,
-- with a new count upvalue
local c2 = make_counter()
c2()  -- prints: 1
c2()  -- prints: 2

-- the two function's upvalues are independent of each other:
c1()  -- prints: 4
```

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

## Going deeper

We will address more complex topics of metatables, coroutines, the C API, the LuaJIT FFI and so on as we need them.

## Help

[Reference manual](http://www.lua.org/manual/5.1); bookmark the [contents](http://www.lua.org/manual/5.1/index.html#index).

*Excellent* text-book: [Programming in Lua (second edition)](http://www.lua.org/docs.html#books)
![PIL](http://www.lua.org/images/pil2.jpg)





