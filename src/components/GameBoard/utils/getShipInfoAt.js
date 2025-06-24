export function getShipInfoAt(board, row, col) {
  if (!board[row] || !board[row][col] || !board[row][col].ship) {
    return null;
  }

  const visited = new Set();
  const shipCells = [];

  const queue = [[row, col]];
  visited.add(`${row}-${col}`);

  while (queue.length > 0) {
    const [r, c] = queue.shift();
    shipCells.push([r, c]);

    const neighbors = [
      [r - 1, c],
      [r + 1, c],
      [r, c - 1],
      [r, c + 1],
    ];

    for (const [nr, nc] of neighbors) {
      if (
        nr >= 0 &&
        nr < 10 &&
        nc >= 0 &&
        nc < 10 &&
        board[nr][nc].ship &&
        !visited.has(`${nr}-${nc}`)
      ) {
        visited.add(`${nr}-${nc}`);
        queue.push([nr, nc]);
      }
    }
  }

  const size = shipCells.length;
  let orientation = null;

  if (size > 1) {
    const minR = Math.min(...shipCells.map(([r]) => r));
    const maxR = Math.max(...shipCells.map(([r]) => r));
    const minC = Math.min(...shipCells.map(([, c]) => c));
    const maxC = Math.max(...shipCells.map(([, c]) => c));

    if (minR === maxR) {
      orientation = "horizontal";
    } else if (minC === maxC) {
      orientation = "vertical";
    }
  } else {
    orientation = "horizontal";
  }

  return { size, orientation, cells: shipCells };
}
