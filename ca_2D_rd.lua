
-- Just the first steps in creating a reaction-diffusion system:

local field2D = require "field2D"

math.randomseed(os.time())
local floor = math.floor
local min = math.min

-- choose the size of the field
local dimx = 400
local dimy = dimx * 3/4 -- (with a 4:3 aspect ratio)

-- allocate the field
local field = field2D.new(dimx, dimy)

-- create a second field, to store the previous states of the cells:
local field_old = field2D.new(dimx, dimy)

local activation_rate = 0.01
local inhibition_rate = 0.01

local activation_radius = 1
local inhibition_radius = 5

function initialize()
	return math.random()
end

-- use this to initialize the field:
field:set(initialize)

-- the min & max values of the field:
local min = 0
local max = 1

-- convert a cell from the min..max range to the 0..1 range:
function normalize(x, y)
	return (field:get(x, y) - min) / (max - min)
end

-- this is highly inaccurate; this measures a rectangular border, not a circular radius.
function concentration_at_radius(x, y, r)

	-- check out the neighbors' previous states:
	local N  = field_old:get(x  , y+r)
	local NE = field_old:get(x+r, y+r)
	local E  = field_old:get(x+r, y  )
	local SE = field_old:get(x+r, y-r)
	local S  = field_old:get(x  , y-r)
	local SW = field_old:get(x-r, y-r)
	local W  = field_old:get(x-r, y  )
	local NW = field_old:get(x-r, y+r)
	
	return (N + NE + E + SE + S + SW + W + NW) / 8
end

-- the rule for an individual cell (at position x, y) in the field:
function reaction(x, y)
	
	-- check my own previous state:
	local C = field_old:get(x, y)
	
	local activator = concentration_at_radius(x, y, activation_radius)
	local inhibitor = concentration_at_radius(x, y, inhibition_radius)
	
	if activator > inhibitor then
		C = C + activation_rate
	else
		C = C - inhibition_rate
	end
	
	-- update min/max:
	min = math.min(C, min)
	max = math.max(C, max)
	
	-- return the new state:
	return C
end

-- update the state of the scene (toggle this on and off with spacebar):
function update(dt)
	-- swap field and field_old:
	-- (field now becomes old, and the new field is ready to be written)
	field, field_old = field_old, field
	
	-- reset the min, max:
	min = 0.5
	max = 0.5
	
	--[[
	-- add a probabilistic effect:
	activation_radius = math.random(4)
	inhibition_radius = activation_radius + math.random(4)
	--]]
	
	-- run the simulation:
	field:set(reaction)
	
	-- make sure all cells are in the 0..1 range 
	field:set(normalize)
end


-- how to render the scene (toggle fullscreen with the Esc key):
function draw()	
	-- draw the field:
	field:draw()
end

-- handle keypress events:
function keydown(k)
	if k == "r" then
		-- apply the coin rule to all cells of the field (randomizes)
		field:set(initialize)
	elseif k == "c" then
		field:clear()
	end
end

-- handle mouse events:
function mouse(event, btn, x, y)
	-- clicking & dragging should draw trees into the field:
	if event == "down" or event == "drag" then
		field:set(math.random(), x * field.width, y * field.height)
	end
end
