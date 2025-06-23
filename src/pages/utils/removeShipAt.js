export const removeShipAt = (
  row,
  col,
  myBoard,
  setMyBoard,
  setShipsToPlace,
  setIsPlacing,
  setCurrentShipSize,
  isTemporaryRemoval = false
) => {
  const cell = myBoard[row][col];
  if (!cell.ship)
    return {
      boardAfterRemoval: myBoard,
      shipRemoved: false,
      removedShipSize: 0,
    };

  const directions = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
  ];

  let shipCells = [{ row, col }];
  const visited = new Set();
  visited.add(`${row}-${col}`);

  const queue = [{ r: row, c: col }];
  while (queue.length > 0) {
    const { r, c } = queue.shift();

    for (const [dr, dc] of directions) {
      let nr = r + dr;
      let nc = c + dc;
      if (
        nr >= 0 &&
        nr < 10 &&
        nc >= 0 &&
        nc < 10 &&
        myBoard[nr][nc].ship &&
        !visited.has(`${nr}-${nc}`)
      ) {
        visited.add(`${nr}-${nc}`);
        shipCells.push({ row: nr, col: nc });
        queue.push({ r: nr, c: nc });
      }
    }
  }

  const updated = myBoard.map((r) => r.map((c) => ({ ...c })));

  shipCells.forEach(({ row, col }) => {
    updated[row][col].ship = false;
  });

  setMyBoard(updated);

  const shipSize = shipCells.length;
  if (!isTemporaryRemoval) {
    setShipsToPlace((prev) => ({
      ...prev,
      [shipSize]: prev[shipSize] + 1,
    }));

    setIsPlacing(true);
    setCurrentShipSize(shipSize);
  }
  return {
    boardAfterRemoval: updated,
    shipRemoved: true,
    removedShipSize: shipSize,
    removedShipCells: shipCells,
  };
};
