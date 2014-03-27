-- load in the "field2D" library module (from /modules/field2D.lua):
local field2D = require "field2D"
local draw2D = require "draw2D"

-- choose the size of the field
local dimx = 256
local dimy = dimx * 3/4 -- (with a 4:3 aspect ratio)

-- allocate the field
local field = field2D.new(dimx, dimy)

-- create a second field, to store the previous states of the cells:
local field_old = field2D.new(dimx, dimy)
local field_old_old = field2D.new(dimx, dimy)

local min, max = math.min, math.max
local ceil, floor = math.ceil, math.floor

-- create a function to return either 0 or 1
-- with a 50% chance of either (like flipping a coin)
function coin() 
	if math.random() < 0.9 then 
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
function transition(x, y)
	
	local N   =  field_old:get(x  , y+1) == 1 and 1 or 0
	local NE  =  field_old:get(x+1, y+1) == 1 and 1 or 0
	local E   =  field_old:get(x+1, y  ) == 1 and 1 or 0
	local SE  =  field_old:get(x+1, y-1) == 1 and 1 or 0
	local S   =  field_old:get(x  , y-1) == 1 and 1 or 0
	local SW  =  field_old:get(x-1, y-1) == 1 and 1 or 0
	local W   =  field_old:get(x-1, y  ) == 1 and 1 or 0
	local NW  =  field_old:get(x-1, y+1) == 1 and 1 or 0
	local near = N + E + S + W + NE + NW + SE + SW
	local C = field_old:get(x, y)
	
	if C == 1 then 
		return 0.5
	elseif C == 0.5 then
		return 0
	elseif C == 0 and near == 2 then
		return 1
	else 
		return 0
	end
end

-- update the state of the scene (toggle this on and off with spacebar):
function update(dt)
	-- swap fields
	field, field_old = field_old, field
	
	-- apply the game_of_life function to each cell of the field: 
	field:set(transition)
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

