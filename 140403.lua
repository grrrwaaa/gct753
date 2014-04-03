local draw2D = require "draw2D"
local vec2 = require "vec2"

win:setdim(400, 400)

math.randomseed(os.time())

local agents = {}
for i = 1, 10 do
	agents[i] = {
		-- spatial properties:
		pos = vec2(math.random(), math.random()),
		vel = vec2(),
		spd = 0.01,
		dir = 0,
	
		size = 0.05 + 0.1 * math.random(),
		mass = 1,
	}
end

local target = {
	pos = vec2(0.8, 0.8),
	dir = 0,
	wander = 0,
}

local max_speed = 0.0025
local max_force = 0.001
local slowing_distance = 0.1

function update_agent(a)

	-- action selection
	-- target == target
	
	-- steering:
	-- compute vector to target
	-- in agent's coordinate frame:
	local relative = target.pos - a.pos
	-- wrap in toroidal space:
	relative:add(0.5):mod(1):add(-0.5)
	relative:rotate(-a.dir)
	
	local distance = relative:length()
	local speed = max_speed
	--speed = speed * math.min(1, distance / slowing_distance)
	local desired_velocity = speed * relative / distance
	
	-- compute the desired velocity:
	local steering = (desired_velocity) - vec2(a.spd, 0)
	local steering_force = steering:limit(max_force)
	
	-- locomotion
	local acceleration = steering_force / a.mass
	
	-- go back to global coordinate frame:
	acceleration:rotate(a.dir)
	
	-- forward Euler integration:
	a.vel:add(acceleration)
	a.vel:limit(max_speed)
	a.pos:add(a.vel)
	
	-- update the agent's direction:
	a.dir = a.vel:angle()
	a.spd = a.vel:length()
	
	-- keep within the 0..1 bounds of the world:
	a.pos:mod(1)

end

function draw_agent(a)
	-- draw agent:
	draw2D.push()
		draw2D.translate(a.pos.x, a.pos.y)
		draw2D.rotate(a.dir)
		draw2D.scale(a.size)
		draw2D.color(0, 0.5, 1)
		draw2D.circle(0, 0, 1)
		draw2D.color(1, 1, 0)
		draw2D.circle(0.3,  0.3, 1/3)
		draw2D.circle(0.3, -0.3, 1/3)
	draw2D.pop()
end


function update()

	-- update target:
	target.wander = target.wander + (math.random()-0.5)*0.5
	local vel = vec2.fromPolar(0.005, target.dir) - vec2.fromPolar(0.0025, target.wander)
	-- update target properties:
	target.dir = vel:angle()
	target.pos:add(vel):mod(1)
	
	--for i, a in ipairs(agents) do
	for i = 1, #agents do
		update_agent(agents[i])
	end
end

function draw()
	for i = 1, #agents do
		draw_agent(agents[i])
	end
		
	-- draw target:
	draw2D.color(1, 0, 0)
	draw2D.circle(target.pos.x, target.pos.y, 1/20)
end

function mouse(event, key, x, y)
	if event == "down" or event == "drag" then
		target.x = x
		target.y = y
	end
end



















