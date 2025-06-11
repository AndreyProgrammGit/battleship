import React from 'react';
import './GameBoard.css';

export default function GameBoard({ board, onCellClick, isOpponent, onRightClick, getRowAndCol }) {


  return (
    <div className="board">
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          const key = `${rowIndex}-${colIndex}`;
          const className = `cell 
            ${cell.hit ? 'hit' : ''} 
            ${cell.miss ? 'miss' : ''} 
            ${cell.ship && !isOpponent ? 'ship' : ''} 
            ${cell.nearHit ? 'near-hit' : ''}
          `;
          return (
            <div
              key={key}
              className={className}
              onClick={() => {
                if (!isOpponent) { getRowAndCol(rowIndex, colIndex); onCellClick(rowIndex, colIndex); };
                if (isOpponent) onCellClick(rowIndex, colIndex);

              }}
              onContextMenu={(e) => {
                e.preventDefault(); // отключаем меню
                getRowAndCol(rowIndex, colIndex);
                onRightClick(rowIndex, colIndex);
              }}
            />
          );
        })
      )}
    </div>
  );
}
