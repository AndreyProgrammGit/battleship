import React from 'react';
import './GameBoard.css';
import { useDrop } from 'react-dnd';

export default function GameBoard({ board, onCellClick, isOpponent, onRightClick, setShowPrompt }) {


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
                onCellClick(rowIndex, colIndex);
                setShowPrompt(false)
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                onRightClick(rowIndex, colIndex);
              }}
              onDragOver={(e) => {
                e.preventDefault();
              }}
              onDrop={(e) => {
                const size = parseInt(e.dataTransfer.getData('shipSize'));
                if (!isOpponent && !isNaN(size)) {
                  onCellClick(rowIndex, colIndex, size);
                }
              }}
            />
          );
        })
      )}
    </div>
  );
}
