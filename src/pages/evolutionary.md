title: Evolutionary systems


# Evolutionary systems

There have been more than four decades of computational systems inspired by natural evolution. It has become a major field of machine learning and optimization. Beyond AI, it has been used in hardware and circuit design, robotics, and more recently in industrial design and architecture. It has of course also been deeply explored in art and music.

## Natural and artificial evolution

The theory of natural evolution combines **population, diversity, heredity and selection**. Evolution requires a **population** of individuals that exhibit **diversity** (both similarities and variations between each other, both within and between species). These individuals can produce new individuals; offspring that exhibit similarites with the parent(s) through **heredity**. However not all of the population can successfully reproduce; Charles Darwin's theory of natural **selection** proposed in 1859 that the section of the population that reproduces is not random, but regulated by environmental constraints (such as available food, populations of symbionts, predators and parasites, and so on). 

![Origin of the Species](img/origin_of_the_species.jpg)

Artificial evolution mirrors this abstract structure:

- Maintain a population of finite individuals (which can reproduce)
- Support variation (including new characteristics) in the population
- Provide a mechanism of heredity between generations
- Provide a mechanism of selection 

The main differences are that the underlying mechanisms specified by us in advance. Most importantly, *the mechanism of selection is usually predetermined and static*. This is an important difference between *artificial* and *natural* evolution: most artificial systems are used toward a particular goal (*teleological*, even in artistic pursuits), natural evolution is adaptive in an open-ended, undirected, goal-less (*non-teleological*) manner\*. *Natural evolution does not imply progress*, since the environment (and selective criteria) evolves along with each species. Since there is no absolute goal or progress, the most we can measure in natural evolution is the changing frequencies over time of individual species, or of individual characteristics of a population.

> \* A debate has arisen in recent years regarding evidence (or the lack thereof) for transcendental, teleological aspects of natural evolution; partly driven by conflicts between religous edicts and evolutionary science. Regardless of personal beliefs, in the context of this course we should approach the subject of evolution with a philosophical attitude that avoids essentialist thought.

### Viability and ecosystemic evolution

The survival of a natural species depends on its *viability*; the ability of enough individuals to live long enough to reproduce within an unpredictable environment. There is no pre-defined (*a priori*) fitness measure. Most artificial evolutionary however systems impose a *fitness* measure that is extremely unnatural, gearing evolution toward a desired, fixed metric (some critics compare it more to *selective breeding*). Such artificial evolution will not match the creative diversity of natural evolution.

Nevertheless, an artificial, viability-oriented evolution is sometimes used in the more theoretical and aesthetic branches of artificial life research. In these cases the viability measure arises as an emergent property of underlying energetic/metabolic survival and collective effects of multiple species and non-living dynamics of the environment. For this reason this is sometimes called *ecosystemic selection*. [See discussion here](http://link.springer.com/chapter/10.1007%2F978-3-540-78761-7_42)

### Common misconceptions

Darwin's theory is sometimes misrepresented as "survival of the fittest" or even the competitive "law of the jungle". We have already seen that the notion of "fittest" is misguided, since it implies a static absolute measure for something that is both dynamic and highly contextual. An individual or species does not need to be the fittest, merely fit enough to be viable. Nor is competition the prime mode of interaction between species; most species are relatively independent, and the ones that do closely interact are more likely to be collaborative (symbiotic, parasitic, etc.) than competitive. Evolution does not imply that individuals display selfish, competitive behavior. When Dawkins described evolution in terms of [selfish genes](http://en.wikipedia.org/wiki/The_Selfish_Gene), it indicates a gene-centric perspective on evolution that implies selfless and altruistic behavior in organisms. 

If a variation occurs that does not negatively or positively affect the reproductive capability of an individual in the environment, this variation is called **neutral**. Such neutral variations can tend to be accumulated over time (since there is a chance of variation at each reproduction), whose overall effect is to spread the gene pool of a population. If small changes can be accumulated in this way, over time the gene pool may even move quite far from the origin without major changes in selective fitness; this is called **neutral drift**. It may be an important mechanism to escape evolutionary dead-ends (local minima in the fitness landscape). This is certainly true for many artificial evolutionary systems. It has also been hypothesized as an explanation for the long chunks of apparently unused DNA in our own genome. 

Furthermore, natural evolution apperas to progress not in a smooth movement, but rather with periods of intense diversity and instability followed by extended periods of relative stability (a **"punctuated equilibrium"**). Neutral drift may be one explanation for this behavior, but this is not conclusive.

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

An artificial evolutionary system can be run by these steps:

1. **Initialization** of a 'seed' population of genotypes
2. **Development** of phenotypes from the genotypes (often instantaneous)
3. Evaluation and **selection** of best/viable candidates of phenotypes, according to fitness criteria or ongong viability conditions
4. **Reproduction**, creating new genotypes (applying **mutation** and **recombination** for creative variety)
5. Repeat from step (2) or terminate if a terminating condition is satisfied (such as sufficient fitness). 

Steps 2-5 may be run in lock-step, or asynchronously with overlapping individual life-spans.

### Genetic representation

The representation of the genotype, and mechanisms of development, genetic transfer and variation, must be provided by the author. Many systems represent genetic information as a sequence of data, such as a string of characters or binary digits. Some systems use more elaborate structures that are reducible to sequences. In artificial evolution an obvious analogy of the genotype-as-code and phenotype-as-running-program underlies most systems. Few systems provide full models of development and genetic transfoer, assuming instead a relatively instantaneous and predictable translation (this may be a serious limitation). Some systems explicity encode numeric values in the genotype (this is not naturalistic). 

### Variation

The mechanisms of variation possible partly depend on the representation chosen. The two most common principles of variation in artificial evolution are naturally inspired:

- Random **mutation**; akin to errors copying DNA. If the genome is represented as a binary string, then random locations in the string may be replaced by new random characters. For example, a parent "dog" could produce children such as "fog", "dqg", and so on. Obviously some mutations will not create viable individuals.
- Sexual **cross-over** (or **recombination**): akin to sexual reproduction in biology. As a binary string, the child takes the first fraction from one parent, and the remainder from the other. For example, breeding the strings "dog" and "cat" could generate children such as "dot", "dat", "cag" and "cog". 
- Other variations (insertion, deletion, inversion) are less common, but have been used.

## Evolutionary Art and Music

One of the central problems in evolutionary art and music is how to implement selection.

- A predefined fitness function. For this to be possible, a formal measure of aesthetic quality is required; but can we really do that?
- Interactive selection. Pioneered by Dawkins' Biomorphs program and Karl Sims' evolved images, in which several candidates are presented to human observers, who apply the selection manually. Also known as aesthetic selection. A problem here is that the human becomes the bottleneck of evolution, constraining population sizes and rates of evolution to very small scales. It may arguably also tend toward selecting for the aesthetic average rather than the remarkable.
	- An interesting variation is to make the selection continuous and implicit. Jon McCormack's Eden measured fitness globally according to how long gallery visitors remained in front of a particular evolving sub-population.
- First evolve a population of artificial art critics, trained from human-evaluated examples, and then use these to apply selection criteria to a population of candidate artworks.

Artificial co-evolution, where one population represents the candidate products, and the other population represents artificial critics.

Karl Sims
Scott Draves
[1]	S. Draves, “Evolution and Collective Intelligence of the Electric Sheep,” The Art of Artificial Evolution, 2008.

### Caveats

Artificial evolution generates results with randomness, without formal proofs. It may take a long time or a lot of processing power to find a satisfactory result, or may not reach a result at all. 

Fitness landscapes