let boardSize = document.getElementById('boardSize');
let boardContainer = document.getElementById('boardContainer');
const cellSizeMap ={
    8  : 38,
    12 : 32,
    16 : 28,
    20 : 24,
    25 : 22,
    32 : 18
}

boardSize.addEventListener('change', (e) => {
    let boardSizeValue =e.target.value;
    renderBoard(boardSizeValue);
});

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

            boardContainer.appendChild(cell);
        }
    }

}