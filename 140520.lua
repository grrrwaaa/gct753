local field2D = require "field2D"
local draw2D = require "draw2D"
--print(bit.band)

math.randomseed(os.time())

local dim = 400
win:setdim(dim, dim)

local red = field2D(dim, dim)
local green = field2D(dim, dim)
local blue = field2D(dim, dim)

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

function geno_develop(geno)
	local pheno = {
		"local r1, r2 = ...",
	}
	local rid
	
	-- first gene encodes constants:
	local gene = geno[1]
	local code = string.format("local r3, r4, r5 = %i, %i, %i", gene[1], gene[2], gene[3])
	pheno[#pheno+1] = code
	
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
		pheno[#pheno+1] = code
	end
	pheno[#pheno+1] = string.format("return r%i, r%i, r%i", rid, rid-1, rid-2)
	-- convert list of instructions into one big string of code
	local result = table.concat(pheno, "\n")
	-- convert generated code into a Lua function:
	local f = loadstring(result)
	-- return both function and code
	return f, result
end

local geno
local pheno

function regenerate()
	geno = geno_create(20)
	pheno, code = geno_develop(geno)
	print(code)
	
	-- update the images:
	for y = 1, dim do
		for x = 1, dim do			
			-- convert to normalized range (-1, 1):
			local xn = (x/(dim-1)) * 2 - 1
			local yn = (y/(dim-1)) * 2 - 1
			
			-- the actual function:
			local r, g, b = pheno(xn, yn)
			
			red:set(r, x, y)
			green:set(g, x, y)
			blue:set(b, x, y)
		end
	end
	
	red:normalize()
	green:normalize()
	blue:normalize()
end

regenerate()


function draw()
	draw2D.color(1, 0, 0)
	red:draw()
	
	draw2D.color(0, 1, 0)
	green:draw()
	
	draw2D.color(0, 0, 1)
	blue:draw()
end

function key(e, k)
	if e == "down" and k == "r" then
		regenerate()
	end
end














