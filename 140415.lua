local field2D = require "field2D"
local vec2 = require "vec2"
local draw2D = require "draw2D"

local dim = 128
local sugar = field2D(dim, dim)
local sugar_old = field2D(dim, dim)

local max_eating_rate = 0.1
local minimum_requirement = 0.5
local diffusion_rate = 0.1
local smoothing = 0.5

local agents = {}

local numsugars = 50

function reset()
	for i = 1, numsugars do
		sugar:set(dim*dim/(numsugars*8), math.random(dim), math.random(dim))
	end
	
	for i = 1, 40 do
		local ecoli = {
			pos = vec2(math.random(), math.random()),
			dir = math.random() * math.pi * 2,
			twist = 0,
		
			previous_concentration = 0,
			gettingbetter = 0,
		}
		agents[#agents+1] = ecoli
	end
end
reset()

function update_agent(a)
	-- action selection
	local spd
	
	local c = sugar:sample(a.pos.x, a.pos.y)
	
	-- how much sugar can I eat?
	local edible = math.min(c, max_eating_rate)
	-- remove it:
	sugar:update(c - edible, a.pos.x, a.pos.y)
	--sugar:splat(-edible, a.pos.x, a.pos.y)
	
	a.gettingbetter = 
		a.gettingbetter*smoothing + 
		(c - a.previous_concentration)*(1-smoothing)
	
	if a.gettingbetter < 0
	--or c < minimum_requirement
	then	
		-- tumbling behavior
		a.twist = a.twist + (math.random() - 0.5)*0.5
		a.twist = a.twist * 0.9
		a.dir = a.dir + a.twist
		spd = 0.001
	else
		-- not-tumbling behavior:
		spd = 0.001
	end
	
	-- remember what this is for the next update:
	a.previous_concentration = c
	
	-- locomotion
	local vel = vec2.fromPolar(spd, a.dir)
	a.pos:add(vel)
	a.pos:mod(1)
end

local count = 0
function update()
	count = count + 1
	--if count < 200 then
		sugar, sugar_old = sugar_old, sugar
		sugar:diffuse(sugar_old, diffusion_rate)
		sugar:normalize()
	--end
	
	for i, a in ipairs(agents) do
		update_agent(a)
	end
end

function draw_agent(a)
	draw2D.push()
		draw2D.translate(a.pos.x, a.pos.y)
		draw2D.rotate(a.dir)
		draw2D.scale(0.03)
		
		draw2D.color(0.8, 0.3, 0)
		draw2D.ellipse(0, 0, 1, 0.5)
		draw2D.line(0, 0, -1, 0)
	draw2D.pop()
end

function draw()
	sugar:draw()
	
	for i, a in ipairs(agents) do
		draw_agent(a)
	end
end

function mouse(event, button, x, y)
	if event == "down" or event == "drag" then
		for i, a in ipairs(agents) do
			local deviation = vec2.random(math.random() * 0.1)
			a.pos.x = x + deviation.x
			a.pos.y = y + deviation.y
		end
	end
end
























