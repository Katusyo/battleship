import Ship from "./battleship.js";
import Gameboard from "./board.js";

const ship = new Ship();
const board = new Gameboard();
const boardContainer = document.getElementById("board");
const statusText = document.getElementById("status");