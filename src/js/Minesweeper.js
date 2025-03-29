import { classNames } from '@constants/classNames';
import { difficulties } from '@constants/difficulties.js';
import { IMAGE_MINE, IMAGE_RED_FLAG, IMAGE_TIMER } from '@constants/images.js';
import { Modal } from '@js/Modal.js';
import { splitClass } from '@/helpers/splitClass.js';

const defaultOptions = {
  grid: difficulties[1].grid,
  minesAmount: difficulties[1].minesAmount,
};

export class Minesweeper {
  selectors = {};
  grid = defaultOptions.grid;
  minesAmount = defaultOptions.minesAmount;
  cells = [];
  isNewGame = true;
  isGameOver = false;
  difficulty = {};
  stats = {};
  states = {};
  modal = {};

  constructor(root) {
    this.selectors.root = root;

    this.init();
  }

  init() {
    this.modal = new Modal();

    this.loadInterface();
    this.newGame();
  }

  createCells() {
    const [cols, rows] = this.grid;

    for (let row = 0; row < rows; row++) {
      this.cells[row] = [];

      for (let col = 0; col < cols; col++) {
        this.cells[row][col] = {
          position: [col, row],
          isMine: false,
          isRevealed: false,
          adjacentMines: 0,
        };
      }
    }
  }

  styleCell(cell) {
    const cellElement = this.getCellElement(...cell.position);
    cellElement.classList.add(classNames.cellButtonRevealed);
    cellElement.classList.add(
      classNames.setCellButtonCount(cell.adjacentMines),
    );
  }

  updateAdjacentCounts(mineCol, mineRow) {
    for (let row = mineRow - 1; row <= mineRow + 1; row++) {
      for (let col = mineCol - 1; col <= mineCol + 1; col++) {
        const isNotCurrentMine = !(row === mineRow && col === mineCol);

        if (this.isValidCell(col, row) && isNotCurrentMine) {
          this.cells[row][col].adjacentMines += 1;
        }
      }
    }
  }

  isValidCell(col, row) {
    const [cols, rows] = this.grid;
    return col >= 0 && col < cols && row >= 0 && row < rows;
  }

  placeMines(excludeCol, excludeRow) {
    const [cols, rows] = this.grid;
    let minesPlaced = 0;

    while (minesPlaced < this.minesAmount) {
      const row = Math.floor(Math.random() * rows);
      const col = Math.floor(Math.random() * cols);

      const isSafeZone =
        Math.abs(col - excludeCol) <= 1 && Math.abs(row - excludeRow) <= 1;
      const isNotMine = !this.cells[row][col].isMine;

      if (!isSafeZone && isNotMine) {
        this.cells[row][col].isMine = true;
        this.updateAdjacentCounts(col, row);
        minesPlaced++;
      }
    }
  }

  revealCell(col, row) {
    const cell = this.cells[row][col];
    if (cell.isRevealed) return;

    cell.isRevealed = true;
    const cellElement = this.getCellElement(col, row);

    if (cell.isMine) {
      this.gameOver([col, row]);
    } else if (cell.adjacentMines === 0) {
      this.revealAdjacentCells(col, row);
      this.styleCell.call(this, cell);
    } else {
      cellElement.textContent = cell.adjacentMines || '';
      this.styleCell.call(this, cell);
    }
  }

  revealAdjacentCells(thisCol, thisRow) {
    for (let row = thisRow - 1; row <= thisRow + 1; row++) {
      for (let col = thisCol - 1; col <= thisCol + 1; col++) {
        const isNotCurrentCell = !(col === thisCol && row === thisRow);
        if (this.isValidCell(col, row) && isNotCurrentCell) {
          const cell = this.cells[row][col];

          if (!cell.isRevealed) {
            this.revealCell(col, row);
          }
        }
      }
    }
  }

  getCellElement(col, row) {
    return this.selectors.cells.querySelector(
      `.minesweeper__cellButton[data-col="${col}"][data-row="${row}"]`,
    );
  }

  handleCellClick(e) {
    if (this.isGameOver) return;

    const cellElement = e.target;
    const col = parseInt(cellElement.dataset.col);
    const row = parseInt(cellElement.dataset.row);

    if (this.isNewGame) {
      this.placeMines.call(this, col, row);
      this.setTimer();
      this.isNewGame = false;
    }

    this.revealCell(col, row);
  }

  updateStats() {
    this.selectors.mines.textContent = this.minesAmount;
  }

  setDifficulty(difficulty) {
    window.localStorage.setItem('difficulty', difficulty.label);

    this.grid = difficulty.grid;
    this.minesAmount = difficulty.minesAmount;
    this.difficulty = difficulty;
  }

  getDifficultyByLabel(label) {
    return difficulties.find(d => d.label === label);
  }

