title: Multi-agent systems


# Multi-agent systems (agent-based models)

## What is an agent?

An autonomous agent interacts within an environment populated by other agents, but behaves independently without taking direct commands from other agents nor a global planner or leader. Agent-based models typically operate in parallel within a spatial environment, in which interactions are usually limited to local distances, rather like cellular automata. But unlike CA, which roots a program in a particular spatial location (the cell), an agent-based program is typically mobile. 

The agent abstraction has arisen somewhat independently in different fields, thus the definition of an agent can vary widely. The following components are usually present:

- **Properties**: Persistent but variable features of an agent, such as size, color, speed, direction, energy level, and so on. 
- **Input**: Limited capabilities of sensing (or receiving messages from) the environment
- **Output**: Limited capabilities of performing actions on (or sending messages to) the environment, or its own properties. Typically this includes the ability to move through space.
- **Processing**: An information processing capacity to select actions in response to inputs. This capacity may also include information storage (memory).
- **Motivations**: The agent may also incorporate explicit goals or purposes in the form of self-evaluation and self-adaptation; or these may be implict in the design of the processing algorithm.

As a biological approximation, an agent could refer to anything from individual proteins, viruses, cells, bacteria, organisms, or population groups. Agent systems also share similarities with particle systems.

Just like CA, at times, the self-organizing behavior of systems of even relatively simple agents can be unpredictable, complex, and generate new emergent structures of order. 

## Vehicles

Braitenberg, V. (1984). Vehicles: Experiments in synthetic psychology. Cambridge, MA: MIT Press. 

