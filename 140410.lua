local draw2D = require "draw2D"
local vec2 = require "vec2"

win:setdim(400, 400)
math.randomseed(os.time())

local max_speed = 0.003

local agents = {}

function reset()
	agents = {}
	for i = 1, 20 do
		local a = {
			-- spatial properties:
			pos = vec2(math.random(), math.random()),
			vel = vec2.fromPolar(max_speed, math.random() * math.pi * 2),
			acceleration = vec2(),
			
			wander = 0,
			viewangle = math.pi * (0.5 + math.random()*0.5),
			
			max_force = 0.0005,
			center_factor = 2,
			align_factor = 30,
			avoid_factor = 0.005,
		
			spd = max_speed * (math.random() + 0.5),
			dir = math.random() * math.pi * 2,
	
			size = 0.02 + 0.02 * math.random(),
			mass = 1,
			
			align = vec2(),
			center = vec2(),
			canseesomething = false,
		}
		a.viewradius = a.size * 4
		agents[i] = a
	end
end
reset()

function move_agent(a)
	
	-- forward Euler integration:
	a.vel:add(a.acceleration)
	a.vel:limit(max_speed)
	a.pos:add(a.vel)
	
	-- update the agent's direction:
	a.dir = a.vel:angle()
	a.spd = a.vel:length()
	
	-- keep within the 0..1 bounds of the world:
	a.pos:mod(1)
end

function update_agent(a)

	-- how many agents can I see?
	local neighbors = {}
	local center = vec2()
	local align = vec2()
	local avoid = vec2()
	
	-- for every agent
	for i, n in ipairs(agents) do
		-- be careful about yourself
		if n ~= a then
			-- see if they are inside the semicircle
			-- get relative vector
			local relative = n.pos - a.pos
			-- wrap in toroidal space:
			relative:add(0.5):mod(1):add(-0.5)
			relative:rotate(-a.dir)
			local distance = relative:length()
			local angle = relative:angle()
			
			if distance < a.viewradius 
			and angle < a.viewangle
			and angle > -a.viewangle then
				
				-- add to center calculation:
				center:add(relative)
				-- add to velocity average
				align:add(n.vel)
				-- add avoidance:
				avoid:add(-relative / (distance*distance))
				
				-- add to list of neighbors
				neighbors[#neighbors+1] = n
			end
		end
	end
	
	a.canseesomething = #neighbors > 0	
	if a.canseesomething then
		
		-- take the average:
		center:div(#neighbors):mul(a.center_factor)
		align:div(#neighbors)
		align:rotate(-a.dir):mul(a.align_factor)
		
		avoid:mul(a.avoid_factor)
			
		local desired_velocity = center 
							   + align
							   + avoid
		
		local steering = (desired_velocity) - vec2(a.spd, 0)
		local steering_force = steering:limit(a.max_force)
		if steering_force.x < 0 then
			steering_force.x = 0
		end
		if steering_force.y > a.max_force/2 then
			steering_force.y = a.max_force/2
		elseif steering_force.y < -a.max_force/2 then
			steering_force.y = -a.max_force/2
		end
		
	
		-- locomotion
		a.acceleration:set(steering_force / a.mass)
	
		-- go back to global coordinate frame:
		a.acceleration:rotate(a.dir)
	else
		-- random walk:
		a.wander = a.wander + (math.random()-0.5)*0.5
		a.acceleration = vec2.fromPolar(0.005, a.dir) - vec2.fromPolar(0.0025, a.wander)
	end
	
	a.center = center
	a.align = align
end

function draw_agent(a)
	-- draw agent:
	draw2D.push()
		draw2D.translate(a.pos.x, a.pos.y)
		draw2D.rotate(a.dir)
		
		draw2D.color(1, 1, 1, 0.1)
		draw2D.arc(0, 0, -a.viewangle, a.viewangle, a.viewradius)
		
		draw2D.color(1, 0, 0)
		draw2D.line(0, 0, a.align.x, a.align.y)
		
		draw2D.color(1, 1, 0)
		draw2D.line(0, 0, a.center.x, a.center.y)
		
		draw2D.scale(a.size)

		if a.canseesomething then
			draw2D.color(1, 0.5, 1)
		else
			draw2D.color(0, 0.5, 1)
		end
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
	
	for i = 1, #agents do
		move_agent(agents[i])
	end
end

function draw()
	for i = 1, #agents do
		draw_agent(agents[i])
	end
end

function mouse(event, key, x, y)
	if event == "down" or event == "drag" then
		
	end
end



















