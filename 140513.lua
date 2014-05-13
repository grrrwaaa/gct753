local terminator = " -- END!!!!! "
local numbers = {
	"1", "2", "3", "4", "5", "6", "7", "8", "9", 
}
local operators = {
	" + ", " + ", " - ", " * ", " * ", 
	" / ", " / ", " - ", 
	terminator
}

math.randomseed(os.time())

local target = math.pi

local popsize = 50
local genome_size = 19
local genome_range = #numbers

local mutation_probability = 0.03
local swap_probability = 0.1

local running = true
local generations = 1

-- create a population:
local pop = {}

-- seed the population with random genotypes:
function reset()
	generations = 1
	pop = {}
	for i = 1, popsize do
		local geno = {}
		for j = 1, genome_size do
			geno[j] = math.random(genome_range)
		end
		pop[i] = geno
	end
end

-- receive genotype, produce a phenotype:
function geno_develop(geno)
	local pheno = {}
	for i, gene in ipairs(geno) do
		local letter
		if i % 2 == 1 then
			letter = numbers[gene]
		else
			letter = operators[gene]
		end
		if letter == terminator then
			break
		end
		pheno[i] = letter
	end
	return table.concat(pheno)
end

function pheno_evaluate(pheno)
	local f = loadstring("return " .. pheno)
	if f then
		local result = f()
		if result then
			local len = #pheno
			local l = 1/len
			local err = math.abs(result - target)
			local fitness = l / (err + l)
			return fitness, result
		else
			return 0, "fail"
		end
	else
		-- function failed to compile
		-- fitness is zero
		return 0, "fail"
	end
end

reset()

for i, geno in ipairs(pop) do
	local pheno = geno_develop(geno)
	print(i, pheno)
	print("fitness", pheno_evaluate(pheno))
end

function generation()
	print("___________________________________")
	for i, g in ipairs(pop) do
		local pheno = geno_develop(g)
		local fitness, result = pheno_evaluate(pheno)
		-- mark genotype with fitness score:
		g.fitness = fitness
		g.result = result
		g.pheno = pheno
	end

	-- select the most fit candidates
	table.sort(pop, function(a, b)
		return a.fitness > b.fitness
	end)
	
	local g = pop[1]
	print(g.pheno, "fitness", g.fitness, g.result)
	local g = pop[ #pop ]
	print(g.pheno, "fitness", g.fitness, g.result)
	
	-- terminate?
	if pop[1].fitness == 1 then
		running = false
		print("CONGRATULATIONS!")	
		print("generations:", generations)
	end

	-- generate a new population
	local newpop = {}
	-- with variations on the most fit candidates
	for i = 1, popsize do
		local child = {}
		local appa = pop[ math.random(i) ]
		local omma = pop[ math.random(i) ]
		local splitpoint = math.random(genome_size)
		for j = 1, genome_size do
			if j < splitpoint then
				child[j] = appa[j]
			else 
				child[j] = omma[j]
			end
			-- TODO: variation
			if math.random() < mutation_probability then
				child[j] = math.random(genome_range)
				--child[j] = (( child[j] + (math.random(7)-4) ) % genome_range) + 1
			end
		end
		
		---[[		
		if math.random() < swap_probability then
			local a = math.random(genome_size)
			local b = math.random(genome_size)
			
			child[a], child[b] = child[b], child[a]
		end
		--]]
		
		newpop[i] = child
	end

	pop = newpop
	
	generations = generations + 1
end

function update()
	if running then
		generation()
	end
end

function key(e, k)
	if e == "down" then
		if k == "r" then
			reset()
			running = true
		else
			running = not running
		end
	end
end













