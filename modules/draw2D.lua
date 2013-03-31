local gl = require "gl"
local GL = gl


local pi = math.pi
local twopi = pi * 2
local rad2deg = 180/pi

local sin, cos = math.sin, math.cos

local draw2D = {}

function draw2D.push() 
	gl.PushMatrix()
end

function draw2D.pop() 
	gl.PopMatrix()
end

function draw2D.translate(x, y)
	gl.Translate(x, y, 0)
end

function draw2D.scale(x, y)
	gl.Scale(x, y or x, 1)
end

function draw2D.rotate(a)
	gl.Rotate(a * rad2deg, 0, 0, 1)
end

function draw2D.point(x, y)
	
	gl.Begin(GL.POINTS)
		gl.Vertex2f(x, y)
	gl.End()
end


function draw2D.line(x1, y1, x2, y2)
	
	gl.Begin(GL.LINES)
		gl.Vertex2f(x1, y1)
		gl.Vertex2f(x2, y2)
	gl.End()
end

function draw2D.rect(x, y, w, h)
	w = w or 1
	h = h or w
	local w2 = w/2
	local h2 = h/2
	local x1 = x - w2
	local y1 = y - h2
	local x2 = x + w2
	local y2 = y + h2
	gl.Begin(GL.QUADS)
		gl.Vertex2f(x1, y1)
		gl.Vertex2f(x2, y1)
		gl.Vertex2f(x2, y2)
		gl.Vertex2f(x1, y2)
	gl.End()
end

function draw2D.circle(x, y, w, h)
	w = w or 1
	h = h or w
	gl.Begin(GL.TRIANGLE_FAN)
	for a = 0, twopi, 0.0436 do
		gl.Vertex2f(x + w * sin(a), y + h * cos(a))
	end
	gl.End()
end

draw2D.color = gl.Color

return draw2D