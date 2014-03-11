-- see http://www.math.ucsd.edu/~sbuss/ResearchWeb/ikmethods/iksurvey.pdf
local window = require "window"
local gl = require "gl"
local vec3 = require "vec3"
local quat = require "quat"
local mat4 = require "mat4"
local pow = math.pow
math.randomseed(os.time())

local NUMJOINTS = 10
local joints = {}

-- initialize first joint:
joints[1] = { 
	-- length of joint
	len = 0, 
	-- axis of rotation (local coordinate space)
	axis = vec3(0, 1, 0), 
	-- the joint rotation
	angle = 0, 
	
	-- current position (global coordinate space)
	pos = vec3(),
	-- axis of rotation (global coordinate space)
	axis_global = vec3(0, 1, 0),
	-- current orientation as quaternion (global coordinate space)
	quat = quat(),
}
-- initialize rest of joints:
local len = 0.3
for i = 2, NUMJOINTS do
	joints[i] = { 
		-- length of joint
		len = len, 
		-- axis of rotation (local coordinate space)
		axis = vec3(1, 0, 0), 
		-- the joint rotation
		angle = 0, 
		
		-- current position (global coordinate space)
		pos = vec3(),
		-- axis of rotation (global coordinate space)
		axis_global = vec3(1, 0, 0),
		-- current orientation as quaternion (global coordinate space)
		quat = quat(),
	}
	len = len / 1.5
end

-- the "hand":
local effector = joints[NUMJOINTS]
-- the "ball"
local target = vec3.random(0.5)

-- the Jacobian:
local J = {}

-- forward transform: accumulate position and orientation from base to hand:
function fwd()
	local pos = vec3()
	local q = quat()
	for i = 1, NUMJOINTS do
		local joint = joints[i]
		-- convert axis of rotation into global space:
		joint.axis_global = q:rotate(joint.axis):normalize()
		-- update current joint orientation:
		joint.quat = quat.fromAxisAngle(joint.angle, joint.axis)
		-- update current global orientation to include this joint:
		q:mul(joint.quat):normalize()
		-- calculate new joint unit vector:
		joint.unit = q:uz()
		-- apply to accumulate global position:
		pos = pos + joint.unit * joint.len
		-- update joint position:
		joint.pos = pos
	end
	-- return new "hand" position in global coordinate space
	return pos
end

-- update the joint angles (and orientations) to approach the ball:
function update_joints()
	-- "e" is the vector from hand to ball:
	local e = target - effector.pos
	-- unit (direction) vector from hand to ball
	local eunit = e:normalizenew()
	
	-- Jacobian is k x n matrix (k is no. of targets, n is no. of joints)
	-- derivative of effector pos as each joint angle changes
	-- here k == 1 so we have 1 x n matrix
	
	-- for each joint:
	for i = 1, NUMJOINTS do
		local joint = joints[i]
		-- compute Jacobian
		-- (for rotational joints only)
		J[i] = joint.axis_global:cross(effector.pos - joint.pos)
		-- (for translational joints, it would be:)
		--J[i] = joint.unit
		
		-- use component of J[i] along hand-ball vector as an approximation
		-- of the desired change in joint rotation:
		-- (0.1 is to make the change gradual, and avoid oscillation error)
		joint.angle = joint.angle + 0.1 * eunit:dot(J[i])
		
		-- alternative weighting per joint:
		--joint.angle = joint.angle + 0.1 * pow(i, -0.25) * eunit:dot(J[i])
		
		-- recomputing forward transform at this point might help converge faster 
		-- but is not necessary
		--fwd()
	end
	
end

function draw()

	-- if we have reached the ball, pick a new random location:
	if (target - effector.pos):length() < 0.05 then
		target = vec3.random(0.5)
	else	
		-- ball has a little random walk:
		target:add(vec3.random(math.random()*0.01)):limit(0.5)
	end
	
	-- modify the joint rotations:
	update_joints()
	-- then update the joint positions:
	fwd()
	
	-- standard 3D perspective:
	gl.MatrixMode(gl.PROJECTION)
	gl.LoadMatrix(mat4.perspective(80, window.width/window.height, 0.1, 40))
	gl.MatrixMode(gl.MODELVIEW)
	gl.LoadMatrix(mat4.lookat(vec3(0, 0, 1), vec3(0, 0, 0), vec3(0, 1, 0)))
	
	-- draw ball:
	gl.PointSize(4)
	gl.Color(1, 1, 0)
	gl.Begin(gl.POINTS)
		gl.Vertex(target.x, target.y, target.z)
	gl.End()
	
	-- draw arm:
	gl.Begin(gl.LINE_STRIP)
		gl.Color(1, 1, 1)
		gl.Vertex(0, 0, 0)
		for i = 1, NUMJOINTS do
			local p = (i-1) / NUMJOINTS
			gl.Color(J[i].x + 0.5, J[i].y + 0.5, J[i].z + 0.5)
			local joint = joints[i]
			gl.Vertex(joint.pos.x, joint.pos.y, joint.pos.z)
		end
	gl.End()
	
end

