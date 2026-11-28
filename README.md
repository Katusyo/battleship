# Battleship

A browser-based Battleship game built with vanilla JavaScript, following The Odin Project's curriculum. The game logic was written test-first with Jest, then connected to a DOM interface built with webpack.

**Live demo.** https://katusyo.github.io/battleship/

# Features

- 1 Player mode against a computer opponent that uses a hunt-and-target strategy - after a hit, it targets the neighboring cells until the ship sinks, instead of firing purely at random
- 2 Players mode (pass-and-play); both players place their fleets on the same device, with a coverscreen between turns so neither player can see the others board
- Drag-and-drop ship placement from a ship dock, with a live preview of where the ship will land - click-to-place works too, and the rotate button changes the orientation
- Full game loop: placement, a confirmation step with the option to reset, alternating attacks, and a win/lose screen with a Play again button

## Built with

- JavaScript (ES modules)
- Webpack 5 and Babel
- Jest for the test suite
- HTML and CSS

## How it works

The game logic is separated from the interface:
- Ship - tracks a ship's length and hits, and reports when it is sunk
- Gameboard - places ships, receives attacks, and tracks hits, misses, and whenever the whole fleet has sunk
- Player - owns a gameboard and a fleet of five ships (Carrier, Battleship, Cruiser, Submarine, Destroyer)

The interface is driven be an explicit phase state machine (placing -> confirming -> playing), which keeps placement, the turn-switching screens, and the battle itself from interfering with each other.

## Run it locally

git clone https://github.com/Katusyo/battleship.git
cd battleship
npm install
npx webpack

Then open the generated dist/index.html in a browser - or just play the livedemo.

## Tests

The core logic was developed test-first. The Jest suite (25 tests) covers ship placement (including out-of-bounds and overlapping ships), attack results, and win detection.

npm instal
npm test

# What I leaned

- Test driven development: writing the tests fir the game logic before the logic itself
- Keeping game logic independent from the DOM, so it can be tested in isolation
- Managing application state with an explicit state machine instead of scattered flags
- The HTML drag-and-drop API, and event handling for grid- based interaction

## About

Built as part of The Odin Project's JavaScript course (Battleship project).
