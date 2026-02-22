import { Timer } from './timer.js';
import Game from './game.js';

let game;

let boardSize = document.getElementById('boardSize');
let boardContainer = document.getElementById('boardContainer');
let difficulty = document.getElementById('difficulty');
let mineCount = document.getElementById('mineCount');
let btnMain = document.getElementById('btnMain');

let timerScreen = document.querySelector('.timerScreen');
Timer.init(timerScreen);

const CONFIG_KEY = 'minesweeper_config';

btnMain.addEventListener('click', () => {
    setStartReset();
  });

const cellSizeMap ={
    8  : 38,
    12 : 32,
    16 : 28,
    20 : 24,
    25 : 22,
    32 : 16
}
const minesTable = {
  easy: {
    8: 10,
    12: 20,
    16: 40,
    20: 60,
    25: 90,
    32: 140
  },
  normal: {
    8: 15,
    12: 30,
    16: 50,
    20: 80,
    25: 120,
    32: 180
  },
  hard: {
    8: 20,
    12: 40,
    16: 70,
    20: 110,
    25: 160,
    32: 250
  }
}

let allSet = document.querySelector('#allSet');
let playing = document.querySelector('#playing');
let gameOver = document.querySelector('#gameOver');
let youWon = document.querySelector('#youWon');
const gameStatus = {
    allSet:allSet,
    playing:playing,
    gameOver:gameOver,
    youWon:youWon
}

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
  
  renderBoard(boardSize.value);
  mineCountAsign(boardSize.value, difficulty.value);
  setStatus('allSet');  
}

function renderBoard(boardSizeValue) {
    let sizeNum = Number(boardSizeValue);
    boardContainer.innerHTML = '';
    let actualCellSize = cellSizeMap[boardSizeValue];
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

function mineCountAsign(size, difficulty){
    const minesCount = minesTable[difficulty][size];
    mineCount.textContent = `${minesCount}`;
}

function getMinesTotal(size, difficulty){
    const minesCount = minesTable[difficulty][size];
    return minesCount;
}

function saveConfig() {
  const config = {
    boardSize: boardSize.value,
    difficulty: difficulty.value,
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

function setStatus(state){
  Object.values(gameStatus).forEach(element => {
    element.classList.remove('active');
  });
  let actualState = gameStatus[state];
  if (actualState){
    actualState.classList.add('active');
  } 
}

function setStartReset(){
  if (btnMain.textContent ==='START'){
    btnMain.textContent = 'RESET';
    boardSize.disabled = true;
    difficulty.disabled = true;
    let size = Number(boardSize.value);
    let diff = difficulty.value;
    let minesTotal = getMinesTotal(size, diff);
    game = new Game(size, minesTotal);

    console.log(game.model.length); 
    game.minePositionRandom();
    console.log(game.model.filter(cell => cell.mine === true).length);

    setStatus('playing');
    Timer.reset();
    Timer.start();
  } else  if (btnMain.textContent === 'RESET'){
    btnMain.textContent ='START';
    boardSize.disabled = false;
    difficulty.disabled = false;
    resetGame();
  }
}

function resetGame() {
  renderBoard(boardSize.value);
  mineCountAsign(boardSize.value, difficulty.value);
  Timer.reset();
  setStatus('allSet');
}








