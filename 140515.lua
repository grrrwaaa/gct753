local field2D = require "field2D"

local dim = 400

function karl_and(a, b)
	a = math.abs(a) >= 0.5
	b = math.abs(b) >= 0.5
	if a and b then
		return 1
	else 
		return 0
	end
end

function karl(x, y)
	-- convert to normalized range (-1, 1):
	x = (x/(dim-1)) * 2 - 1
	y = (y/(dim-1)) * 2 - 1
	-- the actual function:
	-- (mod X (abs Y))
	local r1 = y
	local r2 = math.abs(r1)
	local r3 = x
	local r4 = r3 % r2
	return r4
end

local img = field2D(dim, dim)
img:set(karl)

function draw()
	img:draw()
end