local field2D = require "field2D"
local draw2D = require "draw2D"
local vec2 = require "vec2"

math.randomseed(os.time())

local dim = 64
local f1 = field2D(dim, dim)
local f1_prev = field2D(dim, dim)

local agelimit = 1000
local constant_decay = 0.5
local carcass_energy = 50

local agents = {}

function food_splat(spot)
	for j = 1, math.random(100) do
		local spat = spot + vec2.random(math.random() * 0.1)
		-- very high density 
		f1:splat(math.random()*0.1, spat.x, spat.y)
	end
end

function reset()
	-- maybe like ten random spots with 
	for i = 1, math.random(8) + 4 do
		local spot = vec2(math.random(), 
		math.random())
		food_splat(spot)
	end
	-- then smooth it
	f1:diffuse(f1, 0.5)
	-- then normalize
	f1:normalize()
	
	-- make some agents
	agents = {}
	for i = 1, 10 do
		local a = {
			pos = vec2(math.random(), math.random()),
			dir = math.random() * math.pi * 2,
			size = 0.02,
			
			-- hunger 
			-- die
			-- move
			
			age = 0,
			
			energy = 1,
			
			-- sensors
			
			-- DNA
		}
		-- add it:
		agents[a] = true
	end
end
reset()


function update()
	
	if f1:sum() < 200 then
		print("adding")
		for i = 1, math.random(8) + 4 do
			local spot = vec2(math.random(), 
			math.random())
			food_splat(spot)
		end
		print(f1:sum())
	end

	-- update the field:
	--[[
	for i = 1, 10 do
		local x1, y1 = math.random(dim), math.random(dim)
		local x2 = x1 + math.random(3)-2
		local y2 = y1 + math.random(3)-2
		local v1 = f1:get(x1, y1)
		local v2 = f1:get(x2, y2)
		f1:set(v1, x2, y2)
		f1:set(v2, x1, y1)
	end
	--]]
	
	f1_prev:diffuse(f1, 0.0005)
	-- swap it:
	f1, f1_prev = f1_prev, f1

	for a in pairs(agents) do
		
		-- update agent a
		a.age = a.age + 1
		
		-- sensing:
		local f = f1:sample(a.pos.x, a.pos.y)
		-- make sure food is always positive or zero:
		f = math.max(f, 0)
		
		-- eat the food:
		f1:splat(-f, a.pos.x, a.pos.y)
		
		a.energy = a.energy + f * 0.9
		
		a.size = a.size + f * 0.001
		
		-- decay factor:
		a.energy = a.energy - constant_decay * a.size
		
		
		-- steering:
		local forward = 0.01 * math.random()
		local crab = 0
		local turn = (math.random() - 0.5)
		
		-- locomotion:
		a.dir = a.dir + turn
		local vel = vec2(forward, crab)
		-- rotate to world space:
		vel:rotate(a.dir)
		a.pos:add(vel):mod(1)
		
		-- who might die here now
		--if a.age > agelimit then agents[a] = nil end
		if a.energy <= 0 then 
			f1:splat(a.size * carcass_energy, a.pos.x, a.pos.y)
			agents[a] = nil 
		end
		
		-- or who might have a baby
		-- agents[baby] = true
		
	end
end

function draw()	
	-- draw the field in green:
	draw2D.color(0, 1, 0)
	f1:draw()
	
	for a in pairs(agents) do
		draw2D.push()
			draw2D.translate(a.pos.x, a.pos.y)
			draw2D.rotate(a.dir)
			draw2D.scale(a.size, a.size)
			
			draw2D.color(1, 0.5, 1)
			draw2D.rect(0, 0, 2, 0.5)
			draw2D.color(1, 1, 0)
			draw2D.circle(1, 0.5, 0.5)
			draw2D.circle(1, -0.5, 0.5)
		draw2D.pop()
	end
end

function mouse(e, b, x, y)
	if e == "down" or e == "drag" then
		food_splat(vec2(x, y))
	end
end

function key(e, k)
	if e == "down" and k == "r" then
		regenerate()
	end
end














