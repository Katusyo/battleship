import Ship from "./battleship.js";
import Gameboard from "./board.js";

const Fleet = [
    {name: "Battleship", length: 4},
    {name: "Carrier", length: 5},
    {name: "Cruiser", length: 3},
    {name: "Destroyer", length: 2},
    {name: "Submarine", length: 3},
];

class Player {
    constructor(name, isComputer = false) {
        this.name = name;
        this.isComputer = isComputer;
        this.gameboard = new Gameboard;
        this.ships = Fleet.map(({length}) => new Ship(length));
    }

    hasLost() {
        return this.gameboard.sunkShips();
    }
}

export default Player;