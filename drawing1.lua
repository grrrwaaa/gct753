local draw2D = require "draw2D"
local win = require "window"
local vec2 = require "vec2"

win:setdim(400, 400)

local pi = math.pi
--math.randomseed(os.time())

-- the location that agents wish to reach:
local target = vec2(0.5, 0.5)
local maxforce = 0.00001
local maxspeed = 0.001
local viewrange = 0.2
local viewangle = math.pi * 0.5

local all_agents = {}

function draw_agent_boxily(a)
	draw2D.push()
		draw2D.translate(a.pos.x, a.pos.y)
		draw2D.rotate(a.direction)
		draw2D.color(1, 1, 1, 0.25)
		draw2D.arc(0, 0, -viewangle, viewangle, viewrange)		
		draw2D.scale(a.scale, a.scale)
		
		draw2D.color(1, 0., 0.5)
		draw2D.rect(0, 0, 0.1, 0.1)
		draw2D.line(0, 0, -0.2, 0)
	draw2D.pop()
end

function draw_agent_blobbily(a)
	draw2D.push()
		draw2D.translate(a.pos.x, a.pos.y)
		draw2D.rotate(a.direction)
		draw2D.color(1, 1, 1, 0.25)
		draw2D.arc(0, 0, -viewangle, viewangle, viewrange)		
		draw2D.scale(a.scale, a.scale)
		
		draw2D.color(1, 0.5, 0)
		draw2D.ellipse(0.03, 0, 0.1, 0.1)
		draw2D.ellipse(-0.05, 0, 0.06, 0.05)
		draw2D.ellipse(-0.1, 0, 0.06, 0.03)
	draw2D.pop()
end

function make_agent()
	local agent = {
		-- my position:
		pos = vec2(math.random(), math.random()),	
		-- my velocity:
		vel = vec2(0, 0),
		-- my direction :
		direction = math.random() * 2 * pi,
		scale = 0.1 + math.random() * 0.2,
	}
	
	-- pick a draw method randomly:
	if math.random() < 0.5 then
		agent.draw = draw_agent_boxily
	else
		agent.draw = draw_agent_blobbily
	end
	
	-- add agent to all_agents:
	all_agents[#all_agents + 1] = agent
end

for i = 1, 100 do
	make_agent()
end


function update()
	for i, a in ipairs(all_agents) do	
		-- make a place to store observed neigbors:
		local observations = {}
		for j, b in ipairs(all_agents) do
			if i == j then
				-- skip this one, we're looking at ourselves!
			else
				-- compare a and b:
				-- get relative vector:
				local rel = b.pos - a.pos
				-- use Pythagoras to get distance:
				local dist = rel:length()
				-- is this close enough?
				if dist < viewrange then
					-- convert my direction to a vector:
					local myvec = vec2(
						math.cos(a.direction),
						math.sin(a.direction)
					)
					local relu = rel:normalize()
					local angle = math.acos(relu:dot(myvec))
					
					if math.abs(angle) < viewangle then
						-- there was an observation!
						local n = #observations + 1
						observations[n] = b
					end
				end
			end
		end
		-- calculate steering force based on visible neighbors:
		-- steering force
		local F = vec2()
		if #observations == 0 then
			-- no neighbors, wander randomly:
			F:randomize():mul(0.1)
		else
			local sum = vec2()
			local sepforce = vec2()
			local sumvel = vec2()
			-- for each observed neighbor:
			for i, b in ipairs(observations) do
				sum = sum + b.pos
				sumvel = sumvel + b.vel				
				-- compute the separating force for this combo:
				local rel = b.pos - a.pos
				local len = rel:length()
				local scaled = -0.01 * rel / (len * len)
				-- add to total separating force:
				sepforce = sepforce + scaled
			end
			-- get center of gravity:
			local avg = sum / #observations
			local avgvel = sumvel / #observations
			local alignforce = avgvel * 100			
			-- get relative direction to it:
			local avgrel = avg - a.pos
			-- add up all our forces:
			F = avgrel + sepforce + alignforce
		end
	
		-- limit force (magnitude):
		F:limit(maxforce)
		-- calculate acceleration:
		-- F = m*a
		-- thus a = F / m
		local acc = F / a.scale
		
		-- apply acceleration
		-- integrate velocity by acceleration
		a.vel = a.vel + acc
		-- limit velocity (magnitude):
		a.vel:limit(maxspeed)
		
		-- derive new direction from desired velocity
		-- or actual velocity:
		a.direction = a.vel:angle()
		
		-- integrate position by velocity: 
		a.pos = a.pos + a.vel
		
		-- boundary check
		a.pos:mod(1)
		
	end
end

function draw()
	for i, a in ipairs(all_agents) do	
		--a.draw(a)
		a:draw()
	end
end


function mouse(event, button, x, y)
	if event == "down" or event == "drag" then
		-- use the mouse to set the target location:
		target.x = x
		target.y = y
	end
end








