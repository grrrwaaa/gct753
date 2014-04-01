title: Vectors


# (Euclidean) Vectors

A **vector** is one way of describing a direction with a magnitude. (A magnitude without direction (such as a regular number) is called a **scalar**.) Vectors can describe spatial properties such as locations, but also properties that change over time such as velocities, accelerations, forces of attraction and repulsion, local wind speed and direction, etc. Vectors are also useful for representing relationships between points,  normals and tangents, vertices and other attributes of geometry, and many other spatial relationships. Most graphics languages have some kind of vector primitives. 

In a 2D space, a vector has two components (X, Y), in a 3D space, it has three (X, Y, Z). Programming with vectors is easier if these components are combined into a single abstraction of a *vector object*. We can also treat a position in space as a vector: *the vector from the origin (0, 0) to the position*. 

We have a library in our Lua software for working with 2D vectors:

```lua
local vec2 = require "vec2"
```

## Operations on vectors

Adding two vectors is like applying their movements in series. 

The difference between two points can be obtained by subtraction; it also a vector. The *relative* position of B with respect to A is simply ```B - A```. So the position of agent B relative to agent A is ```B.position - A.position```. (For agent-oriented programming we often need to take the perspective *relative to an agent*, rather than the absolute, global perspective.)

We can multiply (or divide) vectors by scalars to make them longer or shorter. So ```A * 2``` produces a copy of vector A which is twice as long.

Using this, we can interpolate between two vectors A and B by interpolating their components according to an interpolation factor ```a``` which varies between 0 (for A) and 1 (for B) like this: ```A + a * (B - A)```. This is *linear interpolation*, or "lerp". If a is 0.5, then it corresponds to the *mean* (average) of two vectors.

The distance between two points is the length (*magnitude*) of the vector between them. We can use Pythagoras' theorem: ```distance = math.sqrt(v.x*v.x + v.y*v.y)```. 

A *unit vector* is a vector whose magnitude equals 1. The set of all unit vectors makes up the unit circle (a circle of radius 1). We can turn any vector into a unit vector by dividing by its length: 

```lua
local len = math.sqrt(v.x*v.x + v.y*v.y)
v.x = v.x / len
v.y = v.y / len
```

Or simply:

```lua
v:normalize()
```

The angle between two points can be derived using the *arctangent* of Y over X. We can calculate it as ```math.atan2(y, x)```. (```math.atan(y/x)``` would work, except that it could be satisfied by two different angles; ```math.atan2``` is more explicit and usually gives us the angle we require.)

The length and angle of a vector form the *polar* representation. We can convert back to *Cartesian* form again just as easily:

```lua
-- Cartesian to polar:
local len = math.sqrt(v.x*v.x + v.y*v.y)
local angle = mat.atan2(y, x)
-- Polar to Cartesian:
local x = len * math.cos(angle)
local y = len * math.sin(angle)
```

This is one way that we can rotate a vector: convert to polar form, add to (or subtract from) the angle, convert back to Cartesian form. Another way is to rotate the X and Y components individually, and sum them (the matrix form):

```lua
x1 = v.x * math.cos(rotation) + v.y * math.sin(rotation)
y1 = v.y * math.cos(rotation) - v.x * math.cos(rotation)
```

The *dot product* (also known as *scalar product* or *inner product*) of two vectors v1 and v2 is defined as ```v1.x*v2x + v1.y*v2.y```. (Note the similarity with the Pythagorean theorem). In a way the dot product tells us how similar two vectors are (it is related to correlation). Geometrically it is defined as ```||A|| ||B|| cos t```, which means the length of A multiplied by the length of B multipled by the angle t between A and B. So we can re-arrange that to determine the angle between to vectors as ``` arccosine( dot(A, B) / (mag(A) * mag(B)))```. Of course, if A and B are *unit vectors*, this simplifies to ```arccosine(dot(A, b))```. 

> One useful result is that if the dot product is zero, then A and B are orthogonal (at right angles to each other). If it is positive, then the angle between is less than 90 degrees, and if negative, the vectors must face away from each other since the angle between them is greater than 90 degrees. (And since magnitudes are always positive, we can skip that part of the calculation too!)

```lua
-- create a new 2D vector:
function vec2(x, y)
	local v = {}
	v.x = x
	v.y = y
	return v
end

-- multiply a vector by a number (modifies existing vector):
function vec2_mul(self, n)
	self.x = self.x * n
	self.y = self.y * n
	return self
end
```

# Movement, behavior, force and vectors

A vector can be used to store any property that has a magnitude and direction. It represents this in terms of components of principal axes. Examples include:

