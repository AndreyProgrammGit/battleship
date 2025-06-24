import "./GameBoard.css";
import { checkPlacementValidity } from "../../utils/checkPlacementValidity";
import { getShipInfoAt } from "./utils/getShipInfoAt";

export default function GameBoard({
  isReady,
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
  onShipDragStart,
  onShipDrop,
}) {
  const handleDragLeave = () => {
    setHoveredCells([]);
    setIsValidPlacement(null);
  };

  const handleDragOverInternal = (e, draggingShipData, rowIndex, colIndex) => {
    e.preventDefault();
    const { size, orientation, isExistingShip } = draggingShipData;
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

      let tempBoard = board;
      if (isExistingShip && draggingShipData.originalCells) {
        tempBoard = board.map((row) => row.map((cell) => ({ ...cell })));
        draggingShipData.originalCells.forEach(([r, c]) => {
          if (tempBoard[r] && tempBoard[r][c]) {
            tempBoard[r][c].ship = false;
          }
        });
      }

      calculatedIsValidPlacement = checkPlacementValidity(
        rowIndex,
        colIndex,
        shipSize,
        shipOrientation,
        tempBoard
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
                if (!draggingShipData) {
                  onCellClick(rowIndex, colIndex);
                  if (!isOpponent) setShowPrompt(false);
                }
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                if (!isReady) {
                  onRightClick(rowIndex, colIndex);
                }
              }}
              onDragOver={(e) =>
                handleDragOverInternal(e, draggingShipData, rowIndex, colIndex)
              }
              onDragLeave={handleDragLeave}
              draggable={cell.ship && !isOpponent}
              onDragStart={(e) => {
                if (cell.ship && !isOpponent) {
                  const shipInfo = getShipInfoAt(board, rowIndex, colIndex);
                  if (shipInfo) {
                    e.dataTransfer.setData("shipSize", shipInfo.size);
                    e.dataTransfer.setData("orientation", shipInfo.orientation);
                    e.dataTransfer.setData("isExistingShip", "true");
                    e.dataTransfer.setData(
                      "originalCells",
                      JSON.stringify(shipInfo.cells)
                    );
                    onShipDragStart(
                      shipInfo.size,
                      shipInfo.orientation,
                      shipInfo.cells
                    );
                  }
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                const size = parseInt(e.dataTransfer.getData("shipSize"));
                const orientation = e.dataTransfer.getData("orientation");
                const isExistingShip =
                  e.dataTransfer.getData("isExistingShip") === "true";
                const originalCellsData =
                  e.dataTransfer.getData("originalCells");
                const originalCells = originalCellsData
                  ? JSON.parse(originalCellsData)
                  : [];

                if (!isOpponent && !isNaN(size) && orientation) {
                  let tempBoardForDropCheck = board;
                  if (isExistingShip) {
                    tempBoardForDropCheck = board.map((row) =>
                      row.map((cell) => ({ ...cell }))
                    );
                    originalCells.forEach(([r, c]) => {
                      if (
                        tempBoardForDropCheck[r] &&
                        tempBoardForDropCheck[r][c]
                      ) {
                        tempBoardForDropCheck[r][c].ship = false;
                      }
                    });
                  }

                  const finalIsValidPlacement = checkPlacementValidity(
                    rowIndex,
                    colIndex,
                    size,
                    orientation,
                    tempBoardForDropCheck
                  );

                  if (finalIsValidPlacement) {
                    if (isExistingShip) {
                      onShipDrop(
                        rowIndex,
                        colIndex,
                        size,
                        orientation,
                        originalCells
                      );
                    } else {
                      onCellClick(rowIndex, colIndex, size, orientation);
                    }
                    setShowPrompt(false);
                  } else {
                    console.warn(
                      "Невозможно разместить корабль здесь: нарушение правил касания или выход за границы."
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
