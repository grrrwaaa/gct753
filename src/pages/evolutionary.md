title: Evolutionary systems


# Evolutionary systems

There have been more than four decades of computational systems inspired by natural evolution. It has become a major field of machine learning and optimization. Beyond AI, it has been used in hardware and circuit design, robotics, and more recently in industrial design and architecture. It has of course also been deeply explored in art and music.

## Natural and artificial evolution

The theory of natural evolution combines **population, diversity, heredity and selection**. Evolution requires a **population** of individuals that exhibit **diversity** (both similarities and variations between each other, both within and between species). These individuals can produce new individuals; offspring that exhibit similarites with the parent(s) through **heredity**. However not all of the population can successfully reproduce. Any factor that affects the possibility of an individual reproducing, thus also affects what characteristics are inherited in the population as a whole. Charles Darwin's theory of natural **selection**, proposed in 1859, is that the section of the population that can reproduce is not entirely random, but rather is regulated by interactions between inherited characteristics and environmental constraints (such as available food, populations of symbionts, predators and parasites, and so on). Accordingly, the characteristics of a species may change over time (**evolution**), forming a history that can be investigated through the fossil records.

![Origin of the Species](img/origin_of_the_species.jpg)

**Artificial evolution** is a form of computational simulation whose process mirrors the abstract structure of natural evolution:

- Maintain a population of finite individuals (which can reproduce)
- Support variation (including new characteristics) in the population
- Provide a mechanism of heredity between generations
- Provide a mechanism of selection 

The main systematic differences are that the underlying mechanisms specified by us in advance, as are the initial populations and environmental conditions (if any). Most importantly, *the mechanism of selection is usually predetermined*. 

This underscores a fundamental difference between *artificial* and *natural* evolution: most artificial systems are used toward a particular goal (*teleological*, even in artistic pursuits), natural evolution is adaptive in an open-ended, undirected, goal-less (*non-teleological*). In contrast, *natural evolution does not imply progress*, since the environmental conditions (and selective criteria) evolve along with each species. Since there is no absolute goal or progress, the most we can measure in natural evolution is the changing frequencies over time of individual species, or of individual characteristics of a population.

> \* A debate has arisen in recent years regarding evidence (or the lack thereof) for transcendental, teleological aspects of natural evolution; partly driven by conflicts between religous edicts and evolutionary science. Regardless of personal beliefs, in the context of this course we should approach the subject of evolution with a philosophical attitude that avoids essentialist thought.

### Viability and ecosystemic evolution

The survival of a natural species depends on its *viability*; the ability of enough individuals to live long enough to reproduce within an unpredictable environment. There is no pre-defined (*a priori*) fitness measure. Most artificial evolutionary systems however impose a *fitness* measure that is extremely unnatural, gearing evolution toward a desired, fixed metric (some critics compare it more to *selective breeding*). Such artificial evolution will not match the creative diversity of natural evolution.

