
local field2D = require "field2D"

local f = field2D.new(64, 48)


function draw()
	-- this is a comment it doesn't do anything
	-- print("drawing!")
	--print(math.random(10))
	
	--f.draw(f)
	f:draw()
	--f:set(math.random(), math.random(f.width), math.random(f.height))
end

function mouse(event, button, x, y)
    -- event is either "down", "drag", "up" or "move"
    -- button identifies the button pressed
    -- x and y are the mouse coordinates (normalized to 0..1 in each axis)
    --print(event, button, x, y)
    
    if event == "drag" then
    	f:set(math.random(), x * f.width, y * f.height)
    end
end

function myrandomvalues() 
	return math.random()
end

--print(myrandomvalues())

function keydown(key)
	print(key)
	
	f:set(myrandomvalues)
end

