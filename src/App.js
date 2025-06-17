import './App.css';
import { useEffect, useState, useRef } from 'react';
import GameBoard from './components/GameBoard/GameBoard.jsx';
import { setupSocketListeners } from './utils/setupSocketListeners.js';
import { placeShip } from './utils/placeShip.js';
import { removeShipAt } from './utils/removeShipAt.js';
import Header from './components/Header/Header.jsx';
import { ShipDock } from './components/Ship/Ship.jsx';
import Prompt from './components/Prompt/Prompt.jsx';

const createEmptyBoard = () =>
  Array(10)
    .fill(null)
    .map(() =>
      Array(10)
        .fill(null)
        .map(() => ({
          ship: false,
          hit: false,
          miss: false,
        }))
    );

function App() {

  const [myBoard, setMyBoard] = useState(createEmptyBoard);
  const [opponentBoard, setOpponentBoard] = useState(createEmptyBoard);
  const [isPlacing, setIsPlacing] = useState(true);
  const [currentShipSize, setCurrentShipSize] = useState(4);
  const [shipsToPlace, setShipsToPlace] = useState({
    4: 1,
    3: 2,
    2: 3,
    1: 4,
  });
  const [isOrientation, setOrientation] = useState('horizontal');
  const [isReady, setIsReady] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);
  const [playerRole, setPlayerRole] = useState(null);
  const [currentTurn, setCurrentTurn] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);
  const [hoveredCells, setHoveredCells] = useState([]);
  const [isValidPlacement, setIsValidPlacement] = useState(null);
  const [draggingShipData, setDraggingShipData] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [gameResult, setGameResult] = useState(null);
  const socketRef = useRef(null);
  const playerRoleRef = useRef(null);

  const handleDragStartShip = (size, orientation) => {
    setDraggingShipData({ size, orientation });
  };

  const handleDragEndShip = () => {
    setDraggingShipData(null); // Очищаем данные, когда перетаскивание завершено
  };

  useEffect(() => {
    playerRoleRef.current = playerRole;
  }, [playerRole]);


  useEffect(() => {
    console.log('App useEffect');
    setupSocketListeners(socketRef, setOpponentReady, setPlayerRole, playerRoleRef, setCurrentTurn, setGameStarted, setOpponentBoard, setMyBoard, setGameOver, setGameResult)
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const handleOpponentCellClick = (row, col) => {
    console.log('handleOpponentCellClick', row, col);
    // Проверяем, наш ли ход
    if (currentTurn !== playerRoleRef.current) {
      console.log('Не твой ход!');
      return;
    }

    // Проверяем, не стреляли ли уже в эту клетку
    const cell = opponentBoard[row][col];
    if (cell.hit || cell.miss) {
      console.log('Уже стреляли в эту клетку!');
      return;
    }

    socketRef.current.emit('fire', { x: col, y: row });
  };

  const handleHover = (row, col, size, orientation, calculatedIsValidPlacement) => {
    const cells = [];

    for (let i = 0; i < size; i++) {
      const r = orientation === 'vertical' ? row + i : row;
      const c = orientation === 'horizontal' ? col + i : col;

      if (r >= 10 || c >= 10) {
        setHoveredCells([]); // не помещается
        setIsValidPlacement(false);
        return;
      }

      cells.push([r, c]);
    }

    setHoveredCells(cells);
    setIsValidPlacement(calculatedIsValidPlacement);
  };

  return (
    <div className="App">
      <Header setMyBoard={setMyBoard} setShipsToPlace={setShipsToPlace} currentShipSize={currentShipSize} shipsToPlace={shipsToPlace} orientation={isOrientation} setOrientation={setOrientation} setCurrentShipSize={setCurrentShipSize} />

      <div className="ship-container">
        <ShipDock shipsToPlace={shipsToPlace} orientation={isOrientation} onDragStartShip={handleDragStartShip}
          onDragEndShip={handleDragEndShip} />
      </div>

      <div className="prompt-container">
        {showPrompt && <Prompt />}
      </div>

      <div style={{ display: 'flex', gap: '40px', padding: '2rem', justifyContent: 'space-between' }}>
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
            onCellClick={(row, col, size, orientation) => placeShip(row,
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
              isOrientation
            )}
            onRightClick={(row, col,) => removeShipAt(row, col, myBoard, setMyBoard, setShipsToPlace, setIsPlacing, setCurrentShipSize)}
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
              <p>Сейчас ход: {currentTurn === playerRole ? 'твой' : 'противника'}</p>
              {currentTurn === playerRole && <p>👆 Нажми на клетку, чтобы выстрелить</p>}
            </>
          ) : (
            <p>Игра ещё не началась</p>
          )}

          {gameOver && (
            <div className="game-result">
              {gameResult === 'win' ? '🎉 Победа!' : '💥 Поражение!'}
            </div>
          )}
        </div>
      </div>
      {!isReady && !isPlacing && (
        <button className='ready' onClick={() => {
          socketRef.current.emit('placeShips', myBoard);
          setIsReady(true);
        }}>
          Начать
        </button>
      )}

      {isReady && !opponentReady && <p className='waiting_enemy'><span className='clock'>⏳</span> Ожидание соперника...</p>}
      {isReady && opponentReady && <p>🔥 Оба игрока готовы! Игра началась.</p>}
    </div>
  );
}
export default App;