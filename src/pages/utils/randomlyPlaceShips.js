import { createEmptyBoard } from "./createEmptyBoard";
import { checkPlacementValidity } from "../../utils/checkPlacementValidity";

export const randomlyPlaceShips = (initialShipsToPlace) => {
  let board = createEmptyBoard();
  let currentShipsToPlace = { ...initialShipsToPlace };

  const shipSizes = Object.keys(currentShipsToPlace)
    .map(Number)
    .sort((a, b) => b - a);

  for (const size of shipSizes) {
    let count = currentShipsToPlace[size];
    while (count > 0) {
      let placed = false;
      let attempts = 0;
      const maxAttempts = 1000;

      while (!placed && attempts < maxAttempts) {
        const row = Math.floor(Math.random() * 10);
        const col = Math.floor(Math.random() * 10);
        const orientation = Math.random() < 0.5 ? "horizontal" : "vertical";

        if (checkPlacementValidity(row, col, size, orientation, board)) {
          let newBoard = JSON.parse(JSON.stringify(board));
          for (let i = 0; i < size; i++) {
            const r = orientation === "horizontal" ? row : row + i;
            const c = orientation === "horizontal" ? col + i : col;
            if (r < 10 && c < 10) {
              newBoard[r][c] = { ...newBoard[r][c], ship: true };
            }
          }
          board = newBoard;
          placed = true;
          count--;
        }
        attempts++;
      }
      if (!placed) {
        console.warn(
          `Не удалось разместить корабль размером ${size} после ${maxAttempts} попыток.`
        );
        break;
      }
    }
  }

  const updatedShipsToPlace = Object.keys(initialShipsToPlace).reduce(
    (acc, shipSize) => {
      acc[shipSize] = 0;
      return acc;
    },
    {}
  );

  return { newBoard: board, updatedShipsToPlace: updatedShipsToPlace };
};
