export const removeShipAt = (row, col , myBoard, setMyBoard, setShipsToPlace, setIsPlacing, setCurrentShipSize) => {

    const cell = myBoard[row][col];
    if (!cell.ship) return;

    // Обход всех направлений, чтобы найти весь корабль
    const directions = [
        [0, 1],  // горизонтально →
        [1, 0],  // вертикально ↓
        [0, -1], // ←
        [-1, 0], // ↑
    ];

    let shipCells = [{ row, col }];

    for (const [dr, dc] of directions) {
        let r = row + dr;
        let c = col + dc;

        while (r >= 0 && r < 10 && c >= 0 && c < 10 && myBoard[r][c].ship) {
            shipCells.push({ row: r, col: c });
            r += dr;
            c += dc;
        }
    }

    // Удаляем корабль
    const updated = myBoard.map((r) => r.map((c) => ({ ...c })));

    shipCells.forEach(({ row, col }) => {
        updated[row][col].ship = false;
    });

    setMyBoard(updated);

    // Обновляем счётчик кораблей
    const shipSize = shipCells.length;
    setShipsToPlace((prev) => ({
        ...prev,
        [shipSize]: prev[shipSize] + 1,
    }));

    // Если закончили расставлять — включаем режим расстановки снова
    setIsPlacing(true);
    setCurrentShipSize(shipSize);
};
