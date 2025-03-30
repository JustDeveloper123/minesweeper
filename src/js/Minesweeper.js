import { classNames } from '@constants/classNames';
import { difficulties } from '@constants/difficulties.js';
import { IMAGE_MINE, IMAGE_RED_FLAG, IMAGE_TIMER } from '@constants/images.js';
import { Modal } from '@js/Modal.js';

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
  isGameOngoing = false;
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
    this.states.beforeUnloadCallback = this.beforeUnloadCallback.bind(this);

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
      this.gameOver({ targetCell: [col, row] });
    } else if (cell.adjacentMines === 0) {
      this.revealAdjacentCells(col, row);
      this.styleCell.call(this, cell);
      this.checkVictory();
    } else {
      cellElement.textContent = cell.adjacentMines || '';
      this.styleCell.call(this, cell);
      this.checkVictory();
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
      this.beforeUnload(true);
      this.isNewGame = false;
      this.isGameOngoing = true;
    } else {
      this.beforeUnload(false);
    }

    this.revealCell(col, row);
  }

  beforeUnloadCallback(event) {
    event.preventDefault();
    event.returnValue = '';
  }

  beforeUnload(active) {
    const { beforeUnloadCallback } = this.states;

    if (active) {
      window.addEventListener('beforeunload', beforeUnloadCallback);
    } else {
      window.removeEventListener('beforeunload', beforeUnloadCallback);
    }
  }

  updateStats() {
    this.selectors.mines.textContent = this.minesAmount;
  }

  setDifficulty(difficulty) {
    this.states.lastClickedDifficulty = difficulty;

    if (this.isGameOngoing) {
      this.modal.show();
    } else {
      window.localStorage.setItem('difficulty', difficulty.label);

      this.grid = difficulty.grid;
      this.minesAmount = difficulty.minesAmount;
      this.difficulty = difficulty;
      this.beforeUnload(false);
    }
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
      this.stats.timer = `${minutes}:${seconds}`;
    }, 1000);
  }

  clearTimer({ clearLabel = true } = {}) {
    if (this.states.timerInstance) {
      clearInterval(this.states.timerInstance);
    }
    if (clearLabel) {
      this.selectors.timer.textContent = '00:00';
      this.stats.timer = '00:00';
    }
  }

  checkVictory() {
    const allValidCells = this.cells
      .flatMap(row => row)
      .filter(cell => !cell.isMine);
    const areAllValidCellsRevealed = allValidCells.every(
      cell => cell.isRevealed,
    );

    if (areAllValidCellsRevealed) {
      this.victory();
    }
  }

  victory() {
    this.gameOver({ victory: true });
    this.loadVictoryModal();
    this.modal.show();
  }

  newGame() {
    this.isNewGame = true;
    this.isGameOver = false;
    this.isGameOngoing = false;

    if (this.selectors.cells) {
      this.selectors.cells.remove();
    }
    if (this.selectors.endGameInfo) {
      this.selectors.endGameInfo.remove();
    }
    this.cells = [];

    const localDifficulty = this.getDifficultyByLabel(
      window.localStorage.getItem('difficulty'),
    );
    if (
      difficulties.includes(localDifficulty) &&
      !this.states.lastClickedDifficulty
    ) {
      this.setDifficulty(localDifficulty);
    }

    if (this.states.timerInstance) {
      this.clearTimer({ clearLabel: true });
    }

    this.createCells();
    this.loadCells();
    this.updateStats();
    this.loadRestartModal();
  }

  gameOver({ victory = false, targetCell } = {}) {
    this.isGameOver = true;
    this.isGameOngoing = false;

    this.clearTimer({ clearLabel: false });

    // Style target bomb
    if (targetCell) {
      this.getCellElement(...targetCell).classList.add(
        classNames.cellButtonTargetBomb,
      );
    }

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

    this.loadEndGameInfo({ victory });
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
        if (!this.isGameOngoing) {
          this.newGame();
        }
      });
    });
  }

  loadCells() {
    const [cols] = this.grid;

    const cellsElement = document.createElement('ul', {});
    cellsElement.className = `${classNames.cells} box`;
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

  loadEndGameInfo({ victory }) {
    const html = `<div class="box grid place-items-center">
        <p class="font-bold ${victory ? 'text-victory' : 'text-failure'}">${victory ? 'Victory!' : 'You lost!'}</p>
        <ul class="flex items-center text-lg gap-6 mt-2">
          <li><p class="flex items-center gap-1"><img class="w-6 h-6" src=${IMAGE_TIMER} alt="">${this.stats.timer || '00:00'}</p></li>
        </ul>
        <button class="button mt-2" id="tryAgain"><span class="relative">${victory ? 'New game' : 'Try again'}</span></button>
      </div>`;

    const endGameInfoElement = document.createElement('div');
    endGameInfoElement.innerHTML = html;

    if (this.selectors.endGameInfo) {
      this.selectors.endGameInfo.remove();
    }

    this.selectors.endGameInfo = endGameInfoElement;
    this.selectors.root.appendChild(endGameInfoElement);

    const tryAgainButton = endGameInfoElement.querySelector('#tryAgain');
    tryAgainButton.addEventListener('click', this.newGame.bind(this));
  }

  loadRestartModal() {
    const restartModalElement = document.createElement('div');

    restartModalElement.innerHTML = `<div class="text-center box-lg">
        <p class="text-lg">You will lose your progress. Restart?</p>
        <button class="button mt-4"><span class="relative">Restart</span></button>
      </div>`;

    // Restart button event
    const restartButton = restartModalElement.querySelector('button');
    restartButton.addEventListener('click', () => {
      this.isGameOngoing = false;
      this.setDifficulty(this.states.lastClickedDifficulty);
      this.newGame();
      this.modal.hide();
    });

    this.modal.setContent(restartModalElement);
  }

  loadVictoryModal() {
    const victoryModalElement = document.createElement('div');

    victoryModalElement.innerHTML = `<div class="text-center box-lg">
        <p class="text-lg">Victory! Good boy</p>
        <button class="button mt-4"><span class="relative">OK</span></button>
      </div>`;

    // OK button
    const okButton = victoryModalElement.querySelector('button');
    okButton.addEventListener('click', () => {
      this.modal.hide();
    });

    this.modal.setContent(victoryModalElement);
  }
}
