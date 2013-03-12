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



[3D cellular automaton takes over minecraft](https://www.youtube.com/watch?v=wNypW-aSCmE)

## Game of Life




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