![Vehicle](http://www.ini.uzh.ch/~conradt/research/BraitenbergVehicle/Braitenberg%20Vehikels_files/BVinh.jpg)

> A Braitenberg vehicle is an agent that can autonomously move around. It has primitive sensors (measuring some stimulus at a point) and wheels (each driven by its own motor) that function as actuators or effectors. A sensor, in the simplest configuration, is directly connected to an effector, so that a sensed signal immediately produces a movement of the wheel. Depending on how sensors and wheels are connected, the vehicle exhibits different behaviors (which can be goal-oriented).  [wikipedia](http://en.wikipedia.org/wiki/Braitenberg_vehicle)

Cyberneticist Valentino Braitenberg argues that his extraordinarily simple mechanical vehicles manifest behaviors that appear identifiable as fear, aggression, love, foresight, and optimism. The vehicle idea was a thought experiment conceived to show that complex, apparently purposive behaviour did not need to depend on complex representations of the environment inside a creature or agents brain. In fact simply by reacting to the environment in a consistent manner was more than enough to explain the low level reactive behaviours exhibited by many animals.

Casey Reas (co-author of Processing), Yanni Loukissas, and many others have used populations of Braitenberg-inspired vehicles to create artworks based on their combined paths.

![Reas' Tissue](http://reas.com/tissue_p/reas_tissue_p_13.jpg)

Vehicles have also been constructed in hardware of course -- see examples [here](http://www.ini.uzh.ch/~conradt/research/BraitenbergVehicle/), [here](http://blog.electricbricks.com/en/2010/05/vehiculos-braitenberg-nxt-g/), [here](http://tinkerlog.com/2009/06/07/mini-braitenberg-vehicle/) -- and may even have been inspired by [Grey Walter](http://en.wikipedia.org/wiki/William_Grey_Walter)'s robotic tortoises from the 1950s. (Brief history [here](http://www.rutherfordjournal.org/article020101.html)).

![Machina Speculatrix](img/machina_speculatrix.jpg) 

### Steering Behaviors

Craig Reynolds' work with robotics is strongly inspired by Braitenberg's and Walter's vehicles, and became famous for his work on simulating flocking behavior (see below). His work has been widely used in robotics, game design, special effects and simulation. Reynolds' paper [Steering Behaviors for Autonomous Characters](http://www.red3d.com/cwr/steer/gdc99/) breaks agent movement into three layers:

- **Action Selection**: selecting actions to perform according to environmental input and goals to achieve. 
- **Steering**: path determination according to the action selected. Many different behaviors can be used; a simple particle-system model could be ```steering force = desired_velocity - current_velocity```.
- **Locomotion**: mechanisms of conversion of steering into actual movement.

The paper is well worth exploring as a collection of patterns for autonomous agent movements; and presents the elements that make up his simulation of flocking behavior.



### Random walks in nature

A **random walk** involves small random deviations to steering. This produces a **random walk** or **Brownian motion**, a form of movement that is widely utilized by nature. In Reynolds' paper it is the *wander* steering strategy.

### Boids, flocking, swarms

In the late 1980s Reynolds proposed a model of animal motion to model flocks, herds and schools, which he named *boids*. Each boid follows a set of rules based on simple principles:

- **Avoidance**: Move away from other boids that are too close (avoid collision)
- **Copy**: Fly in the same general direction as other nearby boids
- **Center**: Move toward the center of the flock (avoid exposure)

(Gary Flake also recommends adding an influence for *View*: to move laterally away from any boid blocking the view.)

To make this more realistic, we can consider that each boid can only perceive other boids within a certain distance and viewing angle. We should also restrict how quickly boids can change direction and speed (to account for momentum). Additionally, the avoidance rule may carry greater *weight* or take precedence over the other rules.

Evidently the *properties* of a boid (apart from location) include direction and speed. It could be assumed that viewing angle and range are shared by all boids, or these could also vary per individual. The *sensors* of a boid include an ability to detect the density of boids in different directions (to detect the center of the flock), as well as the average speed and direction of boids, within a viewable area. The *actions* of a boid principally are to alter the direction and speed of flight. 

----

## Environmental interaction

### Termites

Mitchel Resnick's termite model is a random walker in a space that can contain woodchips, in which each termite can carry one woodchip at a time. The program for a termite looks something like this:

- Look at the space just in front of me
- If it is empty, move forward and randomly change direction (random walk)
- Else if it is occupied by a woodchip:
	- If I am carrying a wood chip, drop mine where I am and turn around
	- Else move forward and pick up the woodchip
	
Over time, the termites begin to collect the woodchips into small piles, which gradually coalesce into a single large pile of chips.

### Chemotaxis

> Chemotaxis is the phenomenon whereby somatic cells, bacteria, and other single-cell or multicellular organisms direct their movements according to certain chemicals in their environment. This is important for bacteria to find food (for example, glucose) by swimming towards the highest concentration of food molecules, or to flee from poisons (for example, phenol). In multicellular organisms, chemotaxis is critical to early development (e.g. movement of sperm towards the egg during fertilization) and subsequent phases of development (e.g. migration of neurons or lymphocytes) as well as in normal function. [wikipedia](https://en.wikipedia.org/wiki/Chemotaxis)

A [video example of chemotaxis in E. coli](http://www.youtube.com/watch?v=ZV5CfOkV6ek).

E. coli can use its flagella to move in just two modes (*locomotion*): 

- Move forward more or less straight
- Tumble about randomly

The *goal* is to find the highest sugar concentration. It can sense the local sugar concentration at its current location. However it cannot sense at a distance, and has no sense of direction, never mind which direction is best. 

Instead it uses chemical memory to detect sugar concentration *gradient*, that is, the differential of concentration at the current location compared to how it was just a few moments ago. This gradient tells the E. coli whether things are getting better or worse, which can be used to select between the swimming or tumbling patterns. 

With just a few tuning parameters, this can lead to a very rapid success in finding the higher concentrations of sugar (assuming the environment is smoothly varying). 

A variety of other *taxes* worth exploring can be found on the [wikipedia page](http://en.wikipedia.org/wiki/Taxis#Aerotaxis). Note how chemotaxis (and other taxes) can be divided into positive (attractive) and negative (repulsive) characters, just like forces (directly seen in steering forces). This is closely related to the concepts of positive and negative feedback. 

### Stigmergy

*Stigmergy* is a mechanism of indirect coordination between agents by leaving traces in the environment as a mode of stimulating future action by agents in the same location. For example, ants (and some other social insects) lay down a trace of pheromones when returning to the nest while carrying food. Future ants are attracted to follow these trails, increasing the likelihood of encountering food. This environmental marking constitutes a shared external memory (without needing a map). However if the food source is exhausted, the pheromone trails will gradually fade away, leading to new foraging behavior. 

Traces evidently lead to self-reinforcement and self-organization: complex and seeminly intelligent structures without global planning or control. Since the term stigmergy focuses on self-reinforcing, task-oriented signaling, E. O. Wilson suggested a more general term *sematectonic communication* for environmental communication that is not necessarily task-oriented.

Stigmergy has become a key concept in the field of [swarm intelligence](http://en.wikipedia.org/wiki/Swarm_intelligence), and the method of *ant colony optimization* in particular. In ACO, the landscape is a parameter space (possibly much larger than two or three dimensions) in which populations of virtual agents leave pheromone trails to high-scoring solutions.

Related environmental communication strategies include social nest construction (e.g. termites) and territory marking.

## Action selection systems

### Subsumption architecture

Rodney Brooks was also strongly influenced by Braitenberg's vehicles.

### Neural networks

The neuron, von Neumann, biological & artificial plasticity, artificial neural networks (ANNs), supervised, unsupervised & reinforcement learning.

### Complex adaptive systems

### Game theory

# Assignment 2: Agent Systems

The second assignment is to construct a new agent-based system. You can start from one of the existing systems we have looked at and modify it, or design and create a new one to explore an idea you have. The agents should implement local interactions using one or both of:

- Sensing and responding to other nearby (locally visible) agents
- Local reading and/or writing to one or more fields

Your agents should also implement:

- Action selection (responding to context in order to choose between strategies)
- Steering (implementing strategies by deriving and applying forces)
- Locomotion (implementing these forces to move the agents)

You should also try adding at least one of the following:

- More than one type of agent (e.g. predator and prey)
- Birth and death
- Field dynamics (a field that changes over time)
- Keyboard and mouse interaction
- Sound

You might spend roughly a third of your time choosing what to try and designing, a third actually implementing it, and a third exploring it for interesting parameters, initial conditions, variations etc. If you end up with more than one system that is interesting, you can submit them all. If you had an idea that seemed interesting but was difficult to implement or did not lead to interesting results, submit that too (with an explanation of why you think it did not work or did not do what you expected); this is just as important a part of research.

Document your work using comments in the code. Note that in Lua, you can write long multi-line comments like this:

```lua
--[[
This is a long comment
that runs over
several lines
--]]
```

At the top of your code, there should be a long comment including:

- Your **name**
- The **date**
- The **title**
- A **description** of the idea of the system, how it works (or why it doesn't), and why it is interesting, surprising, etc (or why it didn't meet your expectations). What kinds of long-term behaviors it supports. 
- A description of any **interactions** it supports (what the mouse does, what key presses do)
- A description of the **technical realization**. (Perhaps you tried a few different algorithms until it worked as expected?) If you were inspired by another system, mention it.
- Ideas for possible **future extensions** of the project.

Please also comment all the important operations in the code. Please also try to use helpful variable names, e.g. ```width``` is more communicative than ```var3```.

Send your final project as one (or more) Lua script(s) to my email address, on or before **Sunday 28th April**. 

Your assignment will be evaluted by these criteria:

- **Technical completeness** (33%). If it works, how well it works (efficiency, accuracy). Also how clearly the code is structured and commented. Even if it doesn't work, how well it was conceived and implemented. 
- **Aesthetic qualities** (33%). How interesting the appearances and behaviors are. Perhaps the system behaves differently for different initial conditions or variations in rules and parameters; spend some time finding good start conditions and include them as options in the program (e.g. triggered by pressing keys). Write down how to use them, and why you think they are interesting. If it doesn't work as expected or produce interesting results, then the evaluation here will be on how well you can articulate what you had hoped for, what aspects of that you think are missing, why you think they are missing, what you can suggest to resolve it, etc.
- **Novel contribution** (33%). This means creating something that we haven't built together in class, perhaps even something that has never been made before. The key aspects here are the creative qualities of the idea. Your ideas for future extensions will be evaluated too.

