--- mat4: A 4x4 matrix

local sqrt = math.sqrt
local sin, cos = math.sin, math.cos
local atan2 = math.atan2
local acos = math.acos
local random = math.random
local pi = math.pi
local twopi = pi * 2
local format = string.format

local ffi = require "ffi"
local vec3 = require "vec3"

local mat4 = {}

local function new(...)
	return { ... }
end

function mat4:row3(i)
	return vec3(self[i], self[i+4], self[i+8])
end

function mat4:col3(i)
	local n = i*4
	return vec3(self[n], self[n+1], self[n+2])
end

--[[
--- Computes product of matrix multiplied by column vector, r = m * vCol
-- This is typically what is required to project a vertex through a transform
-- For a better explanation, @see http://xkcd.com/184/ -g
function mat4.transform_vec3(v)
	Vec<4,T> r, v(vCol[0], vCol[1], vCol[2], 1.);
	Mat<4,T>::multiply(r, *this, v);
	return r;
	
	-- returns a vec4
	return {  
		x = self:row(0):dot(v),
		y = self:row(1):dot(v),
		z = self:row(2):dot(v),
		w = self:row(3):dot(v),
	}
end
--]]
-- matrix * matrix
-- vec * matrix
-- matrix * vec
--function mat4.__mul(a, b) end

function mat4.perspective(fovy, aspect, near, far)
	-- height of view at distance 1:
	local h = math.tan(fovy * 0.008726646259972)
	local f = 1/h
	local D = far - near
	local D2 = far + near
	local D3 = far * near * 2
	return new(
		f/(aspect), 0, 0, 0,
		0, f, 0, 0,
		0, 0, -D2/D, -1,
		0, 0, -D3/D, 0
	)
end

function mat4.ortho(l, r, b, t, near, far)
	local W, W2 = r-l, r+l
	local H, H2 = t-b, t+b
	local D, D2 = far-near, far+near
	return new(
		2/W, 	0, 		0, 		0,
		0, 		2/H, 	0, 		0, 
		0, 		0, 		-2/D,	0,
		-W2/W,	-H2/H,	-D2/D,	1
	)
end

-- ux, uy, uz must be unit vectors
-- remember that uz points in the opposite direction to the view...
function mat4.lookatu(eye, ux, uy, uz)
	return new(
		ux.x, uy.x, uz.x, 0,
		ux.y, uy.y, uz.y, 0,
		ux.z, uy.z, uz.z, 0,
		-ux:dot(eye), -uy:dot(eye), -uz:dot(eye), 1
	)
end

function mat4.lookat(eye, at, up)
	local uz = (eye - at):normalize()
	local uy = up:copy():normalize()
	local ux = up:cross(uz):normalize()
	return lookatu(eye, ux, uy, uz)
end

return mat4