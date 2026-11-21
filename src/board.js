import Ship from "./battleship.js";

class Gameboard {
    constructor(size = 10) {
        this.size = size;
        this.board = this.createBoard();
        this.ships = [];
        this.missedAttacks = [];
        this.attacked = new Set();
    }

    createBoard() {
        const board = [];
        for (let i = 0; i < this.size; i++) {
            const row = [];
            for (let j = 0; j < this.size; j++) {
                row.push(null);
            }
            board.push(row);
        }
        return board;
    }

    isValidPosition(position) {
        const [x, y] = position;
        return x >= 0 && x < this.size && y >= 0 && y < this.size;
    }

    placeShip(ship, startPosition, direction = "horizontal") {
        if (!Array.isArray(startPosition)) return false;
        if (!["horizontal", "vertical"].includes(direction)) {
            return false;
        }

        const [startX, startY] = startPosition;
        const positions = [];

        for (let i = 0; i < ship.length; i++) {
            const x = direction === "vertical" ? startX + i : startX;
            const y = direction === "horizontal" ? startY + i : startY;

            if (!this.isValidPosition([x, y]) || this.board[x][y] !== null) {
                return false;
            }
            positions.push([x, y]);
        }

        positions.forEach(([x, y]) => {
            this.board[x][y] = ship;
        });

        this.ships.push(ship);
        return true;
    }

    receiveAttack(position) {
        if (!this.isValidPosition(position)) return false;

        const [x, y] = position;
        const coordinates = `${x},${y}`;

        if (this.attacked.has(coordinates)) {
            return false;            
        }
        
        this.attacked.add(coordinates);
        const target = this.board[x][y];

        if (target instanceof Ship) {
            target.hit();
            return "hit";
        }

        this.missedAttacks.push(position);
        return "miss";
    }

    sunkShips() {
        return this.ships.length > 0 && this.ships.every((ship) => ship.isSunk());
    }
}

export default Gameboard;