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
            if (ship && attacked.has(`${x},${y}`)) {
                cell.classList.add("hit");
            } else if (!ship && attacked.has(`${x},${y}`)) {
                cell.classList.add("miss");
            } else if (ship && showShips) {
                cell.classList.add("ship");
            }

            const statusText = document.getElementById("status");
            const rotateButton = document.getElementById("rotate");

            let currentShipIndex = 0;
            let direction = "horizontal";

            function updateStatus() {
                if (currentShipIndex >= human.ships.length) {
                    statusText.textContent = "All ships placed";
                } else {
                    const ship = human.ships[currentShipIndex];
                    statusText.textContent = `Place ship ${currentShipIndex + 1} of ${human.ships.length} (lenth ${ship.length} - direction: ${direction}`;
                }
            }

            rotateButton.addEventListener("click", () => {
                direction = direction === "horizontal" ? "vertical" : "horizontal";
                updateStatus();
            });

            humanGrid.addEventListener("click", (event) => {
                const cell = event.target.closest(".cell");
                if (!cell || currentShipIndex >= human.ships.length)
                    return;

                const ship = human.ships[currentShipIndex];
                const placed = human.gameboard.placeShip(
                    ship,
                    [Number(cell.dataset.x), Number(cell.dataset.y)],
                    direction
                );

                if(placed) {
                    currentShipIndex++;
                    renderBoard(human, humanGrid, true);
                    updateStatus();
                }
            });

            updateStatus();



            gridElement.appendChild(cell);
        }
    }
}
//human.gameboard.placeShip(human.ships[0], [0, 0], "horizontal");

renderBoard(human, humanGrid, true);
renderBoard(computer, computerGrid, false);