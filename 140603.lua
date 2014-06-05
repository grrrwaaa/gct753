local field2D = require "field2D"
local draw2D = require "draw2D"
local vec2 = require "vec2"

math.randomseed(os.time())

local dim = 64
local f1 = field2D(dim, dim)
local f1_prev = field2D(dim, dim)

local agelimit = 1000
local constant_decay = 0.8
local carcass_energy = 50
local reproduction_rate = 0.005
local reproduction_threshold = 20
local growth_rate = 0.0003

local agents = {}

local e = math.exp(1)
function sigmoid(x)
	return 1 / (1 + e^(-x))
end

function food_splat(spot)
	for j = 1, math.random(100) do
		local spat = spot + vec2.random(math.random() * 0.1)
		-- very high density 
		f1:splat(math.random()*0.1, spat.x, spat.y)
	end
end

function default_agent_think(a)		
	-- a.sensed_food
	local r1 = a.sensed_food
	local r2 = a.energy
	
	local r10 = (math.random() - 0.5) * 100
	local r11 = math.random()
	local r12 = math.random() - 0.5
	local r13 = math.random()
	
	-- steering:
	a.forward = sigmoid(r10)
	a.crab = sigmoid(r11)
	a.turn = sigmoid(r12)
	
	if sigmoid(r13) < reproduction_rate then
		agent_reproduce(a)
	end
end

function develop(a)
	local statements = {
		"a = ...",
		"local r1 = a.sensed_food",
		"local r2 = a.energy",
	}
	
	-- build statements...
	for i, gene in ipairs(a.genome) do
		local rid = i + 2
		local expr
		if i == 1 then
			-- constants:
			expr = gene[1]
		else
			-- operator:
			local op = gene[1]
			local opname = "add"
			
			a1 = math.min(rid - 1, gene[2])
			a2 = math.max(1, rid - gene[3])
			
			expr = opname .. "(r" .. a1 .. ", r" .. a2 .. ")" 
		end
		statements[#statements+1] = "local r" .. rid .. " = " .. expr
	end
	
	-- build return:
	statements[#statements+1] = "a.forward = sigmoid(r" .. 10 .. ")"
	statements[#statements+1] = "a.crab = sigmoid(r" .. 11 .. ")"
	statements[#statements+1] = "a.turn = sigmoid(r" .. 12 .. ")"
	
	-- finish:
	local code = table.concat(statements, "\n");
	print(code)
end

function agent_reproduce(a)
	if a.energy > reproduction_threshold*a.size*4 then
		-- reproduce:
		local baby = agent_create()
		baby.pos:set(a.pos)
		-- share & lose energy:
		a.energy = a.energy - reproduction_threshold*a.size*2
		baby.energy = reproduction_threshold*a.size
	end
end

function agent_create()
	local a = {
		pos = vec2(math.random(), math.random()),
		dir = math.random() * math.pi * 2,
		size = 0.02,
		
		energy = 1,
		
		think = default_agent_think,
	}
	-- add it:
	agents[a] = true
	-- return it:
	return a
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
		agent_create()
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
		--a.age = a.age + 1
		
		-- sensing:
		local f = f1:sample(a.pos.x, a.pos.y)
		-- make sure food is always positive or zero:
		f = math.max(f, 0)
		a.sensed_food = f
		
		-- metabolism:
		f1:splat(-f, a.pos.x, a.pos.y)
		a.energy = a.energy + f * 0.9
		a.size = a.size + f * growth_rate
		-- decay factor:
		a.energy = a.energy - constant_decay * a.size
		
		-- use the grey matter:
		a.think(a)
		
		-- locomotion:
		a.dir = a.dir + (a.turn - 0.5)
		local vel = vec2(
			a.forward * a.size * 0.3, 
			(a.crab-0.5) * a.size * 0.1
		)
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














