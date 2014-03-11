-- load in the "field2D" library module (from /modules/field2D.lua):
local field2D = require "field2D"

local bit = require "bit"
local band, bor, bxor = bit.band, bit.bor, bit.bxor
local lshift, rshift, rol = bit.lshift, bit.rshift, bit.rol

local min, max = math.min, math.max
local random = math.random
local srandom = function() return random() * 2 - 1 end

function coin() return random() < 1 and 0 or 1 end

-- choose the size of the field
local dim = 128

-- allocate the field
local field = field2D(dim, dim)
local field_old = field2D(dim, dim)

function reset()
	for x = 1, dim-2 do
		for y = 1, dim-2 do
		
			local v = 0
			if random(dim) < y then
				v = 1
			end
		
			field_old:set(v, x, y)
			field:set(v, x, y)
		end
	end	
end
reset()

-- the HPP rules are simple:
--[[
	1, 2,
	4, 8
--]]
local rules = { 
	8, 	-- 1 -> 8 (diagonal single)
	4, 	-- 2 -> 4 (diagonal single)
	12, -- 3 -> 12 (horizontal pair)
	2, 	-- 4 -> 2 (diagonal single)
	10, -- 5 -> 10 (vertical pair)
	9, 	-- 6 -> 9 (digonal pair)
	14, -- 7 -> 14 (diagonal triplet)
	1, 	-- 8 -> 1 (diagonal single)
	6, 	-- 9 -> 6
	5, 	-- 10 -> 5
	13, -- 11 -> 13 (diagonal triplet)
	3, 
	11, 
	7, 
	15	-- 15 -> 15 (full block)
}
rules[0] = 0

for i = 0, 15 do
	--for j = 1, 16 do
		--print(i, j, "band", band(i, j), "bor", bor(i, j))
		--print(i, band(i, 1), band(i, 2), band(i, 4), band(i, 8))
		--print(i, band(i, 1), band(rshift(i, 1), 1), band(rshift(i, 2), 1), band(rshift(i, 3), 1))
	--end
end

function rule(x, y)
	local o = 	field_old:get(x, y) +
				field_old:get(x+1, y)*2 + 
				field_old:get(x, y+1)*4 + 
				field_old:get(x+1, y+1)*8
	local o1 = rules[o]
	field:set(band(o1, 1), x, y)
	field:set(band(rshift(o1, 1), 1), x+1, y)
	field:set(band(rshift(o1, 2), 1), x, y+1)
	field:set(band(rshift(o1, 3), 1), x+1, y+1)
end

local flip = false
function update()
	if flip then
		for x = 0, dim-2, 2 do
			for y = 0, dim-2, 2 do
				rule(x, y)
			end
		end	
	else
		for x = 1, dim-2, 2 do
			for y = 1, dim-2, 2 do
				rule(x, y)
			end
		end	
	end
	flip = not flip
	field_old, field = field, field_old
end

-- how to render the scene (toggle fullscreen with the Esc key):
function draw()	
	-- draw the field:
	field:draw()
end

-- handle keypress events:
function keydown(k)
	if k == "c" then
		-- set all cells to zero:
		field:clear()
	end
end


-- handle mouse events:
function mouse(event, btn, x, y)
	-- clicking & dragging should draw values into the field:
	if event == "down" or event == "drag" then
		
		-- scale window coords (0..1) up to the size of the field:
		local x = x * field.width
		local y = y * field.height
	
		-- spread the updates over a wide area:
		for i = 1, 10 do
			-- pick a random cell near to the mouse position:
			local span = 3
			local fx = x + math.random(span) - math.random(span)
			local fy = y + math.random(span) - math.random(span)
			
			-- set this cell to either 0 or 1:
			field:set(coin(), fx, fy)
		end
	end
end
