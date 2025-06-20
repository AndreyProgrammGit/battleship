import "./GameBoard.css";
import { checkPlacementValidity } from "../../utils/checkPlacementValidity";

export default function GameBoard({
  board,
  onCellClick,
  isOpponent,
  onRightClick,
  setShowPrompt,
  hoveredCells = [],
  isValidPlacement = null,
  setHoveredCells = () => {},
  setIsValidPlacement = () => {},
  onHover,
  draggingShipData,
}) {
  const handleDragLeave = () => {
    setHoveredCells([]);
    setIsValidPlacement(null);
  };

  const handleDragOverInternal = (e, draggingShipData, rowIndex, colIndex) => {
    e.preventDefault();
    const { size, orientation } = draggingShipData;

    const shipSize = parseInt(size);
    const shipOrientation = orientation;

    if (!isNaN(shipSize) && shipOrientation && !isOpponent) {
      const currentHoveredCells = [];
      let calculatedIsValidPlacement = true;

      if (shipOrientation === "horizontal") {
        for (let i = 0; i < shipSize; i++) {
          currentHoveredCells.push([rowIndex, colIndex + i]);
        }
      } else {
        for (let i = 0; i < shipSize; i++) {
          currentHoveredCells.push([rowIndex + i, colIndex]);
        }
      }

      calculatedIsValidPlacement = checkPlacementValidity(
        rowIndex,
        colIndex,
        shipSize,
        shipOrientation,
        board
      );

      setHoveredCells(currentHoveredCells);
      setIsValidPlacement(calculatedIsValidPlacement);

      if (onHover) {
        onHover(
          rowIndex,
          colIndex,
          shipSize,
          shipOrientation,
          calculatedIsValidPlacement,
          currentHoveredCells
        );
      }
    } else {
      setHoveredCells([]);
      setIsValidPlacement(null);
    }
  };

  return (
    <div className="board">
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          const key = `${rowIndex}-${colIndex}`;

          const isHovered = hoveredCells?.some(
            ([r, c]) => r === rowIndex && c === colIndex
          );

          const className = `cell
            ${cell.hit ? "hit" : ""}
            ${cell.miss ? "miss" : ""}
            ${cell.ship && !isOpponent ? "ship" : ""}
            ${cell.nearHit ? "near-hit" : ""}
            ${
              isHovered
                ? isValidPlacement
                  ? "valid-hover"
                  : "invalid-hover"
                : ""
            }
          `;
          return (
            <div
              key={key}
              className={className}
              onClick={() => {
                onCellClick(rowIndex, colIndex);
                if (!isOpponent) setShowPrompt(false);
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                onRightClick(rowIndex, colIndex);
              }}
              onDragOver={(e) =>
                handleDragOverInternal(e, draggingShipData, rowIndex, colIndex)
              }
              onDragLeave={handleDragLeave}
              onDrop={(e) => {
                const size = parseInt(e.dataTransfer.getData("shipSize"));
                const orientation = e.dataTransfer.getData("orientation");
                if (!isOpponent && !isNaN(size) && orientation) {
                  const finalIsValidPlacement = checkPlacementValidity(
                    rowIndex,
                    colIndex,
                    size,
                    orientation,
                    board
                  );

                  if (finalIsValidPlacement) {
                    onCellClick(rowIndex, colIndex, size, orientation);
                    setShowPrompt(false);
                  } else {
                    console.warn(
                      "Невозможно разместить корабль здесь: нарушение правил касания."
                    );
                  }
                  setHoveredCells([]);
                  setIsValidPlacement(null);
                }
              }}
            />
          );
        })
      )}
    </div>
  );
}