- absolute location (i.e. vector relative to the spatial origin)
- relative location (e.g. the path from object A to object B, or a line segment for drawing shapes)
- velocity
- acceleration, force

## Position, velocity and acceleration

If an object has a location in space, we can move it by adding a relative motion vector to the location. 

If we add this motion vector repeatedly, e.g. on each frame or simulation update, we create the illusion of continuous movement. In this case the motion represents a stable **velocity**, and the repeated addition is called **integration**. Put another way, the velocity is a discrete approximation of the location's (first) **derivative**: modeling how it changes over time. 

```
local vec2 = require "vec2"
local draw2D = require "draw2D"

local location = vec2(-1, 0)
local velocity = vec2(0.01, 0.01)

function draw()	
	-- integrate velocity to location:
	location:add(velocity)
	
	print(location)
	
	draw2D.point(location.x, location.y)
end
```

The **second derivative** of location is **acceleration**:

```
local location = vec2(-1, 0)
local velocity = vec2(0, 0)
local acceleration = vec2(0.01, 0.01)

function draw()	
	-- integrate acceleration to velocity:
	velocity:add(acceleration)
	-- integrate velocity to location:
	location:add(velocity)
	
	draw2D.push()
		draw2D.translate(location.x, location.y)
		draw2D.circle(0.05)
	draw2D.pop()
end
```

## Constraints

Pretty soon the object leaves visible space. You might want to handle this in different ways:

### Limit movement to the boundary

```
	-- prevent location component going below -1
	if location.y < -1 then
		location.y = -1
	end
	
	-- or more simply apply to all limits:
	location:min(1):max(-1)
```

### Limit movement to a distance (i.e. a circular space)

```
	location:limit(1)
```

### Wrap movement at the boundary

Also known as *toroidal* space.

```
	-- wrap at x boundaries:
	if location.x > 1 then 
		location.x = location.x - 2
	elseif location.x < -1 then
		location.x = location.x + 2
	end
	
	-- or more succintly, for both x and y:
	-- to wrap in the range -1,1, first shift to the range 0,2, then modulo the boundary, then shift back to -1,1:
	location:add(1):mod(2):sub(1)
```

### Execute arbitrary code at boundaries

For example, switch the direction of the velocity to point back to the center:

```
	-- the fraction of energy retained when a bounce occurs:
	local bounce_factor = 0.9
	-- bounce at ground level:
	if location.y < -1 then
		-- force the Y velocity to be positive:
		-- and lose a bit of energy due to the collision:
		velocity.y = math.abs(velocity.y) * bounce_factor
	end
```

### Other constraints

Other forms of constraints can be limiting movement to a line, or path. In this case a new force can be applied toward the line of the path.

Another very common constraint is to limit the velocity to an absolute maximum: ```velocity:limit(max)```.

## Forces

So far we have used a constant acceleration, which is physically unrealistic. Acceleration has to come from somewhere, and it can change magnitude and direction.

Acceleration was defined by Newton in terms of **force**: ```F = ma```, which means "Force = mass * acceleration". Therefore "acceleration = Force / mass". Let's wrap this into an object called "agent":

```lua
local agent = {
	location = vec2(0, 0),
	velocity = vec2(0, 0),
	acceleration = vec2(0, 0),
	force = vec2(0, -0.1),
	mass = 100,
}

agent.move = function(self)
	-- calculate acceleration:
	self.acceleration = self.force / self.mass
	-- integrate velocity:
	self.velocity:add(self.acceleration)
	-- integrate location:
	self.location:add(self.velocity)
	-- limit position:
	location:min(1):max(-1)
	-- clear forces:
	self.force:set(0, 0)
end

agent.draw = function(self)
	draw2D.push()
		draw2D.translate(self.location.x, self.location.y)
		draw2D.circle(0.05 * self.mass * 0.01)
	draw2D.pop()
end

function draw()	
	agent:move()
	agent:draw()
end
```

In this case we have modeled an object that is continuously subject to a force of (0, -0.1). This would be something like the effect of gravity. Other continuous forces might be e.g. the effects of a force of wind. 

To make it more interesting, we could consider that the wind may change direction over time. So we can model wind as a function that returns a force vector:

```
function wind()
	return vec2.random(0.1)
end

	-- (in agent.move)
	self.force:add(wind())
```

We could also make the wind vary over space:

```
function wind(location)
	return location * -0.1
end

	-- (in agent.move)
	self.force:add(wind(self.location))
```

Other forces a body interacts may be approximately instantaneous, rather than continuous. For example, if mousepad is scrolled, we could add an instantaneous "jump" force:

```
function mouse(event, button, x, y)
	if event == "scroll" then
        agent.force:sub(vec2(x, y))
    end
end
```

### Friction

