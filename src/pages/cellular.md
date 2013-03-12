title: Cellular systems and lattice models


# Cellular systems and lattice models

Provides an interesting continuum between non-living (such as molecules in crystal and metalline structures) and living (such as cells of a multi-cellular organism). The main difference is that, although both begin with more or less 'the same program', in living material the individual behavior of each cell specializes according to early conditions. This is important for *developmental biology*. 

Computational cellular systems are far, far simpler than biological cells; but still draw from this inpsiration.

The essential components that define a cellular system:

- **Cellular space:** A collection of cells arranged into a discrete lattice, such as a 2D grid. 
- **Cell states:** The information representing the current condition of a cell. In *Game of Life* this is either 0 or 1, but in other systems the state could be represented by an n-tuple of values, or something more complex. The set of possible states could be defined as finite or unbounded.
- **Initial conditions:** What state the cells are in at the start of the simulation.
- **Neighborhood:** The set of adjacent/nearby cells that can directly influence a particular cell. In *Game of Life* these are the 8 side and corner neighbors (the *Moore* neighborhood). In other systems it could be expressed as a radius or range.
- **State transition function:** The rule that a cell follows to update its state, which depends on the current state and the state of the neighborhood.
- **Time axis:** The cells are generally updated in a discrete fashion, which may be synchronous (all cells update simultaneously) or asynchronous (cells update separately, e.g. in a probabilistic manner).
- **Boundary conditions:** What happens to cells at the edges. A periodic boundary 'wraps around' to the opposite edge; a static boundary always has the same state, a copying or reflective boundary mirrors the neighbor state, etc.

## Cellular automata

The mathematical notion of *automaton* indicates a discrete-time system with finite set of possible states, a finite number of inputs, a finite number of outputs, and a transition rule which gives the state at the next step in terms of the state and inputs at the previous step.

A *CA* applies this notion to a cellular space. It has discrete time, finite neighborhood (inputs), finite state set (often represented as integers) and synchronous update. The transition rule (or CA rule) is usually deterministic, giving a cell state[t+1] as a function of the states[t] of itself and neighbours; and all cells use the same transition rule. 

![Evolution of a 1D CA: rule 30](img/ca_shells.jpg)

