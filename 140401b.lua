local draw2D = require "draw2D"
local vec2 = require "vec2"

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

local target = vec2(0.8, 0.8)
local maxspeed = 0.01
local maxturn = 0.1
local maxforce = 0.0001

function update_agent(a)
	-- current path to target:
	local relative = target - a.pos
	local desired = -relative
	local force = desired - a.vel
	
	-- convert this into thrust and steer:
	local force_local = force:rotatenew(-a.dir)
	local thrust, steer = force:polar()
	
	-- limit forward motion:
	thrust = math.min(thrust, maxforce)
	-- limit angular motion:
	if math.abs(steer) > maxturn then
		steer = maxturn * steer / math.abs(steer)
	end
	
	-- convert back to force vector:
	--local acceleration = a.vel:
	
	
	
	force:limit(maxforce)
	
	local acceleration = force / a.mass
	
	-- apply steering:
	a.vel = a.vel + acceleration
	a.vel:limit(maxspeed)
	
	-- update the agent's direction:
	--a.dir = math.atan2(a.vel.y, a.vel.x)
	a.dir = a.vel:angle()

	-- integrate velocity to position:
	a.pos:add(a.vel)
	
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
	draw2D.circle(target.x, target.y, 1/20)
end



















