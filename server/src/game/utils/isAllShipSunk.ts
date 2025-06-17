export function isAllShipsSunk(board: any[][]): boolean {
  for (const row of board) {
    for (const cell of row) {
      if (cell.ship && !cell.hit) {
        return false;
      }
    }
  }
  return true;
}