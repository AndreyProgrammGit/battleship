import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { ToastContainer } from "react-toastify";
import { ShipDock } from "../../components/Ship/Ship.jsx";
import Prompt from "../../components/Prompt/Prompt.jsx";
import GameBoard from "../../components/GameBoard/GameBoard.jsx";
import Header from "../../components/Header/Header.jsx";
import { placeShip } from "../utils/placeShip.js";
import { removeShipAt } from "../utils/removeShipAt.js";
import { setupSocketListeners } from "../utils/setupSocketListeners.js";
import { randomlyPlaceShips } from "../utils/randomlyPlaceShips.js";
import { createEmptyBoard } from "../utils/createEmptyBoard.js";
import {
  notifyEnterToRoom,
  notifyUserEnterToRoom,
  notifyUserLeaveFromRoom,
} from "../utils/toastNotify.js";
import "./GamePage.scss";

const GamePage = ({ socket }) => {
  const [draggingShipData, setDraggingShipData] = useState(null);
  const [showPrompt, setShowPrompt] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [isPlacing, setIsPlacing] = useState(true);
  const [hoveredCells, setHoveredCells] = useState([]);
  const [isValidPlacement, setIsValidPlacement] = useState(null);

  const [myBoard, setMyBoard] = useState(createEmptyBoard);
  const [opponentBoard, setOpponentBoard] = useState(createEmptyBoard);
  const [currentShipSize, setCurrentShipSize] = useState(4);
  const [shipsToPlace, setShipsToPlace] = useState({
    4: 1,
    3: 2,
    2: 3,
    1: 4,
  });
  const [isOrientation, setOrientation] = useState("horizontal");
  const [opponentReady, setOpponentReady] = useState(false);
  const [playerRole, setPlayerRole] = useState(null);
  const [currentTurn, setCurrentTurn] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);

  const [gameOver, setGameOver] = useState(false);
  const [gameResult, setGameResult] = useState(null);
  const socketRef = useRef(null);
  const playerRoleRef = useRef(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    playerRoleRef.current = playerRole;
  }, [playerRole]);

  useEffect(() => {
    socket.emit("joinToRoom", {
      roomId: id,
      user: localStorage.getItem("user"),
      userId: socket.id,
    });

    if (!localStorage.getItem("user")) {
      navigate("/");
    }

    socket.on("roomIsFull", ({ countUsersInRoom }) => {
      if (countUsersInRoom > 2) {
        navigate("/rooms", { state: { roomIsFull: true } });
      }
    });
  }, []);

  useEffect(() => {
    socket.on("userJoined", ({ user, userId }) => {
      notifyUserEnterToRoom(user);
    });

    socket.on("userIsLeave", ({ message }) => {
      notifyUserLeaveFromRoom(message);
    });

    socket.on("joinedRoom", ({ roomId }) => {
      notifyEnterToRoom(`Вы вошли в комнату ${roomId}`);
    });
  }, [socket]);

  useEffect(() => {
    setupSocketListeners(
      socket,
      socketRef,
      setOpponentReady,
      setPlayerRole,
      playerRoleRef,
      setCurrentTurn,
      setGameStarted,
      setOpponentBoard,
      setMyBoard,
      setGameOver,
      setGameResult
    );
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const handleOpponentCellClick = (row, col) => {
    console.log("handleOpponentCellClick", row, col);
    if (currentTurn !== playerRoleRef.current) {
      console.log("Не твой ход!");
      return;
    }

    const cell = opponentBoard[row][col];
    if (cell.hit || cell.miss) {
      console.log("Уже стреляли в эту клетку!");
      return;
    }

    socketRef.current.emit("fire", { x: col, y: row });
  };

  const handleHover = (
    row,
    col,
    size,
    orientation,
    calculatedIsValidPlacement
  ) => {
    const cells = [];

    for (let i = 0; i < size; i++) {
      const r = orientation === "vertical" ? row + i : row;
      const c = orientation === "horizontal" ? col + i : col;

      if (r >= 10 || c >= 10) {
        setHoveredCells([]);
        setIsValidPlacement(false);
        return;
      }

      cells.push([r, c]);
    }

    setHoveredCells(cells);
    setIsValidPlacement(calculatedIsValidPlacement);
  };

  const handleDragStartShip = (
    size,
    orientation,
    isExistingShip = false,
    originalCells = []
  ) => {
    setDraggingShipData({ size, orientation, isExistingShip, originalCells });
  };

  const handleDragEndShip = () => {
    setDraggingShipData(null);
    setHoveredCells([]);
    setIsValidPlacement(null);
  };

  const handleShipDragStart = (size, orientation, originalCells) => {
    setDraggingShipData({
      size,
      orientation,
      isExistingShip: true,
      originalCells,
    });
  };
  const handleShipDrop = (newRow, newCol, size, orientation, originalCells) => {
    let boardAfterRemoval = myBoard.map((row) =>
      row.map((cell) => ({ ...cell }))
    );
    originalCells.forEach(([r, c]) => {
      if (boardAfterRemoval[r] && boardAfterRemoval[r][c]) {
        boardAfterRemoval[r][c].ship = false;
      }
    });

    const { newBoard: boardAfterPlacement, shipPlaced } = placeShip(
      newRow,
      newCol,
      boardAfterRemoval,
      size,
      orientation,
      true,
      shipsToPlace,
      setMyBoard,
      setShipsToPlace,
      setCurrentShipSize,
      setIsPlacing,
      isOrientation,
      true
    );

    if (shipPlaced) {
      setMyBoard(boardAfterPlacement);
      setShowPrompt(false);
    } else {
      setMyBoard(myBoard);
      console.warn(
        "Не удалось переместить корабль: новое место недействительно."
      );
    }
    setDraggingShipData(null);
    setHoveredCells([]);
    setIsValidPlacement(null);
  };

  const handleRandomPlacement = () => {
    setMyBoard(createEmptyBoard());
    setShipsToPlace({
      4: 1,
      3: 2,
      2: 3,
      1: 4,
    });

    const { newBoard, updatedShipsToPlace } = randomlyPlaceShips({
      4: 1,
      3: 2,
      2: 3,
      1: 4,
    });

    setMyBoard(newBoard);
    setShipsToPlace(updatedShipsToPlace);
    setIsPlacing(false);
    setShowPrompt(false);
  };

  return (
    <>
      <Header
        setMyBoard={setMyBoard}
        setShipsToPlace={setShipsToPlace}
        currentShipSize={currentShipSize}
        shipsToPlace={shipsToPlace}
        orientation={isOrientation}
        setOrientation={setOrientation}
        setCurrentShipSize={setCurrentShipSize}
      />

      <div className="ship-container">
        <ShipDock
          shipsToPlace={shipsToPlace}
          orientation={isOrientation}
          onDragStartShip={handleDragStartShip}
          onDragEndShip={handleDragEndShip}
        />
      </div>

      {isPlacing && (
        <button
          onClick={handleRandomPlacement}
          className="random-placement-button"
        >
          Случайная расстановка
        </button>
      )}

      <div className="prompt-container">{showPrompt && <Prompt />}</div>

      <div
        style={{
          display: "flex",
          gap: "40px",
          padding: "2rem",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h2>🛡️ Моя доска</h2>
          <GameBoard
            board={myBoard}
            isOpponent={false}
            setShowPrompt={setShowPrompt}
            hoveredCells={hoveredCells}
            isValidPlacement={isValidPlacement}
            setHoveredCells={setHoveredCells}
            setIsValidPlacement={setIsValidPlacement}
            onHover={handleHover}
            draggingShipData={draggingShipData}
            onShipDragStart={handleShipDragStart}
            onShipDrop={handleShipDrop}
            onCellClick={(row, col, size, orientation) =>
              placeShip(
                row,
                col,
                myBoard,
                size || currentShipSize,
                orientation,
                isPlacing,
                shipsToPlace,
                setMyBoard,
                setShipsToPlace,
                setCurrentShipSize,
                setIsPlacing,
                isOrientation,
                false
              )
            }
            onRightClick={(row, col) =>
              removeShipAt(
                row,
                col,
                myBoard,
                setMyBoard,
                setShipsToPlace,
                setIsPlacing,
                setCurrentShipSize
              )
            }
          />
        </div>
        <div>
          <h2>🎯 Доска противника</h2>
          {gameStarted ? (
            <>
              <GameBoard
                board={opponentBoard}
                isOpponent={true}
                onCellClick={handleOpponentCellClick}
              />
              <p>
                Сейчас ход: {currentTurn === playerRole ? "твой" : "противника"}
              </p>
              {currentTurn === playerRole && (
                <p>👆 Нажми на клетку, чтобы выстрелить</p>
              )}
            </>
          ) : (
            <p>Игра ещё не началась</p>
          )}

          {gameOver && (
            <div className="game-result">
              {gameResult === "win" ? "🎉 Победа!" : "💥 Поражение!"}
            </div>
          )}
        </div>
      </div>
      {!isReady && !isPlacing && (
        <button
          className="ready"
          onClick={() => {
            socketRef.current.emit("placeShips", myBoard);
            setIsReady(true);
          }}
        >
          Начать
        </button>
      )}

      {isReady && !opponentReady && (
        <p className="waiting_enemy">
          <span className="clock">⏳</span> Ожидание соперника...
        </p>
      )}
      {isReady && opponentReady && <p>🔥 Оба игрока готовы! Игра началась.</p>}

      <ToastContainer position="bottom-right" />
    </>
  );
};

export default GamePage;
