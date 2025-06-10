import React from 'react';
import './GameBoard.css';

export default function GameBoard({ board, onCellClick, isOpponent, onRightClick }) {
  return (
    <div className="board">
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          const key = `${rowIndex}-${colIndex}`;
          const className = `cell ${cell.hit ? 'hit' : ''} ${cell.miss ? 'miss' : ''} ${cell.ship && !isOpponent ? 'ship' : ''
            }`;
          return (
            <div
              key={key}
              className={className}
              onClick={() => onCellClick?.(rowIndex, colIndex)}
              onContextMenu={(e) => {
                e.preventDefault(); // отключаем меню
                onRightClick?.(rowIndex, colIndex);
              }}
            />

          );
        })
      )}
    </div>
  );
}