So far our agent moves in a perfect Newtonian world: until a force acts on it, the velocity remains constant. In the world we are familiar with this rarely occurs, and velocity gradually decreases due to friction.

The simplest way we can model this is by scaling down the velocity on each frame:

```lua
	-- (in agent.move)
	self.velocity:mul(0.9)
```

A crude simulation of air friction operates in the opposite direction to movement, with a constant magnitude. We can get the magnitude of a vector (it's length) by Pythagoras's theorem:

```
local len = math.sqrt(v.x*v.x + v.y*v.y)
```

Because this is so useful, there is a simpler method:

```
local len = v:length()
-- or more simply:
local len = #v
```

If we divide a vector by it's length, we get a vector whose length is 1. This is a *normalized* vector, also known as the *unit vector*. Again, methods to do this already exist:

```
-- set the length of v to 1:
v:normalize()
-- return a new vector: the normalized (length==1) copy of v:
local direction = v:normalizenew()
```

So now we can calculate a friction force easily:

```
local frictionCoefficient = 0.01

	-- (in agent.move)
	local frictionForce = (-self.velocity):normalize():mul(frictionCoefficient)
	self.force:add(frictionForce)
```

Of course we could also create a function to vary the amount of friction over space. 

### Drag

A drag force is similar to friction, but varies proportinally to the square of the object speed, and to the surface area in the direction of movement. (For a circle the surface area is equal in any direction.)

```
local dragCoefficient = 1

	-- (in agent.move)
	local len = #self.velocity
	local dragForce = (-self.velocity):normalize():mul(dragCoefficient * len * len)
	self.force:add(dragForce)
```

### Gravitational attraction

Gravitational attraction applies in the direction from object A to object B. 
The magnitude is the product of the two masses multiplied by a constant factor, and divided by the relative distance squared.

```
local gravitationCoefficient = 1

	-- (in agent.move)
	-- get the relative vector from self to the source of gravity:
	local relative = source.location - self.location
	-- get the length:
	local distance = #relative
	-- get the direction as a unit vector:
	local direction = relative:normalize()
	-- now calculate the force:
	local gravitationForce = direction * gravitationCoefficient * self.mass * source.mass / (distance * distance)
```

Special care needs to be taken here: if the distance between objects is very low, then the force can become astronomical. It makes sense therefore to limit the distance to a safe minimum:

```
	local distance = math.max(0.01, #relative)
```

If you want to simulate gravitational attraction between all agents, you could put this into a loop over all the agents. Be careful to not apply gravitation to the object itself!

```
	for i = 1, #agents do
		local source = agents[i]
		if source ~= self then
			-- insert gravitational forces
		end
	end
```

### Springs

The direction of a spring force is the same as the relative vector between the ends. 

The magnitude of a force of a spring is proportional to the deviation from it's resting length. So if a spring's natural length is 0.1, but the current length is actually 0.4, then the spring force is proportional to -0.3. The spring force also includes a scaling coefficient. 

> Spring forces can quickly lead to oscillation. A damping filter is usually required to allow oscillation to fade away.

### Intentional forces

So far we have concentrated on physical forces external to an agent, but we can also consider the agent's ability to apply forces to itself (locomotion). Different situations call for different strategies, and these lead to different forces being applied. Hunting, chasing, evading, random walk exploration, chemotaxis, avoidance, copying, centering, swarming... 

## Many agents

The way we have designed ```agent.move``` and ```agent.draw``` allows them to be applied to many agents. We could create a list of agents, and initialize them differently:

```
local agents = {}
for i = 1, 100 do
	agents[i] = {
		location = vec2.random(),
		velocity = vec2(),
		acceleration = vec2(),
		force = vec2(),
		mass = math.random(200),
		
		-- "inherit" the move and draw methods from agent:
		move = agent.move,
		draw = agent.draw,
	}
end
```

Then all we need to do is update our ```draw``` routine to visit each one of them:

```
function draw()
	for i = 1, #agents do
		agents[i]:move()
	end
	
	for i = 1, #agents do
		agents[i]:draw()
	end
end
```

However, special care needs to be taken if the ```agent.move()``` function includes behavior between different agents (gravitation, spring forces, flocking, etc.). In order to make sure the effect of A on B is equal to the effect of B on A, you must separate the force calculation from the velocity/location integration into multiple passes:

```
agent.update = function(self)
	-- calculate forces and acceleration here
end

agent.move = function(self)
	-- update velocity, and location here
end

function draw()
	for i = 1, #agents do
		agents[i]:update()
	end
	for i = 1, #agents do
		agents[i]:move()
	end
	for i = 1, #agents do
		agents[i]:draw()
	end
end
```























