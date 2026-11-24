import Ship from "./battleship.js";
import Gameboard from "./board.js";
import Player from "./player.js";
import "./styles.css";

const ship = new Ship();
const board = new Gameboard();
const boardContainer = document.getElementById("board");
const statusText = document.getElementById("status");

const human = new Player("PL1");
const computer = new Player("CPU", true);

const humanGrid = document.getElementById("human-grid");
const computerGrid = document.getElementById("computer-grid");

function renderBoard(player, gridElement, showShips) {
    gridElement.innerHTML ="";
    const { board, attacked } = player.gameboard;

    for (let x = 0; x < board.length; x++) {
        for (let y = 0; y < board[x].length; y++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.x = x;
            cell.dataset.y = y;

            const ship = board[x][y];
            if (ship && attacked.has(` ${x},${y}` )) {
                cell.classList.add("hit");
            } else if (!ship && attacked.has(` ${x},${y}` )) {
                cell.classList.add("miss");
            } else if (ship && showShips) {
                cell.classList.add("ship");
            }

            gridElement.appendChild(cell);
        }
    }
}
human.gameboard.placeShip(human.ships[0], [0, 0], "horizontal");

renderBoard(human, humanGrid, true);
renderBoard(computer, computerGrid, false);