Nevertheless, an artificial, viability-oriented form of evolution may be used for more theoretical and aesthetic branches of artificial life research. In these cases the viability measure arises as an emergent property of underlying laws of the world, such as the requirement to maintain energetic/metabolic balance or to maintain structural integrity, as well as the collective effects of multiple species and non-living dynamics within the environment. For this reason a viability-oriented approach is sometimes referred to as *ecosystemic selection*. [See discussion here](http://link.springer.com/chapter/10.1007%2F978-3-540-78761-7_42)

### Survival of the viable

Darwin's theory is sometimes misrepresented as "survival of the fittest" or even the competitive "law of the jungle". We have already seen that the notion of "fittest" is misguided, since it implies a static absolute measure for something that is both dynamic and highly contextual. An individual or species does not need to be the fittest, merely fit enough to be viable. Nor is competition the prime mode of interaction between species; most species are relatively independent, and the ones that do closely interact are more likely to be collaborative (symbiotic, parasitic, etc.) than competitive.

> Evolution does not imply that individuals display selfish, competitive behavior. When Dawkins described evolution in terms of [selfish genes](http://en.wikipedia.org/wiki/The_Selfish_Gene), it indicates a gene-centric perspective on evolution that implies selfless and sometimes altruistic behavior in organisms. 

### Neutral drift

There is no reason to suppose that every variation affects viability (neither positively nor negatively). If a variation occurs that does not negatively or positively affect the reproductive capability of an individual in the environment, this variation is called **neutral**. Such neutral variations can tend to be accumulated over time (since there is a chance of variation at each reproduction), whose overall effect is to spread the gene pool of a population. If small changes can be accumulated in this way, over time the gene pool may even move quite far from the origin without major changes in selective fitness; this is called **neutral drift**. 

> It may be an important mechanism to escape evolutionary dead-ends (local minima in the fitness landscape). This is certainly true for many artificial evolutionary systems. It has also been hypothesized as an explanation for the long chunks of apparently unused DNA in our own genome. 

Furthermore, natural evolution apperas to progress not in a smooth movement, but rather with periods of intense diversity and instability followed by extended periods of relative stability (a **"punctuated equilibrium"**). Neutral drift has also been proposed as a possible explanation for this behavior.

## Heredity and variation: genetics

A continuous generation of novel diversity, new characteristics, is essential to the theory of natural selection. However the theory does not account for how diversity arises, simply that there must be a mechanism, which usually operates during reproduction. 

In 1865 Mendel proposed that characteristics are transmitted to offspring through particles of matter (which we now call **genetic material**). Schroedinger conjectured that these materials must be aperiodic crystals, and the actual structure of DNA was identified several years later. The *"modern synthesis"* in biology today has integrated genetics with natural evolution, through the interaction of genotypes and phenotypes:

- The **phenotype** is the manifestation of the genotype, the individual organism in the population. It is physical and dynamic. Natural selection only operates on the phenotypic level.
- The **genotype** is the genetic material that is transmitted during reproduction. It encodes information that is usually static during a lifetime. Different information leads to different phenotypic variations, or even different species. Heritable variation and the creation of new characteristics operates only at the genotypic level. 

Hence the modern synthesis requires not only a model for how variation is introduced, but also how genetic material is transfered, how the phenotype accordingly emerges from the genotype (*developmental models*), and what other roles it plays. These mechanisms are complex and not yet fully understood, but much progress has been made.

> Briefly: a biological cell contains a vast array of different proteins, whose concentrations determine structures and behaviors of the cell. The proteins are specifed by information in the DNA genetic material (grouped physically into **chromosomes**). When a cell reproduces by **mitosis**, a copy of the DNA is made in the new cell. The sections of a DNA chromosome that code for behavior are called **genes**. These regions are constantly being **transcribed**, producing a specific RNA strand for each coding gene region which is in turn used to produce a specific protein; the protein string immediately folds up (in a way we cannot yet simulate) into a particular reactive shape which specifies the protein's behavioral role in the cell. This is a one-directional flow of information: Coding DNA -> RNA -> folding -> active protein. In addition to coding regions genes may also have  **regulatory region** which can react with specific proteins to activate or inhibit the coding-protein system, forming a complex **regulatory network** of interactions by which one gene can activate or inhibit another, and also specify changes of behavior of a cell according to environmental conditions such as chemical signals. These networks can be fantastically complex even in very simple organisms, according to the scientific results of **functional genomics**. Between the coding and regulatory regions of DNA, there are huge sections of **nongenic** DNA, whose role (or lack thereof) is not yet understood.

![Rendering](img/transcription.jpg)

[The current theory of cell replication and DNA transcription been beautifully illustrated by Drew Berry](http://www.youtube.com/watch?v=WFCvkkDSfIU); and [more of his animations here](http://www.youtube.com/watch?v=yKW4F0Nu-UY&list=PL3DB3C131CBCD2A0F&index=5)

Genetic variation can occur during replication of the genome, such as copying-error *mutations* (reversals of segments, insertion & removal of segments, changing individual elements in the sequence, and pair-wise substitution over whole sections) and *recombination* (taking sections from two different parent genes to construct a new child gene). 

## Artificial evolution

An artificial evolutionary system thus requires:

1. A representation of genotypes.
2. A mechanism to produce phenotypes from genotypes (development).
3. A mechanism to evaluate the fitness (or viability) of phenotypes.
4. Mechanisms to introduce diversity to a genotype.

The system is then run by these steps:

1. **Initialization** of a 'seed' population of genotypes
2. **Development** of phenotypes from the genotypes 
3. Evaluation and **selection** of best/viable candidates of phenotypes, according to fitness criteria or ongong viability conditions. Note that simply taking the best candidate alone is not necessarily the ideal strategy; selecting randomly by proportion to fitness ("roulette wheel" selection) may better overcome local maxima.
4. **Reproduction**, creating new genotypes (applying **mutation** and **recombination** for creative variety), according to variation rates/probabilities.
5. Repeat from step (2) or terminate if a terminating condition is satisfied (such as sufficient fitness). 

Steps 2-5 may be run in lock-step, or asynchronously with overlapping individual life-spans.

### Genetic representation

The representation of the genotype, and mechanisms of development, genetic transfer and variation, must be provided by the author. Many systems represent genetic information as a sequence of data, such as a string of characters or binary digits. Some systems use more elaborate structures (trees, networks) that are reducible to sequences. In artificial evolution an obvious analogy of the genotype-as-code and phenotype-as-running-program underlies most systems. Fewer systems provide full models of development and genetic transfoer, assuming instead a relatively predictable translation. Some systems explicity encode numeric values in the genotype (this is not naturalistic). 

### Variation

The mechanisms of variation possible partly depend on the representation chosen. The two most common principles of variation in artificial evolution are naturally inspired:

- Random **mutation**; akin to errors copying DNA. If the genome is represented as a binary string, then random locations in the string may be replaced by new random characters. For example, a parent "dog" could produce children such as "fog", "dqg", and so on. Obviously some mutations will not create viable individuals.
- Sexual **cross-over** (or **recombination**): akin to sexual reproduction in biology. As a binary string, the child takes the first fraction from one parent, and the remainder from the other. For example, breeding the strings "dog" and "cat" could generate children such as "dot", "dat", "cag" and "cog". A more flexible system might also permit "doat", "caog", "dt", etc. 
- Other variations (insertion, deletion, inversion) are less common, but have been used.

## Selection in Evolutionary Art and Music

One of the central problems in evolutionary art and music is how to implement selection.

- A predefined fitness function. For this to be possible, a formal measure of aesthetic quality is required; but can we really do that?
- Interactive selection. Pioneered by Dawkins' Biomorphs program and Karl Sims' evolved images, in which several candidates are presented to human observers, who apply the selection manually. Also known as aesthetic selection. A problem here is that the human becomes the bottleneck of evolution, constraining population sizes and rates of evolution to very small scales. It may arguably also tend toward selecting for the aesthetic average rather than the remarkable.
	- An interesting variation is to make the selection continuous and implicit. Jon McCormack's Eden measured fitness globally according to how long gallery visitors remained in front of a particular evolving sub-population.
- First evolve a population of artificial art critics, trained from human-evaluated examples, and then use these to apply selection criteria to a population of candidate artworks.

Artificial co-evolution, where one population represents the candidate products, and the other population represents artificial critics.

![Karl Sims](http://www.karlsims.com/papers/ksf11.gif)
See [Karl Sims' Genetic Images](http://www.karlsims.com/genetic-images.html).
[1991 Siggraph Paper](http://www.karlsims.com/papers/siggraph91.html)

Karl Sims
Scott Draves
[1]	S. Draves, “Evolution and Collective Intelligence of the Electric Sheep,” The Art of Artificial Evolution, 2008.

### Caveats

Artificial evolution generates results with randomness, without formal proofs. It may take a long time or a lot of processing power to find a satisfactory result, or may not reach a result at all. 

Fitness landscapes


----

Why use reproduction for evolution? In the face of an unpredictable environment, we cannot know which strategy will be best; we can try small variations, and hedge our bets by making very many of them (population diversity). An individual loss is not catastrophic, but a few successes can be learned from. Furthermore, the face of unpredictibility implies that what was true today may not be tomorrow, so the flexibility to avoid timeless commitment is also a good strategy; but the inheritance of choices is a useful option when the environment retains some stability. If the world were fully predictable, a rational, teleological, monothematic strategy would be preferable. But the world isn't totally random either (if it was, there would be no valid strategy worth pursuing.) Red queen.

## Discussion examples

[Evolving 2D cars](http://boxcar2d.com/)

[Evolving soft robots](https://www.youtube.com/watch?feature=player_embedded&v=z9ptOeByLA4)