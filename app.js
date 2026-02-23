import { Timer } from './timer.js';
import Game from './game.js';

let game;

const boardSize = document.getElementById('boardSize');
const boardContainer = document.getElementById('boardContainer');
const difficulty = document.getElementById('difficulty');
const mineCount = document.getElementById('mineCount');
const btnMain = document.getElementById('btnMain');
const endOverlay = document.getElementById('endOverlay');
const endMessage = document.getElementById('endMessage');
const help = document.getElementById('help');
const helpContainer = document.querySelector('.help-container');

const timerScreen = document.querySelector('.timerScreen');
Timer.init(timerScreen);

const CONFIG_KEY = 'minesweeper_config';

btnMain.addEventListener('click', () => {
  setStartReset();
});

const cellSizeMap = {
  8: 38,
  12: 32,
  16: 28,
  20: 24,
  25: 22,
  32: 16
};

const minesTable = {
  easy:   { 8: 10, 12: 20, 16: 40, 20: 60, 25: 90, 32: 140 },
  normal: { 8: 15, 12: 30, 16: 50, 20: 80, 25: 120, 32: 180 },
  hard:   { 8: 20, 12: 40, 16: 70, 20: 110, 25: 160, 32: 250 }
};

const allSet = document.querySelector('#allSet');
const playing = document.querySelector('#playing');
const gameOver = document.querySelector('#gameOver');
const youWon = document.querySelector('#youWon');

const gameStatus = { allSet, playing, gameOver, youWon };

init();

function init() {
  const memoryCheck = loadConfig();

  if (memoryCheck != null) {
    const boardSizeCheck = memoryCheck.boardSize;
    const difficultyCheck = memoryCheck.difficulty;

    const isValidSize = boardSizeCheck in cellSizeMap;
    const isValidDiff = difficultyCheck in minesTable;

    if (isValidSize && isValidDiff) {
      boardSize.value = boardSizeCheck;
      difficulty.value = difficultyCheck;
    }
  }

  boardSize.addEventListener('change', (e) => {
    const boardSizeValue = e.target.value;
    renderBoard(boardSizeValue);

    const difficultyValue = difficulty.value;
    mineCountAsign(boardSizeValue, difficultyValue);
    saveConfig();
  });

  difficulty.addEventListener('change', (e) => {
    const difficultyValue = e.target.value;
    const boardSizeValue = boardSize.value;

    mineCountAsign(boardSizeValue, difficultyValue);
    saveConfig();
  });

  boardContainer.addEventListener('click', (e) => {
    if (!game) return;
    if (game.ended) return;

    const cellElement = e.target;
    if (!cellElement.classList.contains('cell')) return;

    const id = Number(cellElement.dataset.id);
    revealCell(id, cellElement);
  });

  boardContainer.addEventListener('contextmenu', (e) => {
    e.preventDefault();

    if (!game) return;
    if (game.ended) return;

    const cellElement = e.target;
    if (!cellElement.classList.contains('cell')) return;

    // no se puede poner/quitar bandera en celdas reveladas
    if (cellElement.classList.contains('revealed')) return;

    const hasFlag = cellElement.classList.contains('flag');

    // quitar bandera
    if (hasFlag) {
      cellElement.classList.remove('flag');
      game.minesLeft++;
      mineCount.textContent = String(game.minesLeft);
      return;
    }

    // poner bandera (opcional: limitar a la cantidad de minas)
    if (game.minesLeft <= 0) return;

    cellElement.classList.add('flag');
    game.minesLeft--;
    mineCount.textContent = String(game.minesLeft);
  });

  help.addEventListener('click', () => {
    handleHelp();
  });

  renderBoard(boardSize.value);
  mineCountAsign(boardSize.value, difficulty.value);
  setStatus('allSet');
}

function renderBoard(boardSizeValue) {
  const sizeNum = Number(boardSizeValue);
  boardContainer.innerHTML = '';

  const actualCellSize = cellSizeMap[boardSizeValue];
  boardContainer.style.display = 'grid';
  boardContainer.style.gridTemplateColumns = `repeat(${sizeNum}, ${actualCellSize}px)`;
  boardContainer.style.gap = '2px';

  for (let row = 0; row < sizeNum; row++) {
    for (let col = 0; col < sizeNum; col++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.dataset.id = row * sizeNum + col;
      cell.style.width = `${actualCellSize}px`;
      cell.style.height = `${actualCellSize}px`;
      boardContainer.appendChild(cell);
    }
  }
}

function mineCountAsign(size, diff) {
  mineCount.textContent = String(minesTable[diff][size]);
}

