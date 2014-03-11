local field2D = require("field2D")
game = field2D.new(16, 16)


for y = 0, 15 do
	for x = 0, 15, 1 do		
		game:set(math.random(), x, y)
	end
end

function draw()
	for y = 0, 15 do
		for x = 0, 15, 1 do
			v = game:get(x, y)
			v = v + (math.random() - 0.5) * 0.1
			game:set(v, x, y)
		end
	end
	
	game:draw()
end
