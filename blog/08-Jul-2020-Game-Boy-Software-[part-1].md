<!-- tags: game-boy, dev, retro-programming -->

## Intro

I've being - as I said
[HERE](./26-Jun-2020-Game-Boy-Adventures.html) and
[HERE](./29-Jun-2020-I-Bought-Game-Boys.html) - that I'm programming for
the original Game Boy.

It's being a pleasure and I'm really, really happy with the progress so far, and
currently I'm developing two small games for it.

- **The Chick can't Fly**:  a small action / skill oriented game that you are supposed
  to control where the Chick will land and make your way thru the platforms.
  <center>
    <img
        width=30%
        alt="Gameplay of a the development version of The Chick can't fly"
        src="/img/blog/the_chick_gameplay_jul_08_2020.gif"></img>
  <center>

- **Mines**: a small clone of the minesweeper for the Game Boy but with some
  "_nice_ and _apealling_" visuals ;D
  <center>
    <img
        width=30%
        alt="Gameplay of a prototype version of Mines"
        src="/img/blog/mines_gameplay_jul_08_2020.gif"></img>
  <center>


## The tools

Right now I'm using C to develop the games, so to be able to compile and build them
I'm the [GBDK](http://gbdk.sourceforge.net/) under WSL - yep no GNU/Linux boxes for now -
but every now and then I build the games using OSX and the version for Win32 as well.

To develop the graphics I'm using the
[Gameboy Tile Designer](https://www.devrs.com/gb/hmgd/gbtd.html) and the
[Gameboy Map Builder](https://www.devrs.com/gb/hmgd/gbmb.html) by Harry Mulder.

To debug the game I'm using the **AWESOME** [BGB](https://bgb.bircd.org/) emulator.
I have ZERO complaints about it right now, it works like magic! It let me inspect the
disassembly and the memory (including the graphics memory) of the game and there's
a neat feature that reloads the ***```ROM```*** if it has changed.

While I'm quite happy with the things - and **really grateful** for the original
developers of those tools - the graphics tools not quite what I expect or want to.

I mean, the original software is fine but we need to understand that it was developed in
another era, with another requirements and mindset. They have the latest release from 1999 - This is **21 years ago**.

It's just to cumbersome to do some things and I found myself losing too much time
fighting against the tool than making the game - which is what I'm interested in ;D


## A word before...

Again, before saying anything about the tools, I'd like to say that I'm really grateful
for them and I appreciate a lot the effort and time that Harry had put to develop it.

They work fine and do the job, the things that I'm gonna say is more about **my workflow**
desires and the way that I'd like to see things going - Thanks Harry for putting this up,
and mostly thanks for making the source code free for all ;D


## My workflow

Most of the times when I'm developing a part of the game, I use very crude graphics,
just enough to be able to layout the memory and understand the problem deeper.

So when I finished the basic setup I start to pay more attention to the graphics
themselves and the flow is more or less like this:
<ol>
<li> Go to <b>GBTB</b>
<ul>
    <li>Change the tile size, so the view let me to draw the pixels with more context.</li>
    <li>Draw the pixels.</li>
    <li>Change the tile size back to 8x8 to export.</li>
    <li>Save the file. </li>
    <li>Export the graphics.</li>
        Unfortunately there's no way to be sure that you exported the changes.
</ul>

<li>Go to <b>GBMB</b></li>
<ul>
    <li>Setup the map with the new graphics.</li>
    <li>Mostly done just once, but if the tile order is changed in the previous
    step we need to change things here again.</li>
    <li>Change the tile size back to 8x8 to export.</li>
    <li>Save the file. </li>
    <li>Export the map.</li>
        Unfortunately there's no way to be sure that you exported the changes.
</ul>

<li>Go to <b>VSCode</b></li>
<ul>
    <li> Build the code. </li>
</ul>

<li>Go to <b>BGB</b></li>
<ul>
    <li>Check if the things works nicely on the game...</li>
</ul>

<li>Repeat...</li>
</ol>

As you tell, it's a lot of application switch, just to check if what we did with
the graphics has the intended results on the game and/or if it looks nice.
Additionally the ***GBTB*** is quite crude in the way to view and edit the pixels,
making more difficult than already is to edit the things.

After sometime I feel tired of ```alt+tab``` - not saying that the hands and arms start
to really feel pain - and the joy of doing the things start to fade out.


## What I'd like to have

In the ideal scenario, I'd like to have one application where I could make the pixel-art,
setup the tiles and the maps - this will make the steps _(1)_ and _(2)_ become just one.

With different ways to visualize/setup how the graphics are exported, would be easy to
paint the graphics as a whole while exporting them as 8x8 tiles, and since the tool would
have more information about how the things are used, it could have more options to how
to better identify possible optimizations about the graphics - but let's talk about that
later.

With simple options as ___export on save___, and ___save on change___ the hassle of exporting
things is past. Which would be very nice, because countless times you forget to export
the tiles and need to go back from the beginning, making you lose even more time. Worse than
that, after some time you start to do the export/save thing even when you don't need :(

To make things even better, an option to run an external command would make the step _(3)_
not needed anymore, and since the ***BGB*** already hot-reload the things for us, would be
just a matter of checking if the changes that we made is what we want.

<br>
So to summarize, I want a program that:

- Edit the pixels (Drawing-mode).
- Edit the maps (Map-mode).
- Organize the tiles (Tile-mode).
- Be insightful about the contents of the graphics.<br>
    How different are the tile data? Can't we redraw it in another way that
    would make the needs of it disappear?
- Let me to run external commands easily.
- Have arbitrary zoom levels. <br>
  The original tools don't :(


## The plan

Well, this post is already to big to describe how I plan to achieve this, so I'll stop here for today. Next steps is to detail a little bit more the features that I want to have on the new application and start to research about the tech that will make it possible.

Anyways, I'd like to thank you for reading all of this ;D