  setTimer() {
    const timerStartedAt = new Date().getTime();

    this.states.timerInstance = setInterval(() => {
      const nowTime = new Date().getTime() - timerStartedAt;
      const nowDate = new Date(nowTime);

      const minutes =
        `${Math.floor((nowDate % (1000 * 60 * 60)) / (1000 * 60))}`.padStart(
          2,
          '0',
        );
      const seconds = `${Math.floor((nowDate % (1000 * 60)) / 1000)}`.padStart(
        2,
        '0',
      );

      this.selectors.timer.textContent = `${minutes}:${seconds}`;
    }, 1000);
  }

  clearTimer({ clearLabel = true } = {}) {
    if (this.states.timerInstance) {
      clearInterval(this.states.timerInstance);
    }
    if (clearLabel) {
      this.selectors.timer.textContent = '00:00';
    }
  }

  newGame() {
    this.isGameOver = false;

    if (this.selectors.cells) {
      this.selectors.cells.remove();
    }
    this.cells = [];

    const localDifficulty = this.getDifficultyByLabel(
      window.localStorage.getItem('difficulty'),
    );
    if (difficulties.includes(localDifficulty)) {
      this.setDifficulty(localDifficulty);
    }

    if (this.states.timerInstance) {
      this.clearTimer();
    }

    this.createCells();
    this.loadCells();
    this.updateStats();
  }

  gameOver(targetCell) {
    this.isGameOver = true;

    this.clearTimer({ clearLabel: false });

    // Style target bomb
    this.getCellElement(...targetCell).classList.add(
      classNames.cellButtonTargetBomb,
    );

    // Get all mines
    const allMines = this.cells.flatMap(row => row).filter(cell => cell.isMine);

    const allMineElements = allMines.map(mine => {
      return this.getCellElement.call(this, ...mine.position);
    });

    // Style all mines
    allMineElements.forEach(mine => {
      mine.classList.add(classNames.cellButtonBomb);
      mine.innerHTML = `<img class="p-1" src="${IMAGE_MINE}" alt="">`;
    });
  }

  loadInterface() {
    this.loadTopBar();
    this.loadDifficulties();
    this.loadGameStats();
  }

  loadTopBar() {
    const topBarElement = document.createElement('div');
    topBarElement.className =
      'box flex items-center justify-between gap-4 flex-wrap';
    this.selectors.topBar = topBarElement;
    this.selectors.root.appendChild(topBarElement);
  }

  loadDifficulties() {
    const html = `<div class="flex items-center">
        <h2 class="mr-4">Difficulty:</h2>
        <ul class="flex items-center gap-2 flex-wrap">${difficulties
          .map(
            difficulty => `<li>
            <button class="button" data-difficulty="${difficulty.label}">
              <span class="relative">
                ${difficulty.label}
              </span>
            </button>
          </li>`,
          )
          .join('')}</ul>
      </div>`;

    const difficultiesElement = document.createElement('div');
    difficultiesElement.innerHTML = html;
    this.selectors.difficulties = difficultiesElement;
    this.selectors.topBar.appendChild(difficultiesElement);

    // Find all difficulties
    const difficultyElements =
      difficultiesElement.querySelectorAll('[data-difficulty]');

    // Set onClick listeners
    difficultyElements.forEach((difficultyEl, index) => {
      difficultyEl.addEventListener('click', () => {
        this.setDifficulty(difficulties[index]);
        this.newGame();
      });
    });
  }

  loadCells() {
    this.isNewGame = true;
    const [cols] = this.grid;
    const cellsElement = document.createElement('ul', {});
    cellsElement.classList.add(classNames.cells, 'box');
    this.selectors.root.appendChild(cellsElement);
    this.selectors.cells = cellsElement;

    this.cells.forEach((cellRow, cellRowIndex) => {
      cellRow.forEach((cellCol, cellColIndex) => {
        const cellButton = document.createElement('button');
        cellButton.classList.add(
          classNames.cellButton,
          classNames.setCellButtonDifficulty(this.difficulty.label),
        );
        cellButton.dataset.row = cellRowIndex;
        cellButton.dataset.col = cellColIndex;
        cellButton.addEventListener('click', this.handleCellClick.bind(this));

        const cellItem = document.createElement('li');
        cellItem.classList.add(classNames.cellItem);
        cellItem.style.width = `${100 / cols}%`;
        cellItem.appendChild(cellButton);

        cellsElement.appendChild(cellItem);
      });
    });
  }

  loadGameStats() {
    const html = `<ul class="flex items-center gap-6">
        <li><p class="flex items-center gap-1"><img class="w-6 h-6" src=${IMAGE_RED_FLAG} alt=""><span id="mines">0</span> mines</p></li>
        <li><p class="flex items-center gap-1"><img class="w-6 h-6" src=${IMAGE_TIMER} alt=""><span id="timer">00:00</span></p></li>
      </ul>`;

    const gameStatsElement = document.createElement('div');
    gameStatsElement.innerHTML = html;
    this.selectors.gameStats = gameStatsElement;
    this.selectors.topBar.appendChild(gameStatsElement);

    const minesElement = gameStatsElement.querySelector('#mines');
    this.selectors.mines = minesElement;

    const timerElement = gameStatsElement.querySelector('#timer');
    this.selectors.timer = timerElement;
  }
}
