import { describe, expect, test } from "@jest/globals";
import Ship from "../src/battleship.js";
import Gameboard from "../src/board.js";

describe("Ship", () => {
    test("starts with 0 hits and is not sunk", () => {
        const ship = new Ship(3);

        expect(ship.length).toBe(3);
        expect(ship.hits).toBe(0);
        expect(ship.isSunk()).toBe(false);
    });

    test("hit() increases hits by 1", () => {
        const ship = new Ship(3);
        ship.hit();

        expect(ship.hits).toBe(1);
    });

    test("is not sunk after 2 hits on a length-3 ship", () => {
        const ship = new Ship(3);
        ship.hit();
        ship.hit();

        expect(ship.isSunk()).toBe(false);
    });

    test("is sunk after exactly 3 hits on a length-3 ship", () => {
        const ship = new Ship(3);
        ship.hit();
        ship.hit();
        ship.hit();

        expect(ship.isSunk()).toBe(true);
    });

    test("ships track their hits independently", () => {
        const a = new Ship(2);
        const b = new Ship(2);
        a.hit();
        a.hit();

        expect(a.isSunk()).toBe(true);
        expect(b.hits).toBe(0);
        expect(b.isSunk()).toBe(false);
    });
})

describe("Board placement", () => {
    test("places a ship horizontally", () => {
        const board = new Gameboard();
        const ship = new Ship(3);

        expect(board.placeShip(ship, [0, 0], "horizontal")).toBe(true);
        expect(board.receiveAttack([0, 0])).toBe("hit");
        expect(board.receiveAttack([0, 1])).toBe("hit");
        expect(board.receiveAttack([0, 2])).toBe("hit");
    });

    test("places a ship vertically", () => {
        const board = new Gameboard();
        const ship = new Ship(3);

        expect(board.placeShip(ship, [0, 0], "vertical")).toBe(true);
        expect(board.receiveAttack([0, 0])).toBe("hit");
        expect(board.receiveAttack([1, 0])).toBe("hit");
        expect(board.receiveAttack([2, 0])).toBe("hit");
    });

    test("rejects a ship that runs off the right side of the board", () => {
        const board = new Gameboard();
        const ship = new Ship(3);

        expect(board.placeShip(ship, [0, 8], "horizontal")).toBe(false);
    });

    test("rejects a ship that runs off the bottom of the board", () => {
        const board = new Gameboard();
        const ship = new Ship(3);

        expect(board.placeShip(ship, [8, 0], "vertical")).toBe(false);
    });

    test("rejects a ship that overlaps another ship", () => {
        const board = new Gameboard();
        board.placeShip(new Ship(3), [0, 0], "vertical");

        expect(board.placeShip(new Ship(3), [1, 0], "horizontal")).toBe(false);
    });
})

describe("Attacks and game overs", () => {
    test("records missed attacks properly", () => {
        const board = new Gameboard();
        board.placeShip(new Ship(2), [0, 0], "horizontal");

        expect(board.receiveAttack([5, 5])).toBe("miss");
        expect(board.receiveAttack([9, 9])).toBe("miss");
        expect(board.missedAttacks).toEqual([[5, 5], [9, 9]]);
    });

    test("prevents attacking the same coordinates twice", () => {
        const board = new Gameboard();
        const ship = new Ship(3);
        board.placeShip(ship, [0, 0], "horizontal");

        expect(board.receiveAttack([0, 0])).toBe("hit");
        expect(board.receiveAttack([0, 0])).toBe(false);
        expect(ship.hits).toBe(1);

        expect(board.receiveAttack([5, 5])).toBe("miss");
        expect(board.receiveAttack([5, 5])).toBe(false);
        expect(board.missedAttacks).toHaveLength(1);
    });

    test("tracks all ships and reports when all are sunk", () => {
        const board = new Gameboard();
        const battleship = new Ship(2);
        const submarine = new Ship(3);

        board.placeShip(battleship, [0, 0], "horizontal");
        board.placeShip(submarine, [7, 9], "vertical");

        expect(board.sunkShips()).toBe(false);

        board.receiveAttack([0, 0]);
        board.receiveAttack([0, 1]);
        expect(battleship.isSunk()).toBe(true);
        expect(board.sunkShips()).toBe(false);

        board.receiveAttack([7, 9]);
        board.receiveAttack([8, 9]);
        board.receiveAttack([9, 9]);
        expect(submarine.isSunk()).toBe(true);
        expect(board.sunkShips()).toBe(true);
    });
})