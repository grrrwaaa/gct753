local draw2D = require "draw2D"
local field2D = require "field2D"
local gl = require "gl"
local vec2 = require "vec2"

-- make each run different:
math.randomseed(os.time())


-- the flow field
local dimx = 128
local dimy = dimx
local flow = field2D(dimx, dimy)

-- fill with different directions:
flow:set(function(x, y)
	local a = math.sin(math.pi * 3 * x/dimx * x/dimx)
	local b = math.cos(math.pi * 2 * y/dimy * y/dimy) 
	return 0.5 + 0.5 * (a * b)
end)


function reset_field()
	flow:set(function() return math.random() end)
	flow:diffuse(flow, 2)
	flow:diffuse(flow, 1)
	flow:diffuse(flow, 2)
	flow:normalize()
end

reset_field()

-- create a few agents:
local agents = {}
for i = 1, 50 do
	local a = {
		pos = vec2.random(),
		vel = vec2(),
		direction = math.pi * 2 * math.random(),
		scale = 0.1,
	}
	agents[i] = a
end

function update()
	for i, a in ipairs(agents) do
		-- read local field:
		local dir = math.pi * 2 * flow:sample(a.pos.x, a.pos.y)		
		-- use this direction to create a force vector:
		local F = vec2.fromPolar(0.1, dir)
		
		-- apply force
		a.vel:add(F)
		a.vel:limit(0.01)		
		-- integrate velocity to position
		a.pos:add(a.vel)
		-- wrap at edges
		a.pos:mod(1)
		
		-- derive direciton:
		a.direction = dir
	end
end
	
function draw()
	-- draw field in background:
	flow:draw()
	-- then draw agents:
	for i, a in ipairs(agents) do
		draw2D.push()
			draw2D.translate(a.pos.x, a.pos.y)
			draw2D.rotate(a.direction)
			draw2D.scale(a.scale, a.scale)
			
			draw2D.color(1, 0., 0.5)
			draw2D.rect(0, 0, 0.1, 0.1)
			draw2D.line(0, 0, -0.2, 0)
		draw2D.pop()
	end
end

function reset()
	reset_field()
	for i, a in ipairs(agents) do
		a.pos:randomize()
	end
end

function keydown(k)
	if k == "r" then
		reset()
	end
end