import Player from "./player.js";
import "./styles.css";


const boardContainer = document.getElementById("board");
const statusText = document.getElementById("status");

const human = new Player("PL1");
const computer = new Player("CPU", true);
const rotateButton = document.getElementById("rotate");
const playAgainButton = document.getElementById("play-again");
playAgainButton.style.display = "none";

const humanGrid = document.getElementById("human-grid");
const computerGrid = document.getElementById("computer-grid");

const startButton = document.getElementById("start");
const resetButton = document.getElementById("reset");
const confirmControls = document.getElementById("confirm-controls");
confirmControls.style.display = "none";

let phase = "placing";

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

            gridElement.appendChild(cell);
        }
    }
}

let currentShipIndex = 0;
let direction = "horizontal";

function updateStatus() {
    if (phase === "placing") {
        const ship = human.ships[currentShipIndex];
        statusText.textContent = `Place ship ${currentShipIndex + 1} of ${human.ships.length} (length ${ship.length} - direction: ${direction}`;
    } else if (phase === "confirming") {
        statusText.textContent = "All ships placed! Start the game, or reset and place them again.";
    } else {
        statusText.textContent = "Your turn - click the enemy board to attack.";
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
        if (currentShipIndex >= human.ships.length) {
            phase = "confirming";
            confirmControls.style.display = "block";
        }
        renderBoard(human, humanGrid, true);
        updateStatus();
    }
});

function placeShipsRandomly(player) {
    player.ships.forEach((ship) => {
        let placed = false;
        while (!placed) {
            const x = Math.floor(Math.random() * 10);
            const y = Math.floor(Math.random() * 10);
            const dir = Math.random() < 0.5 ? "horizontal" : "vertical";
            placed = player.gameboard.placeShip(ship, [x, y], dir);
        }
    });
}

let gameOver = false;

function computerTurn() {
    let attacked = false;
    while (!attacked) {
        const x = Math.floor(Math.random() * 10);
        const y = Math.floor(Math.random() * 10);
        attacked = human.gameboard.receiveAttack([x, y]) !== false;
    }
    renderBoard(human, humanGrid, true);
}

computerGrid.addEventListener("click", (event) => {
    if (gameOver || phase !== "playing")
        return;
    const cell = event.target.closest(".cell");
    if (!cell)
        return;

    const result = computer.gameboard.receiveAttack([
        Number(cell.dataset.x),
        Number(cell.dataset.y),
    ]);
    if (result === false)
        return;

    renderBoard(computer, computerGrid, false);

    if (computer.hasLost()) {
        gameOver = true;
        statusText.textContent = "You win! All enemy ships sunk.";
        return;
    }

    computerTurn();

    if (human.hasLost()) {
        gameOver = true;
        statusText.textContent = "You lose! All your ships have sunk.";
    }
});

function endGame(message) {
    gameOver = true;
    statusText.textContent = message;
    playAgainButton.style.display ="block";
}

startButton.addEventListener("click", () => {
    if (phase !== "confirming")
        return;
    placeShipsRandomly(computer);
    phase = "playing";
    confirmControls.style.display = "none";
    updateStatus();
});

resetButton.addEventListener("click", () => {
    if (phase !== "confirming")
        return;
    human.gameboard.reset();
    currentShipIndex = 0;
    phase = "placing";
    confirmControls.style.display = "none";
    renderBoard(human, humanGrid, true);
    updateStatus();
});

playAgainButton.addEventListener("click", () => {
    human.reset();
    computer.reset();
    currentShipIndex = 0;
    direction = "horizontal";
    gameOver = false;
    phase = "placing";
    playAgainButton.style.display = "none";
    renderBoard(human, humanGrid, true);
    renderBoard(computer, computerGrid, false);
    updateStatus();
});

renderBoard(human, humanGrid, true);
renderBoard(computer, computerGrid, false);

updateStatus();