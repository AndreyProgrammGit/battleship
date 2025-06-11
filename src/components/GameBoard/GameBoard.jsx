import React from 'react';
import './GameBoard.css';
import { useDrag } from 'react-dnd'

export default function GameBoard({ board, onCellClick, isOpponent, onRightClick, getRowAndCol }) {

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'ship',
    collect: monitor => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  return (
    <div className="board">
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          const key = `${rowIndex}-${colIndex}`;
          const className = `cell ${cell.hit ? 'hit' : ''} ${cell.miss ? 'miss' : ''} ${cell.ship && !isOpponent ? 'ship' : ''
            }`;
          return (
            <div ref={drag}
              style={{
                opacity: isDragging ? 0.5 : 1,
                fontSize: 25,
                fontWeight: 'bold',
                cursor: 'move',
              }}>
              <div
                key={key}
                className={className}
                onClick={() => {
                  if (!isOpponent) { getRowAndCol(rowIndex, colIndex); onCellClick(); };
                  if (isOpponent) onCellClick(rowIndex, colIndex);

                }}
                onContextMenu={(e) => {
                  e.preventDefault(); // отключаем меню
                  getRowAndCol(rowIndex, colIndex);
                  onRightClick();
                }}
              />
            </div>

          );
        })
      )}
    </div>
  );
}
