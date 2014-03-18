local field2D = require("field2D")

local dim = 256
local game = field2D.new(dim, dim)
local past = field2D.new(dim, dim)

function init_game_cell(x, y)
	if math.random() < 0.9 then
		return 0
	else
		return 1
	end
end
game:set(init_game_cell)

function update_game_cell(x, y)
	local N = past:get(x, y+1)
	local S = past:get(x, y-1)
	local E = past:get(x+1, y)
	local W = past:get(x-1, y)
	local NE = past:get(x+1, y+1)
	local NW = past:get(x-1, y+1)
	local SE = past:get(x+1, y-1)
	local SW = past:get(x-1, y-1)
	
	local total = N + S + E + W + NE + NW + SE + SW	
	local C = past:get(x, y)
	
	if C == 1 then
		-- currently alive:
		if total < 2 and math.random() < 0.9 then
			return 0
		elseif total > 3 then
			return 0
		else
			return 1
		end
	else 
		-- currently dead:
		if total == 3 then
			return 1
		else
			return 0
		end
	end
end

function mouse(event, button, x, y)
	local column = x * dim
	local row = y * dim
	local value = 1
	for i = 1, 10 do
		local row1 = row + math.random(5)-3
		local col1 = column + math.random(5)-3
		game:set(value, col1, row1)
	end
end

function update()
	past, game = game, past
	game:set(update_game_cell)
end 

function draw()
	game:draw()
end


















