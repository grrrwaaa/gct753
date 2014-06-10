local field2D = require "field2D"
local draw2D = require "draw2D"
local vec2 = require "vec2"

math.randomseed(os.time())

win:setdim(512, 512)

local dim = 256
local f1 = field2D(dim, dim)
local f1_prev = field2D(dim, dim)

local genome_size = 20
local population_size = 200
local mutation_rate = 0.2

local agelimit = 1000
local constant_decay = 3
local carcass_energy = 1
reproduction_rate = 0.005
local reproduction_threshold = 20
local growth_rate = 0.0003

function add(a, b) return a + b  end
function sub(a, b) return a - b end
function mul(a, b) return a * b end
function sin(a, b) return math.sin(a) end
function cos(a, b) return math.cos(a) end
function log(a, b) return math.log(math.abs(a)) end
function exp(a, b) return math.exp(a) end
function atan2(a, b) return math.atan2(a, b) end
function gt(a, b) 
	if a > b then 
		return 1 
	else 
		return 0 
	end 
end
function max(a, b) return math.max(a, b) end
function min(a, b) return math.min(a, b) end
function abs(a, b) return math.abs(a) end
function sign(a, b) 
	if a > 0 then return 1
	elseif a < 0 then return -1
	else return 0 end
end
function random(a, b) return math.random() end
local e = math.exp(1)
function sigmoid(x)
	return 1 / (1 + e^(-x))
end

local operators = {
	"add", "sub", "mul", "sin", "cos", "exp", "atan2", "gt", "max", "min", "abs", "sign", "random", "sigmoid", 
}

local agents = {}

function food_splat(spot)
	for j = 1, dim do
		local spat = spot + vec2.random(math.random() * 0.1)
		-- very high density 
		f1:splat(math.random()*0.01*dim, spat.x, spat.y)
	end
end


function develop(a)

	-- derive color from gene:
	local lastgene = a.genome[#a.genome]
	a.color = { 
		g=lastgene[1]/30, 
		r=lastgene[2]/30, 
		b=lastgene[3]/30, 
	}
	

	local statements = {
[[
a = ...
local r1 = a.sensed_food
local r2 = a.energy
local r3 = a.memory[1]
local r4 = a.memory[2]
local r5 = a.memory[3]
local r6 = a.memory[4]
local r7 = a.memory[5]
local r8 = a.memory[6]
local r9 = a.memory[7]
]]
	}
	
	statements[#statements+1] = "-- process:"
	-- build statements...
	local rid
	for i, gene in ipairs(a.genome) do
		rid = i + 9
		
		-- operator:
		local opname = operators[ gene[1] ]
		local a1 = math.min(rid - 1, gene[2])
		local a2 = math.max(1, rid - gene[3])
		
		statements[#statements+1] = 
			"local r" .. rid .. " = " .. opname .. "(r" .. a1 .. ", r" .. a2 .. ")" 
	end
	
	statements[#statements+1] = "-- outputs:"
	-- build return:
	statements[#statements+1] = "a.forward = sigmoid(r" .. rid .. ")"
	statements[#statements+1] = "a.crab = sigmoid(r" .. (rid-1) .. ")"
	statements[#statements+1] = "a.turn = sigmoid(r" .. (rid-2) .. ")"
	
	for i = 1, 7 do
		statements[#statements+1] = "a.memory[" .. i .. "] = sigmoid(r" .. (rid - i - 2) .. ")"
	end
	
	-- finish:
	local code = table.concat(statements, "\n");
	--print(code)
	
	local func = loadstring(code)
	--print(func)
	
	return func
end

function genome_create()
	local g = {}
	for i = 1, genome_size do
		local gene = {
			math.random(#operators),
			math.random(29),
			math.random(29),
		}
		g[i] = gene
	end
	return g
end

function agent_inherit(a, parent)
	-- copy parent's genome into agent 'a':
	a.genome = {}
	for i, gene in ipairs(parent.genome) do
		-- copy parent's gene:
		a.genome[i] = { gene[1], gene[2], gene[3] }
	end
	
	if math.random() < mutation_rate then
		-- gene mutation:
		local idx = math.random(#a.genome)
		a.genome[idx] = {
			math.random(#operators),
			math.random(29),
			math.random(29),
		}
	
		-- jump mutation:
		local idx1 = math.random(#a.genome)
		local idx2 = math.random(#a.genome)
		a.genome[idx1], a.genome[idx2] = a.genome[idx2], a.genome[idx1]
	end
end

function agent_reproduce(a)
	if a.energy > reproduction_threshold*a.size*4 then
		-- reproduce:
		local baby = agent_create()
		baby.pos:set(a.pos)
		-- share & lose energy:
		a.energy = a.energy - reproduction_threshold*a.size*2
		baby.energy = reproduction_threshold*a.size
		-- make baby inherit our genes:
		agent_inherit(baby, a)
		-- develop the baby!
		develop(baby)
	end
end

function agent_create()
	local a = {
		pos = vec2(math.random(), math.random()),
		dir = math.random() * math.pi * 2,
		size = 0.02,
		
		sensed_food = 0,
		energy = 1,
		age = 0,
		
		-- seven deadly memory cells:
		memory = { 0, 0, 0, 0, 0, 0, 0 },
		
		genome = genome_create(),
	}
	
	-- convert the genome into a phenotypic brain:
	a.think = develop(a)
	
	-- add it:
	agents[a] = true
	-- return it:
	return a
end

function reset()
	-- maybe like ten random spots with 
	for i = 1, 50 do
		local spot = vec2(math.random(), 
		math.random())
		food_splat(spot)
	end
	-- then smooth it
	f1:diffuse(f1, 0.5)
	f1:diffuse(f1, 0.5)
	f1:diffuse(f1, 0.5)
	-- then normalize
	f1:normalize()
	
	-- make some agents
	agents = {}
	for i = 1, population_size do
		agent_create()
	end
end
reset()


function update()
	
	if f1:sum()/(dim*dim) < 0.05 then
		for i = 1, math.random(8) + 4 do
			local spot = vec2(math.random(), 
			math.random())
			food_splat(spot)
		end
		print("added food", f1:sum())
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
	
	f1_prev:diffuse(f1, 0.005)
	-- swap it:
	f1, f1_prev = f1_prev, f1
	
	for a in pairs(agents) do		
		-- update agent a
		a.age = a.age + 1

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
			a.forward * a.size * 0.05, 
			(a.crab-0.5) * a.size * 0.01
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
		if math.random() < reproduction_rate then
			agent_reproduce(a)
		end
		
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
			
			--draw2D.color(1, 0.5, 1)
			draw2D.color(a.color.r, a.color.g, a.color.b)
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
		reset()
	end
end














