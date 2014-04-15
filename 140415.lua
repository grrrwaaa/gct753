local field2D = require "field2D"
local vec2 = require "vec2"
local draw2D = require "draw2D"

local dim = 128
local sugar = field2D(dim, dim)
local sugar_old = field2D(dim, dim)

local ecoli = {
	pos = vec2(math.random(), math.random()),
	dir = math.random() * math.pi * 2,
	twist = 0,
	
	previous_concentration = 0,
}

function reset()
	for i = 1, 200 do
		sugar:set(dim*dim/400, math.random(dim), math.random(dim))
	end
end
reset()

function update_agent(a)
	-- action selection
	local spd
	
	local c = sugar:sample(a.pos.x, a.pos.y)
	
	if c < 0.5 then	
		-- tumbling behavior
		a.twist = a.twist + (math.random() - 0.5)*0.5
		a.twist = a.twist * 0.9
		a.dir = a.dir + a.twist
		spd = 0.0002
	else
		-- not-tumbling behavior:
		spd = 0.001
	end
	-- locomotion
	local vel = vec2.fromPolar(spd, a.dir)
	a.pos:add(vel)
	a.pos:mod(1)
end

local count = 0
function update()
	count = count + 1
	if count < 200 then
		sugar, sugar_old = sugar_old, sugar
		sugar:diffuse(sugar_old, 0.1)
	end
	
	update_agent(ecoli)
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
	
	draw_agent(ecoli)
end

























