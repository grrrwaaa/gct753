title: Symbol systems


# Symbol systems

## Development and L-systems

The structure of a multi-cellular organisms develops in a gradual process from a single fertilized cell (the *zygote*) through progressive steps of cell duplication and specialization in a process called *development*; an active area of scientific research today. We know that each cell responds to chemical signals from its neighbors and other environmental conditions in order to know how to *differentiate* (to become a specific kind of cell in the body), according to the processes of the genome. The zygote does not contain a blueprint for the final organism, simply genotypic instructions for responding to environmental stimuli, which happen (in most cases) to produce the fully developed phenotype. 

A compact developmental representation can result in a more complex developed organism by relying on the self-organizing tendencies of the chemical substrate (such as the chemical pattern formation we saw with reaction-diffusion systems), the creative re-use of instructions (leading to the *modularity* and *symmetry* widely found in biology), and careful control over the ordering, when and for how long particular instructions operate (*heterochrony*). Development is clearly *parallel*, *decentralized*, granting some *robustness*, and yet it is also *context dependent*. It is also *self-limiting*, such that most developmental processes halt after the embryonic phase (though some may continue through the organism's lifetime, such as the *regeneration* of lost limbs).

In 1968 biologist Astrid Lindenmeyer proposed to model several aspects of developmental systems (cell division, cell differentiation and cell death) using rewriting systems on symbolic strings. The analogy is that each symbol represents a cell in a particular state, and the rules of transformation represent the processes of differentiating from one state to another, dividing into two cells, or of programmed cell death.

## Rewriting systems

A rewriting system defines rules for the transformation of structures, typically strings of symbols. It is closely related to the formal notion of grammar. A system comprises:

- A set of possible symbols (A), called the *alphabet*
- An initial symbol (S), called the *axiom*
- A set (P) of *rewriting* or *production rules* to specify how each symbol is transformed to other symbols, at each production step. A rule converts a *predecessor* symbol into *successor* symbols.
- A process of applying these rules in parallel, step by step until no more productions can be applied.

For example, if the alphabet comprises ```{ a, b }```, the rules include ```a -> aba``` and ```abb -> nil```, and the start symbol is ```a``` then a sequence of productions could proceed as follows:

```lua
	a		-- apply rule 1
	aba		-- apply rule 1 (twice)
	abbab	-- apply rule 2, and rule 1
	abb		-- apply rule 2
	nil		-- no more productions applicable
```

One of the simplest ways to use rewriting sytems for art and design is to interpret the produced strings as instructions for another program. The classic example is using them as instructions for a "turtle graphics" interpreter. 

For example, using the following system:

```lua
	-- possible symbols:
	alphabet = { "F", "+", "-" }
	-- just one rule: replace "F" with "F+F--F+F"
	rule["F"] = "F+F--F+F"
	-- start with:
	start = "F"
```

If we interpret the "F" symbol to mean "move forward", and the "+" and "-" symbols to mean turn left and right by 60 degrees, then each successive application of this rule generates a successive iteration of the Koch curve fractal:

![Iterations of the Koch curve fractal](img/koch.jpg)

### Bracketed systems

By adding push ```"["``` and pop ```"]"``` symbols to save/restore graphics state (position, orientation etc.), the graphics interpreter can easily render branched structures such as trees and ferns.

### Stochastic systems

### Circuit systems

### Parametric systems

### Context-sensitive systems

Signals and regulation.

### Shape grammars

### Non-symbolic fractals

Fractal structures do not need to use symbolic rewriting. [Here](https://www.youtube.com/watch?v=FEnI_JPL6I0) is an example of a fractal tree structure created through simple video feedback.

### The evo-devo revolution

Cell signaling and regulatory networks.

## Artificial chemistries

Autonomous structure and self-organization, emergence of life. 

### Fontana's Alchemy

## Programmable media and byte-code ecosystems

Corewars

### Tom Ray's Tierra 

[Tom Ray: the evolutionary biologist who created evolution in the CPU](http://www.youtube.com/watch?v=Wl5rRGVD0QI)

### Viruses

## Immune systems, shape spaces

Natural and artificial immunity, algorithms, shape spaces.










