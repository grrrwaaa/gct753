local draw2D = require "draw2D"
local win = require "window"
local vec2 = require "vec2"

win:setdim(500, 500)

local pi = math.pi
math.randomseed(os.time())

-- the location that agents wish to reach:
local target = vec2(0.5, 0.5)
local maxforce = 0.0001
local maxspeed = 0.01

local all_agents = {}

function draw_agent_boxily(a)
	draw2D.push()
		draw2D.translate(a.pos.x, a.pos.y)
		draw2D.rotate(a.direction)
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

for i = 1, 500 do
	make_agent()
end


function update()
	for i, a in ipairs(all_agents) do	
		-- update agent a:		
		-- calculate desired velocity
		-- (position of target with respect to the agent):
		local rel = target - a.pos
		-- this is the ideal new velocity:
		local want = rel
		
		-- the new steering force:
		-- desired velocity minus current velocity
		-- (scaled down so that movement is gradual)
		local F = (want - a.vel) * 0.001
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
		
		-- (commented out for now, because it works OK without boundary check if the agents are target-seeking)
		--[[
		if a.x < 0 then
			a.x = 0
		elseif a.x > 1 then
			--a.direction = a.direction + pi
			--a.x = a.x % 1
			a.x = 1
		elseif a.y < 0 then
			a.y = 0
		elseif a.y > 1 then
			--a.direction = 2 * pi - a.direction
			--a.y = a.y % 1		
			a.y = 1
		end	
		--]]
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