The space itself is usually 1D, 2D or 3D, but rarely greater. Wolfram performed most of his research using 1D CAs, such as the 'rule 30' CA above, whose evolution bears similarities with some shell patterns. The most famous CA *Game of Life* is 2D, which is so popular that people have written [Turing machines](http://www.youtube.com/watch?v=My8AsV7bA94) and [Game of Life](http://www.youtube.com/watch?v=xP5-iIeKXE8) in terms of it. [Over here a 3D cellular automaton is taking over Minecraft](https://www.youtube.com/watch?v=wNypW-aSCmE).

In theory the transition rule can be represented as a *look-up table*, however above a certain number of states and neighbors the size of this table would become astronomical (k states raised to the power of k neighbor states raised to the power of n neighbors; for a 3-state, 3-neighbor system this requires 7 billon rules!), so a procedural implementation is preferable. 

### Conway's Game of Life

The *Game of Life* CA is an example of a *outer totalistic* CA: The spatial directions of cells do not matter, only the total value of all neighbors is used, along with the current value of teh cell itself. The transition rule for a cell can be stated concisely as follows:

- If the current state is 1 ("alive"):
	- If the neighbor total is less than 2: New state is 0 ("death by loneliness")
	- Else if the neighbor total is greater than 3: New state is 0 ("death by overcrowding")
	- Else: State remains the same ("alive")
- If the current state is 0 ("dead"):
	- If the neigbor total is exactly 3: New state is 1 ("reproduction")
	- Else: State remains the same ("dead")
	
Or, in Lua:

```lua
if state == 1 then
	-- currently alive
	if neighbors < 2 then
		-- death by loneliness
		state = 0
	elseif neighbors > 3 then
		-- death by overcrowding
		state = 0
	end
else
	-- currently dead
	if neighbors == 3 then
		-- birth by reproduction
		state = 1
	end
end
```

### Implementation

If the cells are densely packed into a regular lattice structure, such as a 2D grid, they can efficiently be represented as *array* memory blocks. The state of a cell can be represented by a number, so an array of integers works well. A way to index this array memory to read or write a cell coordinate will be useful.

CAs may use bit-wise operators to implement the transition rules in a hardware-optimized way, but we will use regular ```if``` statements, like the above, for clarity. 

One complication is that the states of the whole lattice must update synchronously. That means: when one cell changes, all cells should change. This is not easy to achieve in most computing systems today, which mostly follow instructions one at a time (with only limited parallelism). A naive implementation will thus update cells one at a time, and the neighborhood of a particular cell will contain both 'past' and 'future' states. One way to work around this is to maintain two copies of the lattice; one for the 'past' states, and one for the 'future' states. The transition rule always reads from the 'past' lattice, and always writes to the 'future' lattice. After all cells are updated, either the 'future' is copied to the 'past', or the 'future' and 'past' lattices are swapped, since the future of yesterday is the past of tomorrow. 

> This technique is called *double-buffering*, and is widely used in software systems where a parallel process interacts with a serial machine. It is used to render graphics to the screen, for example.






## Reaction Diffusion

[xmorphia](http://mrob.com/pub/comp/xmorphia/), great video examples of [u-skate world](http://www.youtube.com/watch?v=F5oKgVZ6bTk), and even [u-skate in 3D](http://www.youtube.com/watch?v=B03lcPEmSOQ).

## Statistical models

The *Ising model* of ferromagnetism in statistical mechanics can also be simulated in a Monte Carlo fashion. Each site (cell) has either positive or negative spin (we can encode that as 0 or 1 value). At each time step, consider a site at random, and evaluate the probability of changing state. If changing state moves the site toward energetic equilibrium with neighbors (determined according to the Hamiltonian of the site) , then the change is made. Otherwise, the change is made only with a small probability that is dependent on the energetic difference and overall temperature. Thus at high temperatures, the system remains noisy, while at low temperatures it gradually self-organizes into all sites with equal spin.

It is also related to the *contact process* model, which has been used to simulate the spread of infection: infected sites become healthy at a constant rate, while healthy sites become infected at a rate proportional to the number infected neighbors. This can be extented to multiple states for a multitype contact process. The *voter model* similarly simulates the changing of opinion in social groups.

The siteular *Potts model* (also known as the *Glazier-Graner* model) generalizes these to allow more than two site states, and in some cases, an unbounded number of possible site states; however it still utilizes the notion of statistical movement toward neighbor equilibrium to drive change, though the definition of a local Hamiltonian. Variations have been used to model grain growth, foam, fluid flow, chemotaxis, biological cells, and even the developmental cycle of whole organisms. Note that in this field, the term *cell* is used not to refer to a site on the lattice, but to a whole group of connected sites that share the same state. So in modeling foam, a *cell* represents a single bubble, and is made of one or more *sites*. Most changes therefore happen at the boundaries between these cells.

## Other variations

[SmoothLife](http://www.youtube.com/playlist?list=PL69EDA11384365494) still uses a discrete grid, but both the kernel and transition functions are adjusted for smooth, continuous values; it removes the discrete bias and leads to fascinating results. [Another implementaton](http://www.youtube.com/watch?v=l7t8LtdBAV8). [Taken to 3D](http://www.youtube.com/watch?v=zA857JdUn9o&list=PL69EDA11384365494&index=46).

## In art

[Jonathan McCabe](http://www.jonathanmccabe.com/) and [commentary by Mitchell Whitelaw](http://teemingvoid.blogspot.kr/2007/02/jonathan-mccabe-very-cellular-automata.html)

Some of these systems share resemblance with analog video feedback ([example](http://www.youtube.com/watch?v=hDYEVv9t32U), [example](http://www.youtube.com/watch?v=Uw5onuS2_mw)), which has been exploited by earlier media artists (notably the Steiner and Woody Vasulka). 