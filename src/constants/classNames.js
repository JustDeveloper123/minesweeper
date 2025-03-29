export const classNames = {
  cells: 'minesweeper__cells',
  cellItem: 'minesweeper__cellItem',
  cellButton: 'minesweeper__cellButton',
  cellButtonRevealed: 'minesweeper__cellButton_revealed',
  setCellButtonCount: count => `minesweeper__cellButton_${count}`,
  setCellButtonDifficulty: difficultyLabel =>
    `minesweeper__cellButton_${difficultyLabel}`,
  cellButtonBomb: 'minesweeper__cellButton_bomb',
  cellButtonTargetBomb: 'minesweeper__cellButton_targetBomb',
  modal: 'modal',
  modalTopBar: 'modal__topBar',
  modalContent: 'modal__content',
};
