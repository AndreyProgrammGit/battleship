export const placeShip = (row, col, myBoard, currentShipSize, orientation, isPlacing, shipsToPlace, setMyBoard, setShipsToPlace, setCurrentShipSize, setIsPlacing) => {

    if (row === null || col === null) return;

    const canPlaceShip = (board, row, col, size, orientation) => {
        const deltas = orientation === 'horizontal' ? [0, 1] : [1, 0];

        for (let i = 0; i < size; i++) {
            const r = row + i * deltas[0];
            const c = col + i * deltas[1];

            if (r < 0 || r >= 10 || c < 0 || c >= 10) return false;
            if (board[r][c].ship) return false;

            // Проверим соседние клетки (контур)
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    const nr = r + dr;
                    const nc = c + dc;
                    if (
                        nr >= 0 &&
                        nr < 10 &&
                        nc >= 0 &&
                        nc < 10 &&
                        board[nr][nc].ship
                    ) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    if (!isPlacing || shipsToPlace[currentShipSize] <= 0) return;

    if (!canPlaceShip(myBoard, row, col, currentShipSize, orientation)) return;

    const deltas = orientation === 'horizontal' ? [0, 1] : [1, 0];
    const updated = myBoard.map((r) => r.map((c) => ({ ...c })));

    for (let i = 0; i < currentShipSize; i++) {
        const r = row + i * deltas[0];
        const c = col + i * deltas[1];
        updated[r][c].ship = true;
    }

    setMyBoard(updated);

    setShipsToPlace((prevShips) => {
        const newShips = { ...prevShips, [currentShipSize]: prevShips[currentShipSize] - 1 };

        // Найдём следующий размер, который ещё остался
        const nextSize = [4, 3, 2, 1].find((size) => newShips[size] > 0);

        if (nextSize) {
            setCurrentShipSize(nextSize);
        } else {
            setIsPlacing(false);
        }

        return newShips;
    });
};