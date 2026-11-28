import Player from "./player.js";
import "./styles.css";

const statusText = document.getElementById("status");

const human = new Player("PL1");
const computer = new Player("CPU", true);
const shipDock = document.getElementById("ship-dock");
const rotateButton = document.getElementById("rotate");
const playAgainButton = document.getElementById("play-again");
playAgainButton.style.display = "none";

const humanGrid = document.getElementById("human-grid");
const computerGrid = document.getElementById("computer-grid");

const startButton = document.getElementById("start");
const resetButton = document.getElementById("reset");
const confirmControls = document.getElementById("confirm-controls");
confirmControls.style.display = "none";

const modeScreen = document.getElementById("mode-screen");
const mode1pButton = document.getElementById("mode-1p");
const mode2pButton = document.getElementById("mode-2p");
const switchScreen = document.getElementById("switch-screen");
const switchText = document.getElementById("switch-text");
const switchReadyButton = document.getElementById("switch-ready");

const player2 = new Player("PL2");
let mode = null;
let activePlacer = human;
let turnPlayer = human;

let phase = "menu";

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
    if (phase === "menu") {
        statusText.textContent = "Choose 1 Player or 2 Players to start.";
    } else if (phase === "placing") {
        const ship = activePlacer.ships[currentShipIndex];
        statusText.textContent = `Place ship ${currentShipIndex + 1} of ${activePlacer.ships.length} (length ${ship.length} - direction): ${direction}`;
    } else if (phase === "confirming") {
        statusText.textContent = "All ships placed! Start the game, or reset and place them again.";
    } else if (phase === "playing") {
        statusText.textContent = mode === "2p"
        ? `${turnPlayer.name}'s turn - click the enemy board to attack.`
        : "Your turn - click the enemy board to attack.";
    }
}

rotateButton.addEventListener("click", () => {
    direction = direction === "horizontal" ? "vertical" : "horizontal";
    updateStatus();
    renderDock();
});

function tryPlace(x, y) {
    if (phase !== "placing" || currentShipIndex >= activePlacer.ships.length)
        return;

    const ship = activePlacer.ships[currentShipIndex];
    const placed = activePlacer.gameboard.placeShip(ship,[x, y], direction);

    if (placed) {
        currentShipIndex++;
        if (currentShipIndex >= human.ships.length) {
            phase = "confirming";
            confirmControls.style.display = "block";
        }
        renderBoard(activePlacer, humanGrid, true);
        renderDock();
        updateStatus();
    }
}

humanGrid.addEventListener("click", (event) => {
    const cell = event.target.closest(".cell");
    if (!cell)
        return;
    tryPlace(Number(cell.dataset.x), Number(cell.dataset.y));
});

function renderDock() {
    shipDock.innerHTML = "";
    if (currentShipIndex >= human.ships.length)
        return;

    const ship = human.ships[currentShipIndex];
    const piece = document.createElement("div");
    piece.classList.add("ship-piece");
    if(direction === "vertical")
        piece.classList.add("vertical");
    piece.draggable = true;

    for (let i = 0; i < ship.length; i++) {
        const block = document.createElement("div");
        block.classList.add("block");
        piece.appendChild(block);
    }

    piece.addEventListener("dragstart", (event) => {
        event.dataTransfer.setData("text/plain", "ship");
    });
    piece.addEventListener("dragend", clearPreview);
    shipDock.appendChild(piece);
}

function clearPreview() {
    humanGrid.querySelectorAll(".preview").forEach((c) => c.classList.remove("preview"));
}

humanGrid.addEventListener("dragover", (event) => {
    if (currentShipIndex >= human.ships.length)
        return;
    event.preventDefault();

    const cell = event.target.closest(".cell");
    if(!cell)
        return;

    clearPreview();
    const ship = human.ships[currentShipIndex];
    const x = Number(cell.dataset.x);
    const y = Number(cell.dataset.y);
    for (let i = 0; i < ship.length; i++) {
        const cx = direction === "horizontal" ? x : x + i;
        const cy = direction === "horizontal" ? y + i : y;
        if (cx < 10 && cy < 10)
            humanGrid.children[cx * 10 + cy].classList.add("preview");
    }
});

