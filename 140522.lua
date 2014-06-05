local field2D = require "field2D"
local draw2D = require "draw2D"

math.randomseed(os.time())

local dim = 400
win:setdim(900, 100)

local mutation_probability = 0.1
local jump_probability = 0.5

local bitmax = 2^32 - 1

function add(a, b) return a + b end
function sub(a, b) return a - b end
function mul(a, b) return a * b end
function div(a, b) return a / b end
function round(a, b) return math.ceil(a / b) * b end
min = math.min
max = math.max
abs = math.abs
exp = math.exp
log = math.log

sin = math.sin
atan2 = math.atan2
cos = math.cos

gt = function(a, b) 
	if a > b then
		return 1
	else 
		return 0
	end
end

noise = function() return math.random() end

function mod(a, b) return a % b end
function band(a, b) return (bit.band(math.abs(a) * bitmax, math.abs(b) * bitmax) / bitmax) % 1 end
function bor(a, b) return (bit.bor(math.abs(a) * bitmax, math.abs(b) * bitmax) / bitmax) % 1 end
function bxor(a, b) return (bit.bxor(math.abs(a) * bitmax, math.abs(b) * bitmax) / bitmax) % 1 end



local operators = {
	"add", "sub", "mul", "div", 
	"abs", "mod", "min", "max", "exp", "log", "round",
	"band", "bor", "bxor",
	"sin", "cos", "atan2",
	"gt",
	"noise",
}
local num_operators = #operators

-- n is number of genes
function geno_create(n)
	local geno = {}
	for i = 1, n do	
		local gene = {}
		for j = 1, 3 do
			gene[j] = math.random(num_operators)
		end
		geno[i] = gene
	end	
	return geno
end

local population_size = 9

local population = {}


function develop(candidate)
	local geno = candidate.geno
	local statements = {
		"local r1, r2 = ...",
	}
	local rid
	
	-- first gene encodes constants:
	local gene = geno[1]
	local code = string.format("local r3, r4, r5 = %i, %i, %i", gene[1], gene[2], gene[3])
	statements[#statements+1] = code
	
	-- rest of genes are operators:
	for i = 2, #geno do
		local gene = geno[i]
		local op = operators[ gene[1] ]
		local arg1 = gene[2]
		local arg2 = gene[3]
		rid = i + 4
		local a1 = math.max(1, rid - arg1)
		local a2 = math.min(rid - 1, arg2)
		local code = string.format("local r%i = %s(r%i, r%i)", rid, op, a1, a2)
		statements[#statements+1] = code
	end
	statements[#statements+1] = string.format("return r%i, r%i, r%i", rid, rid-1, rid-2)
	-- convert list of instructions into one big string of code
	candidate.code = table.concat(statements, "\n")
	--print(candidate.code)
	-- convert generated code into a Lua function:
	candidate.func = loadstring(candidate.code)
	
	-- update the images:
	for y = 1, dim do
		for x = 1, dim do			
			-- convert to normalized range (-1, 1):
			local xn = (x/(dim-1)) * 2 - 1
			local yn = (y/(dim-1)) * 2 - 1
			
			-- the actual function:
			local r, g, b = candidate.func(xn, yn)
			
			candidate.red:set(r, x, y)
			candidate.green:set(g, x, y)
			candidate.blue:set(b, x, y)
		end
	end
	
	candidate.red:normalize()
	candidate.green:normalize()
	candidate.blue:normalize()
end


for i = 1, population_size do
	-- create a new candidate:
	population[i] = {
		-- has a genome:
		geno = geno_create(50),
		fitness = 0,
		-- has 3 fields:
		red = field2D(dim, dim),
		green = field2D(dim, dim),
		blue = field2D(dim, dim),
	}
	
	develop( population[i] )
end

function regenerate()
	-- sort population by fitness:
	table.sort(population, function(a, b)
		return a.fitness > b.fitness
	end)
	
	-- generate a new population
	local newpop = {}
	-- with variations on the most fit candidates
	for i = 1, population_size do
		local child = {
			geno = {},
			fitness = 0,
			-- has 3 fields:
			red = population[i].red,
			green = population[i].green,
			blue = population[i].blue,
		}
		local appa = population[ math.random(i) ]
		
		-- copy in the parent genes
		for j, gene in ipairs(appa.geno) do
			child.geno[j] = {
				gene[1], gene[2], gene[3]
			}
			-- with small chance of mutation
			if math.random() < mutation_probability then
				local childgene = child.geno[j]
				for k = 1, 3 do
					childgene[k] = math.random(num_operators)
				end
			end
		end
		
		for i = 1, 3 do
			if math.random() < jump_probability then
				local a = math.random(#child.geno)
				local b = math.random(#child.geno)
			
				child.geno[a], child.geno[b] = child.geno[b], child.geno[a]
			
			end
		end		
		develop( child )
		
		newpop[i] = child
	end
	-- replace existing population:
	population = newpop
	
	collectgarbage()
end

function draw()	
	for i, candidate in ipairs(population) do
		draw2D.color(1, 0, 0)
		candidate.red:draw(
			(i-1)/population_size, 0,	-- x, y
			1/population_size, 1)		-- w, h
		
		draw2D.color(0, 1, 0)
		candidate.green:draw(
			(i-1)/population_size, 0,	-- x, y
			1/population_size, 1)		-- w, h
		
		draw2D.color(0, 0, 1)
		candidate.blue:draw(
			(i-1)/population_size, 0,	-- x, y
			1/population_size, 1)		-- w, h
	end
end

function mouse(e, b, x, y)
	if e == "down" then
		local i = math.floor(9*x + 1)
		local candidate = population[i]
		candidate.fitness = candidate.fitness + 1
	end
end

function key(e, k)
	if e == "down" and k == "r" then
		regenerate()
	end
end














