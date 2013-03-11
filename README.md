GCT753
======

This is the software environment used for *GCT753: Topics in Computational Design (Artificial Natures)*, at the GSCT, KAIST, Korea (Spring 2013). It is a lightweight wrapper of [LuaJIT](www.luajit.org), derived from [this project](http://grrrwaaa.github.com/av/), which includes some media-support bindings, and several modules (libraries) to support the [course content](http://grrrwaaa.github.com/gct753/).

## Download

The code and pre-compiled binaries are in the github repository at the links below. From time to time this repo will be updated with more examples and features, so please make sure to grab these changes. You can grab the zip directly or clone (or fork) the git repo and pull the changes:

- [Download](https://github.com/grrrwaaa/gct753/zipball/master) **ZIP file**
- [Download](https://github.com/grrrwaaa/gct753/tarball/master) **TAR ball**
- [Clone from](https://github.com/grrrwaaa/gct753) **Github**
- [Fork from](https://github.com/grrrwaaa/gct753/fork_select) **Github**

## Running

- **Windows:** drag a ```.lua``` file onto the ```av.exe``` application.
- **OSX / Linux:** open a terminal window, ```cd ``` to the downloaded folder, then run ```av_osx <filename>``` or ```av_linux <filename>``` where <filename> is the ```.lua``` file to run (e.g. ```draw.lua```).

While running, the **Esc** key will toggle full-screen mode, and the **Space** key will toggle the ```update``` function on and off. 

Also while the script is running it will monitor the ```.lua``` file for changes, and reload the script automatically if this file is updated on disk. To edit ```.lua``` files, any text editor will do. Freely available editors with Lua syntax highlighting include:

- **Windows:** [Notepad++](http://notepad-plus-plus.org/download/v6.3.html)
- **OSX:** [TextWrangler](http://www.barebones.com/products/textwrangler/)
- **Linux:** Most distributions already include a suitable text editor (such as Gedit), or can install one through apt-get.

## Documentation

[Reference pages](http://grrrwaaa.github.com/gct753/docs/reference.html)
