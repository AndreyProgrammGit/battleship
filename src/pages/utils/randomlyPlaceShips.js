import { placeShip as manualPlaceShip } from "./placeShip"; // Импортируем вашу существующую функцию placeShip

// Вспомогательная функция для создания пустой доски (дублируется для ясности, но можно импортировать из GamePage)
const createEmptyBoard = () =>
  Array(10)
    .fill(null)
    .map(() =>
      Array(10)
        .fill(null)
        .map(() => ({
          ship: false,
          hit: false,
          miss: false,
        }))
    );

// Эта функция должна быть такой же, как checkPlacementValidity из GameBoard.jsx
// В идеале, эту функцию лучше вынести в отдельную утилиту, чтобы не дублировать код.
// Пока что скопируем её сюда для простоты, но имейте в виду этот момент.
const checkPlacementValidity = (
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

export const randomlyPlaceShips = (initialShipsToPlace) => {
  let board = createEmptyBoard(); // Начинаем с чистой доски
  let currentShipsToPlace = { ...initialShipsToPlace }; // Копируем состояние кораблей

  // Преобразуем объект кораблей в массив для удобной итерации
  const shipSizes = Object.keys(currentShipsToPlace)
    .map(Number)
    .sort((a, b) => b - a); // Сортируем по убыванию размера

  for (const size of shipSizes) {
    let count = currentShipsToPlace[size];
    while (count > 0) {
      let placed = false;
      let attempts = 0;
      const maxAttempts = 1000; // Ограничение на количество попыток, чтобы избежать бесконечного цикла

      while (!placed && attempts < maxAttempts) {
        const row = Math.floor(Math.random() * 10);
        const col = Math.floor(Math.random() * 10);
        const orientation = Math.random() < 0.5 ? "horizontal" : "vertical";

        if (checkPlacementValidity(row, col, size, orientation, board)) {
          // Используем логику placeShip (или её часть), но без side-эффектов на state в GamePage
          // Мы хотим обновить board локально
          let newBoard = JSON.parse(JSON.stringify(board)); // Глубокое копирование
          for (let i = 0; i < size; i++) {
            const r = orientation === "horizontal" ? row : row + i;
            const c = orientation === "horizontal" ? col + i : col;
            if (r < 10 && c < 10) {
              // Проверка на выход за границы, хотя checkPlacementValidity уже должен это обрабатывать
              newBoard[r][c] = { ...newBoard[r][c], ship: true };
            }
          }
          board = newBoard;
          placed = true;
          count--; // Уменьшаем количество оставшихся кораблей этого размера
        }
        attempts++;
      }
      if (!placed) {
        console.warn(
          `Не удалось разместить корабль размером ${size} после ${maxAttempts} попыток.`
        );
        // Можно добавить более сложную логику, например, перезапустить процесс или сгенерировать ошибку
        break; // Выходим из цикла, если не удалось разместить корабль
      }
    }
  }

  // После размещения всех кораблей, обновляем shipsToPlace, чтобы показать, что все размещены
  const updatedShipsToPlace = Object.keys(initialShipsToPlace).reduce(
    (acc, shipSize) => {
      acc[shipSize] = 0;
      return acc;
    },
    {}
  );

  return { newBoard: board, updatedShipsToPlace: updatedShipsToPlace };
};