humanGrid.addEventListener("drop", (event) => {
    event.preventDefault();
    clearPreview();

    const cell = event.target.closest(".cell");
    if (!cell)
        return;
    tryPlace(Number(cell.dataset.x), Number(cell.dataset.y));
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

let targetQueue = [];

function queueNeighbours(x, y) {
    const size = human.gameboard.board.length;
    const neighbours = [
        [x - 1, y],
        [x + 1, y],
        [x, y - 1],
        [x, y + 1],
    ];
    neighbours.forEach(([nx, ny]) => {
        if (nx < 0 || nx >= size || ny < 0 || ny >= size)
            return;
        if (human.gameboard.attacked.has(`${nx},${ny}`))
            return;
        if (targetQueue.some(([qx, qy]) => qx === nx && qy === ny))
            return;
        targetQueue.push([nx, ny]);
    });
}

function computerTurn() {
    let x, y, result;

    if (targetQueue.length > 0) {
        [x, y] = targetQueue.shift();
        result = human.gameboard.receiveAttack([x, y]);
    }
    
    if (result === undefined || result === false) {
        result = false;
        while (result === false) {
            x = Math.floor(Math.random() * 10);
            y = Math.floor(Math.random() * 10);
            result = human.gameboard.receiveAttack([x, y]);
        }
    }

    if (result === "hit") {
        const ship = human.gameboard.board[x][y];
        if (ship.isSunk()) {
            targetQueue = [];
        } else {
            queueNeighbours(x, y);
        }
    }

    renderBoard(activePlacer, humanGrid, true);
    renderDock();
}

computerGrid.addEventListener("click", (event) => {
    if (gameOver || phase !== "playing")
        return;
    const cell = event.target.closest(".cell");
    if (!cell)
        return;

    if (mode === "2p") {
        twoPlayerTurn(cell);
        return;
    }

    const result = computer.gameboard.receiveAttack([
        Number(cell.dataset.x),
        Number(cell.dataset.y),
    ]);
    if (result === false)
        return;

    renderBoard(computer, computerGrid, false);

    if (computer.hasLost()) {
        endGame("You win! All enemy ships sunk.");
        return;
    }

    computerTurn();

    if (human.hasLost()) {
        endGame("You lose! All your ships have sunk.");
    }
});

function twoPlayerTurn(cell) {
    const defender = turnPlayer === human ? player2 : human;
    const result = defender.gameboard.receiveAttack([
        Number(cell.dataset.x),
        Number(cell.dataset.y),
    ]);
    if (result === false)
        return;

    renderBoard(defender, computerGrid, false);

    if (defender.hasLost()) {
        endGame(`${turnPlayer.name} wins!`);
        return;
    }

    phase = "switching";
    setTimeout(() => {
        showSwitch(defender, () => {
            turnPlayer = defender;
            const newDefender = turnPlayer === human ? player2 : human;
            phase = "playing";
            renderBoard(turnPlayer, humanGrid, true);
            renderBoard(newDefender, computerGrid, false);
            updateStatus();
        });
    }, 2000);
}

let switchCallback = null;

function showSwitch(nextPlayer, onReady) {
    phase = "switching";
    switchText.textContent = `Pass the device to ${nextPlayer.name}`;
    switchScreen.style.display = "flex";
    switchCallback = onReady;
}

switchReadyButton.addEventListener("click", () => {
    switchScreen.style.display = "none";
    const callback = switchCallback;
    switchCallback = null;
    if (callback)
        callback();
});

function endGame(message) {
    gameOver = true;
    statusText.textContent = message;
    playAgainButton.style.display ="block";
}

startButton.addEventListener("click", () => {
    if (phase !== "confirming")
        return;
    confirmControls.style.display = "none";

    if (mode === "1p") {
        placeShipsRandomly(computer);
        phase = "playing";
        updateStatus();
    } else if (activePlacer === human) {
        showSwitch(player2, () => {
            activePlacer = player2;
            currentShipIndex = 0;
            direction = "horizontal";
            phase = "placing";
            renderBoard(player2, humanGrid, true);
            renderBoard(human, computerGrid, false);
            renderDock();
            updateStatus();
        });
    } else {
        showSwitch(human, () => {
            turnPlayer = human;
            phase = "playing";
            renderBoard(human, humanGrid, true);
            renderBoard(player2, computerGrid, false);
            updateStatus();
        });
    }
});

resetButton.addEventListener("click", () => {
    if (phase !== "confirming")
        return;
    activePlacer.gameboard.reset();
    currentShipIndex = 0;
    phase = "placing";
    confirmControls.style.display = "none";
    renderBoard(activePlacer, humanGrid, true);
    renderDock();
    updateStatus();
});

playAgainButton.addEventListener("click", () => {
    targetQueue = [];
    human.reset();
    computer.reset();
    player2.reset();
    currentShipIndex = 0;
    direction = "horizontal";
    gameOver = false;
    activePlacer = human;
    turnPlayer = human;
    mode = null;
    phase = "menu";
    playAgainButton.style.display = "none";
    renderBoard(human, humanGrid, true);
    renderBoard(computer, computerGrid, false);
    renderDock();
    modeScreen.style.display = "flex";
    updateStatus();
});

mode1pButton.addEventListener("click", () => {
    mode = "1p";
    modeScreen.style.display = "none";
    phase = "placing";
    updateStatus();
});

mode2pButton.addEventListener("click", () => {
    mode = "2p";
    modeScreen.style.display = "none";
    phase = "placing";
    updateStatus();
});

renderBoard(human, humanGrid, true);
renderBoard(computer, computerGrid, false);
renderDock();

updateStatus();