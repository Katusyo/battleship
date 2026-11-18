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