function getMinesTotal(size, diff) {
  return minesTable[diff][size];
}

function saveConfig() {
  const config = {
    boardSize: boardSize.value,
    difficulty: difficulty.value
  };
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

function loadConfig() {
  const raw = localStorage.getItem(CONFIG_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function setStatus(state) {
  Object.values(gameStatus).forEach((el) => el.classList.remove('active'));
  const actualState = gameStatus[state];
  if (actualState) actualState.classList.add('active');
}

function setStartReset() {
  if (btnMain.textContent === 'START') {
    btnMain.textContent = 'RESET';
    boardSize.disabled = true;
    difficulty.disabled = true;

    const size = Number(boardSize.value);
    const diff = difficulty.value;
    const minesTotal = getMinesTotal(size, diff);

    game = new Game(size, minesTotal);

    setStatus('playing');
    Timer.reset();
    Timer.start();
    return;
  }

  // RESET
  btnMain.textContent = 'START';
  boardSize.disabled = false;
  difficulty.disabled = false;
  resetGame();
}

function resetGame() {
  renderBoard(boardSize.value);
  mineCountAsign(boardSize.value, difficulty.value);
  Timer.reset();
  setStatus('allSet');
  game = null;
  endOverlay.classList.add('hidden');
  endMessage.className = '';
}

function revealCell(id, cellElement) {
  if (!game) return;
  if (game.ended) return;
  if (cellElement.classList.contains('revealed')) return;
  if (cellElement.classList.contains('flag')) return;

  const data = game.model[id];

  if (data.mine) {
    handleGameOver();
    return;
  }

  if (data.number > 0) {
    cellElement.textContent = data.number;
    cellElement.classList.add('revealed');
    checkWin();
    return;
  }

  // number === 0
  floodFill(id);
}

function getCellElById(id) {
  return boardContainer.querySelector(`.cell[data-id="${id}"]`);
}

function getNeighbors(id) {
  const size = game.size;
  const row = Math.floor(id / size);
  const col = id % size;

  const neighbors = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = row + dr;
      const nc = col + dc;
      if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
      neighbors.push(nr * size + nc);
    }
  }
  return neighbors;
}

function floodFill(startId) {
  const stack = [startId];

  while (stack.length) {
    const id = stack.pop();
    const el = getCellElById(id);
    if (!el) continue;

    if (el.classList.contains('revealed')) continue;

    const data = game.model[id];
    if (data.mine) continue;

    el.classList.add('revealed');

    if (data.number > 0) {
      el.textContent = data.number;
      continue;
    }

    el.classList.add('blank');

    const neighbors = getNeighbors(id);
    for (const nid of neighbors) {
      const nel = getCellElById(nid);
      if (!nel) continue;
      if (nel.classList.contains('revealed')) continue;

      const ndata = game.model[nid];
      if (ndata.mine) continue;

      if (ndata.number === 0) {
        stack.push(nid);
      } else {
        nel.classList.add('revealed');
        nel.textContent = ndata.number;
      }
    }
  }
  checkWin();
}

function revealBoard() {
  const total = game.size * game.size;

  for (let id = 0; id < total; id++) {
    const el = getCellElById(id);
    if (!el) continue;

    const data = game.model[id];
    el.classList.add('revealed');

    if (data.mine) {
      el.classList.add('mine');
      el.textContent = '';
      continue;
    }

    if (data.number > 0) {
      el.textContent = data.number;
    } else {
      el.classList.add('blank');
      el.textContent = '';
    }
  }
}

function handleGameOver() {
  game.ended = true;
  setStatus('gameOver');
  Timer.stop();
  revealBoard();

  endMessage.textContent = 'GAME OVER';
  endMessage.className = 'game-over';
  endOverlay.classList.remove('hidden');
}

function handleWin() {
  game.ended = true;
  setStatus('youWon');
  Timer.stop();

  endMessage.textContent = 'YOU WON';
  endMessage.className = 'you-won';
  endOverlay.classList.remove('hidden');
}

function checkWin() {
  if (!game || game.ended) return;

  const totalCells = game.size * game.size;
  const totalSafe = totalCells - game.minesTotal;

  const revealedCells = document.querySelectorAll('.cell.revealed').length;

  if (revealedCells === totalSafe) {
    handleWin();
  }
}
function handleHelp(){
  if (help.textContent === 'Help'){
    help.textContent = 'Close Help';
    helpContainer.classList.remove('notVisible');
  } else if (help.textContent === 'Close Help'){
    help.textContent = 'Help';
    helpContainer.classList.add('notVisible');
  }
}




