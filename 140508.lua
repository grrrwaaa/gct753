local letters = {
 "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", " " 
}

local target = "helloworld"

local popsize = 20
local genome_size = #target
local genome_range = #letters

local mutation_probability = 0.01
local swap_probability = 0.5

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

function pop_print()
	for i, g in ipairs(pop) do
		local p = geno_develop(g)
		print(table.concat(g, " "), p)
	end
end

-- receive genotype, produce a phenotype:
function geno_develop(geno)
	local pheno = {}
	for i, gene in ipairs(geno) do
		pheno[i] = letters[gene]
	end
	return table.concat(pheno)
end

function pheno_evaluate(pheno)
	local fitness = 0
	-- compare with target	
	for i = 1, #target do
		if target:sub(i, i) == pheno:sub(i, i) then
			fitness = fitness + 1
		end
	end
	return fitness / genome_size
end

reset()

function generation()
	print("___________________________________")
	for i, g in ipairs(pop) do
		local pheno = geno_develop(g)
		local fitness = pheno_evaluate(pheno)
		-- mark genotype with fitness score:
		g.fitness = fitness
	end

	-- select the most fit candidates
	table.sort(pop, function(a, b)
		return a.fitness > b.fitness
	end)
	
	for i, g in ipairs(pop) do
		local pheno = geno_develop(g)
		local fitness = pheno_evaluate(pheno)
		print(pheno, "fitness", g.fitness)
	end
	
	-- terminte?
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
				--child[j] = math.random(genome_range)
				child[j] = (( child[j] + (math.random(7)-4) ) % genome_range) + 1
			end
		end
		
		--[[		
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













