title: Multi-agent systems


# Multi-agent systems (agent-based models)

## What is an agent?

An autonomous agent interacts within an environment populated by other agents, but behaves independently without taking direct commands from other agents nor a global planner. Agent-based models typically operate in parallel within a spatial environment, in which interactions are usually limited to local distances, rather like cellular automata. But unlike CA, which roots a program in a particular spatial location (the cell), an agent-based program is typically mobile. 

The agent abstraction has arisen somewhat independently in different fields, thus the definition of an agent can vary widely. The following components are usually present:

- **Properties**: Persistent but variable features of an agent, such as size, color, speed, direction, energy level, and so on. 
- **Input**: Capabilities of sensing (or receiving messages from) the environment
- **Output**: Capabilities of performing actions on (or sending messages to) the environment, or its own properties. Typically this includes the ability to move through space.
- **Processing**: An information processing capacity to select actions in response to inputs. This capacity may also include information storage (memory).
- **Motivations**: The agent may also incorporate explicit goals or purposes in the form of self-evaluation and self-adaptation; or these may be implict in the design of the processing algorithm.

As a biological approximation, an agent could refer to anything from individual proteins, viruses, cells, bacteria, organisms, or population groups. Agent systems also share similarities with particle systems.

Just like CA, at times, the self-organizing behavior of systems of even relatively simple agents can be unpredictable, complex, and generate new emergent structures of order. 

## Random walks in nature

Nature makes great use of random walks (Brownian motion). 

### Termites

The termite model is a random walker in a space that can contain woodchips, in which each termite can carry one woodchip at a time. The program for a termite looks something like this:

- Look at the space just in front of me
- If it is empty, move forward and randomly change direction (random walk)
- Else if it is occupied by a woodchip:
	- If I am carrying a wood chip, drop mine where I am and turn around
	- Else move forward and pick up the woodchip
	
Over time, the termites begin to collect the woodchips into small piles, which gradually coalesce into a single large pile of chips.

### Boids, flocking, swarms

In the late 1980s Craig Reynolds proposed a model of animal motion to model flocks, herds and schools, which he named *boids*. Each boid follows a set of rules based on simple principles:

- **Avoidance**: Move away from other boids that are too close (avoid collision)
- **Copy**: Fly in the same general direction as other nearby boids
- **Center**: Move toward the center of the flock (avoid exposure)

Gary Flake also recommends:

- **View**: Move laterally away from any boid blocking the view

To make this more realistic, we can consider that each boid can only perceive other boids within a certain distance and viewing angle. We should also restrict how quickly boids can change direction and speed (to account for momentum). Additionally, the avoidance rule may carry greater *weight* or take precedence over the other rules.

Evidently the *properties* of a boid (apart from location) include direction and speed. It could be assumed that viewing angle and range are shared by all boids, or these could also vary per individual. The *sensors* of a boid include an ability to detect the density of boids in different directions (to detect the center of the flock), as well as the average speed and direction of boids, within a viewable area. The *actions* of a boid principally are to alter the direction and speed of flight. 





Distributed computing

Behavioral systems in cognitive science, AI & robotics




### Vehicles

Reas' vehicles

### Neural networks

The neuron, von Neumann, biological & artificial plasticity, artificial neural networks (ANNs), supervised, unsupervised & reinforcement learning.

### Subsumption architecture

### Complex adaptive systems

### Game theory

## Agent-environment interaction

Chemotaxis

Ant colonies (stigmergy)

PSO
