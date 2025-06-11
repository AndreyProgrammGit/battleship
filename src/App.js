import './App.css';
import { useEffect, useState, useRef } from 'react';
import GameBoard from './components/GameBoard/GameBoard.jsx';
import { setupSocketListeners } from './utils/setupSocketListeners.js';
import { placeShip } from './utils/placeShip.js';
import { removeShipAt } from './utils/removeShipAt.js';
import Header from './components/Header/Header.jsx';
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
  const [orientation, setOrientation] = useState('horizontal');
  const [isReady, setIsReady] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);
  const [playerRole, setPlayerRole] = useState(null);
  const [currentTurn, setCurrentTurn] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);

  const [rowAndCol, setColAndRow] = useState({ row: null, col: null });

  const socketRef = useRef(null);
  const playerRoleRef = useRef(null);

  useEffect(() => {
    playerRoleRef.current = playerRole;
  }, [playerRole]);


  useEffect(() => {
    console.log('App useEffect');
    setupSocketListeners(socketRef, setOpponentReady, setPlayerRole, playerRoleRef, setCurrentTurn, setGameStarted, setOpponentBoard, setMyBoard)
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

  const getRowAndCol = (row, col) => {
    console.log('getRowAndCol', row, col);
    setColAndRow({ row, col })
  }

  return (
    <div className="App">
      <Header currentShipSize={currentShipSize} shipsToPlace={shipsToPlace} orientation={orientation} setOrientation={setOrientation} setCurrentShipSize={setCurrentShipSize} />

      {!isReady && !isPlacing && (
        <button onClick={() => {
          socketRef.current.emit('placeShips', myBoard);
          setIsReady(true);
        }}>
          ✅ Готов
        </button>
      )}

      {isReady && !opponentReady && <p>⏳ Ожидание соперника...</p>}
      {isReady && opponentReady && <p>🔥 Оба игрока готовы! Игра началась.</p>}
        <div style={{ display: 'flex', gap: '40px', padding: '2rem', justifyContent: 'space-between' }}>
          <div>
            <h2>🛡️ Моя доска</h2>
            <GameBoard
              board={myBoard}
              isOpponent={false}
              getRowAndCol={getRowAndCol}
              onCellClick={(row, col) => placeShip(row, col, myBoard, currentShipSize, orientation, isPlacing, shipsToPlace, setMyBoard, setShipsToPlace, setCurrentShipSize, setIsPlacing)}
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
          </div>
        </div>
    </div>
  );
}

export default App;