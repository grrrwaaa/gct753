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
		wander = 0,
	}
end

local target = {
	pos = vec2(0.8, 0.8),
	vel = vec2(),
	dir = 0,
	wander = 0,
}

local max_speed = 0.00025
local max_force = 0.0001
local slowing_distance = 0.1
local viewrange = 0.2

function update_basic(a)
	-- integrate velocity:
	a.vel:limit(max_speed)
	a.pos:add(a.vel)
	
	-- update the agent's direction:
	a.dir = a.vel:angle()
	a.spd = a.vel:length()
	-- keep within the 0..1 bounds of the world:
	a.pos:mod(1)
end

function update_wander(a)
	-- update target:
	a.wander = a.wander + (math.random()-0.5)*0.5
	a.vel = vec2.fromPolar(0.005, a.dir) - vec2.fromPolar(0.0025, a.wander)
	
	update_basic(a)
end

function update_follow(a)
	
	local count = 0
	local repulse = vec2()
	
	for i = 1, #agents do
		local n = agents[i]
		if n ~= a then
			count = count + 1
			
			-- compute vector to target
			-- in agent's coordinate frame:
			local relative = n.pos - a.pos
			-- wrap in toroidal space:
			relative:add(0.5):mod(1):add(-0.5)
			relative:rotate(-a.dir)
			local distance = relative:length()
			
			-- is target in range?
			-- is target in front?
			if distance > a.size/2 
			and distance < viewrange 
			and relative.x > 0 then
				-- For each nearby character, a repulsive force is computed by subtracting the positions of our character and the nearby character, 
				-- normalizing, and then applying a 1/r weighting. 
				local rn = relative / distance
				local rn2 = rn / distance
				repulse:add(rn2)
				
				
			end
		end
	end
	
	if count > 0 then
	
		local desired_velocity = repulse * -0.1
		desired_velocity:limit(max_speed)
	
		-- compute the desired velocity:
		local steering = (desired_velocity) - vec2(a.spd, 0)
		local steering_force = steering:limit(max_force)
		
		a.show = desired_velocity * 1000
		
		-- locomotion
		local acceleration = steering_force / a.mass

		-- go back to global coordinate frame:
		acceleration:rotate(a.dir)

		-- forward Euler integration:
		a.vel:add(acceleration)
		
		if a == agents[1] then
			print(acceleration, a.vel)
		end
	else
		a.show = vec2()
	end

	--[[
		-- steering:
	
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

		update_basic(a)

	else
		update_basic(a)
	end	
	--]]
end

function draw_agent(a)
	-- draw agent:
	draw2D.push()
		draw2D.translate(a.pos.x, a.pos.y)
		draw2D.rotate(a.dir)
		
		-- draw view:
		draw2D.color(1, 1, 1, 0.2)
		draw2D.arc(0, 0, -math.pi/2, math.pi/2, viewrange)
		
		draw2D.color(1, 0, 0)
		draw2D.line(0, 0, a.show.x, a.show.y)
		
		draw2D.scale(a.size)
		draw2D.color(0, 0.5, 1)
		draw2D.circle(0, 0, 1)
		draw2D.color(1, 1, 0)
		draw2D.circle(0.3,  0.3, 1/3)
		draw2D.circle(0.3, -0.3, 1/3)
		
	draw2D.pop()
end


function update()

	update_wander(target)
	
	-- movement in separate step:
	for i = 1, #agents do
		update_basic(agents[i])
	end
	
	for i = 1, #agents do
		update_follow(agents[i])
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
		target.pos.x = x
		target.pos.y = y
	end
end



















