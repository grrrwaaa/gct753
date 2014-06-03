title: Index


#GCT753: Topics in Computational Design (Artificial Natures)

KAIST GSCT Spring 2013 / Spring 2014  
Instructor: Dr. Graham Wakefield ([grrrwaaa@gmail.com](http://www.grahamwakefield.net))  
Hours: Tue/Thu 2.30pm - 4pm
Location: N25 3239   
Language: English   
Credit: 3  
TA: Sunga Jang   
(Office / Hours: N5 #2339 / Monday, Wednesday 4pm-6pm)   
Web: http://grrrwaaa.github.com/gct753/

## Overview

How can we create cultural artifacts (art, architecture, design, service) that are as rich, adaptive, and fascinating as nature? Media computation is often presented in terms of isolated and narrow problem-solving tasks, but the culture technology of tomorrow is increasingly connected, persistent, interactive, and open-ended. How can we create media systems that respond continuously and creatively to an ever-changing environment?


From its origins computing has been inspired by nature, including aspects of intelligence, pattern formation, self-construction and reproduction, autonomy and collective behavior. This course introduces the key conceptual frameworks and techniques of bio-inspired computation and their applications in artifacts of cultural technology, particularly for interactive and generative media arts. The course however most strongly emphasizes practice: during the course, creative applications are examined and implemented in interactive audiovisual media. The aim is not only to develop understanding and expertise, but also to look ahead toward the artificial/natural/cultural environments of tomorrow.

### Format

Theoretical issues, technical models, and exemplary works are presented in lecture sessions, and implemented during lab sessions. Students may use a software engine supplied by the instructor. Toward the end of the course lab sessions will be oriented towards helping students with their final projects. Lecture and course materials, including the software engine, will be presented and disseminated through the class web-site.

### Objectives

By the end of the course, students will: 

* Understand the many themes of bio-inspired computation, how it has been applied in generative
and interactive arts, and how it may be extrapolated into future culture technologies. 
* Be able to apply these techniques for tasks of problem-solving as well as interactive and creative
works, as demonstrated in a project portfolio.

### Prerequisites

The course is designed to be suitable to students with different levels of technical expertise, but some prior programming experience is assumed.

### Assignments

Lab sessions and assignments will utilize a software engine provided by the instructor, compatible with OSX and possibly Linux or Windows. Using a specific engine allows us to concentrate on important conceptual issues without being distracted by platform and library variations and inconsistencies. The engine supports easy experimentation by students and rapid in-class authoring examples by the instructor. The principles learned can be easily translated to other languages and systems.

Assignments must be completed individually. Collaboration is permitted for final projects, however each student must be able to clearly identify which parts of the project they were responsible for. 

### Final Project

The final project should be a significant project using the themes of this course. It should integrate at least two of the kinds of systems we've looked at, along with some kind of interactivity (e.g. mouse, keyboard) and some kind of adaptation (e.g. evolution or learning). 

The final project may extend existing work from one (or more) of the assignments, but will be evaluated only according to the new contributions. You may work in teams if desired, but each member must send me a statement making it clear how you divided up responsibilities so that I can grade appropriately.

You might spend roughly a third of your time choosing what to try and designing, a third actually implementing it, and a third exploring it for interesting parameters, initial conditions, variations etc. If you end up with more than one system that is interesting, you can submit them all. 

Document your work using comments in the code. Note that in Lua, you can write long multi-line comments like this:

```lua
--[[
This is a long comment
that runs over
several lines
--]]
```

Or in JavaScript:

```javascript
/*
This is a long comment
that runs over
several lines
*/
```

At the top of your code, there should be a long comment including:

- Your **name**
- The **date**
- The **title**
- A **description** of the idea of the system, how it works (or why it doesn't), and why it is interesting, surprising, etc (or why it didn't meet your expectations). What kinds of long-term behaviors it supports. 
- A description of any **interactions** it supports (what the mouse does, what key presses do)
- A description of the **technical realization**. (Perhaps you tried a few different algorithms until it worked as expected?) If you were inspired by another system, mention it.
- Ideas for possible **future extensions** of the project.

Please also comment all the important operations in the code. Try to use helpful variable names, e.g. ```width``` is more communicative than ```var3```.

Send your final project as one (or more) Lua script(s) to the TA on or before **Sunday 27th April**. 

Your final project will be evaluted by these criteria:

- **Technical completeness** (30%). If it works, how well it works (efficiency, accuracy). Also how clearly the code is structured and commented. Even if it doesn't work, how well it was conceived and implemented. 
- **Aesthetic qualities** (30%). How interesting the appearances and behaviors are. Perhaps the system behaves differently for different initial conditions or variations in rules and parameters; spend some time finding good start conditions and include them as options in the program (e.g. triggered by pressing keys). Write down how to use them, and why you think they are interesting. If it doesn't work as expected or produce interesting results, then the evaluation here will be on how well you can articulate what you had hoped for, what aspects of that you think are missing, why you think they are missing, what you can suggest to resolve it, etc.
- **Novel contribution** (30%). This means creating something that we haven't built together in class, perhaps even something that has never been made before. The key aspects here are the creative qualities of the idea. Your ideas for future extensions will be evaluated too.
- **Effort** (10%). 

Please note that your final projects may be shared publicly on the course website.

Send your final project to the TA on or before **Friday June 20th**. 

### Grading

Grading will be based on: 

- in-class participation (20%), 
- assignments (40%), and 
- final project (40%). 

### Materials

A selection of key papers will be disseminated during the course. Two books are also recommended, from which many readings will be selected: 

- [Floreano & Mattiussi, Bio-Inspired Artificial Intelligence](https://mitpress.mit.edu/books/bio-inspired-artificial-intelligence)
- [Flake, The Computational Beauty of Nature](http://mitpress.mit.edu/books/computational-beauty-nature)


## Tentative schedule

### Week 1

**Topics:** Course overview. Introduction to biologically-inspired computation and artificial life art. Introduction to major themes, presentation of representative works. Presentation of the software engine used for labs and assignments.

**Readings:** Selected readings (Mitchell Whitelaw, Simon Penny, Sommerer & Mignonneau, Karl Sims)

### Week 2

**Topics:** Automata theory. Lattice automata, cellular automata, the Game of Life. 
Dynamic systems, reaction-diffusion systems, chaotic and dissipative structures. Implementations following Conway, Turing.

**Readings:** Readings from the course books. Selections from Wolfram, Turing, Prigogine. 

### Week 3

**Topics:** Conceptual issues: emergence and the mechanism-vitalism debate, self-organization in discrete and continuous systems, Wolfram’s classes of CA and Langton’s edge of chaos. Implementations following Wolfram, Langton. 

**Readings:** Readings from the course books. Summary texts (Penny, Whitelaw etc.)

***Assignment 1:*** Variations on the Cellular Automaton.

### Weeks 4-5

**Topics:** Evolutionary models. Genotype and phenotype representations. Optimizing selection, aesthetic selection, co-evolutionary and ecosystemic selection. Genetic algorithm, genetic programming, evolutionary programming. Implementations following Sims, Draves.

**Readings:** Readings from the course books. Original texts by McCormack, Holland, Koza. 

***Assignment 2:*** (Week 5) Evolutionary programming of images or sounds.


### Week 6

**Topics:** Development. Rewriting systems in computation, L-systems, shape grammars. Pattern formation. The evo-devo revolution, cell signaling and regulatory networks.

**Readings:** Selected readings from the course books. Original texts (Lindenmeyer, Turing). 

### Week 7

**Topics:** Agents, agent-environment interaction. Behavioral systems in cognitive science, AI & robotics. Random walks. Vehicles (Braitenberg), subsumption architecture (Brooks), chemotaxis. Implementations following Reas, chemotaxis.

**Readings:** Selected readings from the course books.  Original texts (Braitenberg, Brooks).

***Assignment 3:*** Either a) morphology using an L-system or b) pattern formation with a reaction-diffusion system.

### Weeks 8-9

**Topics:** Collective behavior and intelligence, biological self-organization. Swarms and PSO, ant colony models (stigmergy and pheromone trails), collective optimization and distributed computing, game theory.
Implementations: stigmergy, pheromone trails. 

**Readings:** Selected readings from the course books.  

***Assignment 3:*** (Week 9) Collective agent behaviors.

### Week 10

**Topics:** Neural models. The neuron, von Neumann, biological & artificial plasticity, artificial neural networks (ANNs), supervised, unsupervised & reinforcement learning.

**Readings:** Selected readings from the course books.

### Week 11

**Topics:** Advanced topics: Immune systems. Natural and artificial immunity, algorithms, shape spaces.

**Readings:** Selected readings from the course books.

***Assignment:*** Final project proposal due. 

### Week 12

**Topics:** Advanced topics: Programmable media and byte-code ecosystems. Corewars, Tierra, Viruses.

**Readings:** Selected readings from the course books. Original texts (Ray, Turing). 

### Week 13

**Topics:** Advanced topics: Artificial chemistries.  Autonomous structure and self-organization, emergence of life. Implementation focus: Fontana’s alchemy.

**Readings:** Selected readings from the course books. Original texts (Fontana et al.). 

### Weeks 14+

Project development labs, final project presentation & critique.

[![urban jungle](http://24.media.tumblr.com/ed9e8856194f3d0d9e3211afe0cf2f27/tumblr_miff0wyJ921rpcrx8o1_500.jpg)](http://www.flickr.com/photos/idogu/167497705/)