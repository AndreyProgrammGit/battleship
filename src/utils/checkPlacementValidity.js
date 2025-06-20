export const checkPlacementValidity = (
  startRow,
  startCol,
  shipSize,
  orientation,
  currentBoard
) => {
  const boardRows = currentBoard.length;
  const boardCols = currentBoard[0].length;

  for (let i = 0; i < shipSize; i++) {
    const r = orientation === "horizontal" ? startRow : startRow + i;
    const c = orientation === "horizontal" ? startCol + i : startCol;

    if (r >= boardRows || c >= boardCols || r < 0 || c < 0) {
      return false;
    }
  }

  for (let i = 0; i < shipSize; i++) {
    const shipPartR = orientation === "horizontal" ? startRow : startRow + i;
    const shipPartC = orientation === "horizontal" ? startCol + i : startCol;

    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const checkR = shipPartR + dr;
        const checkC = shipPartC + dc;

        if (
          checkR >= 0 &&
          checkR < boardRows &&
          checkC >= 0 &&
          checkC < boardCols
        ) {
          if (currentBoard[checkR][checkC].ship) {
            return false;
          }
        }
      }
    }
  }
  return true;
};
