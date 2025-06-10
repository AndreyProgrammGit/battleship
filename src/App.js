import { io } from 'socket.io-client';
import { useEffect, useState, useRef } from 'react';
import GameBoard from './components/GameBoard/GameBoard.jsx';

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
  const [opponentBoard, setOpponentBoard] = useState(createEmptyBoard); // Убрали enemyBoard
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
  const socketRef = useRef(null);
  const playerRoleRef = useRef(null);

  useEffect(() => {
    playerRoleRef.current = playerRole;
  }, [playerRole]);

  useEffect(() => {
    socketRef.current = io('http://localhost:3000');

    socketRef.current.on('opponentReady', (data) => {
      setOpponentReady(true);
    });

    socketRef.current.on('bothReady', ({ role, yourTurn }) => {
      setPlayerRole(role);
      playerRoleRef.current = role;
      setCurrentTurn(yourTurn ? role : role === 'player1' ? 'player2' : 'player1');
      setGameStarted(true);
    });

    socketRef.current.on('fireResult', ({ x, y, hit, board, yourTurn, isYourShot }) => {
      console.log('fireResult:', { x, y, hit, yourTurn, isYourShot });

      if (!playerRoleRef.current) {
        return;
      }

      if (isYourShot) {
        // Ты стрелял - обновляем доску противника
        setOpponentBoard(board);
      } else {
        // По тебе стреляли - обновляем свою доску
        setMyBoard(board);
      }

      // Обновляем текущий ход
      setCurrentTurn(yourTurn ? playerRoleRef.current :
        (playerRoleRef.current === 'player1' ? 'player2' : 'player1'));
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const handleOpponentCellClick = (row, col) => {
    console.log('Fire at:', row, col);

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

  const canPlaceShip = (board, row, col, size, orientation) => {
    const deltas = orientation === 'horizontal' ? [0, 1] : [1, 0];

    for (let i = 0; i < size; i++) {
      const r = row + i * deltas[0];
      const c = col + i * deltas[1];

      if (r < 0 || r >= 10 || c < 0 || c >= 10) return false;
      if (board[r][c].ship) return false;

      // Проверим соседние клетки (контур)
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (
            nr >= 0 &&
            nr < 10 &&
            nc >= 0 &&
            nc < 10 &&
            board[nr][nc].ship
          ) {
            return false;
          }
        }
      }
    }

    return true;
  };

  const placeShip = (row, col) => {
    if (!isPlacing || shipsToPlace[currentShipSize] <= 0) return;

    if (!canPlaceShip(myBoard, row, col, currentShipSize, orientation)) return;

    const deltas = orientation === 'horizontal' ? [0, 1] : [1, 0];
    const updated = myBoard.map((r) => r.map((c) => ({ ...c })));

    for (let i = 0; i < currentShipSize; i++) {
      const r = row + i * deltas[0];
      const c = col + i * deltas[1];
      updated[r][c].ship = true;
    }

    setMyBoard(updated);

    setShipsToPlace((prevShips) => {
      const newShips = { ...prevShips, [currentShipSize]: prevShips[currentShipSize] - 1 };

      // Найдём следующий размер, который ещё остался
      const nextSize = [4, 3, 2, 1].find((size) => newShips[size] > 0);

      if (nextSize) {
        setCurrentShipSize(nextSize);
      } else {
        setIsPlacing(false);
      }

      return newShips;
    });
  };

  const removeShipAt = (row, col) => {
    const cell = myBoard[row][col];
    if (!cell.ship) return;

    // Обход всех направлений, чтобы найти весь корабль
    const directions = [
      [0, 1],  // горизонтально →
      [1, 0],  // вертикально ↓
      [0, -1], // ←
      [-1, 0], // ↑
    ];

    let shipCells = [{ row, col }];

    for (const [dr, dc] of directions) {
      let r = row + dr;
      let c = col + dc;

      while (r >= 0 && r < 10 && c >= 0 && c < 10 && myBoard[r][c].ship) {
        shipCells.push({ row: r, col: c });
        r += dr;
        c += dc;
      }
    }

    // Удаляем корабль
    const updated = myBoard.map((r) => r.map((c) => ({ ...c })));

    shipCells.forEach(({ row, col }) => {
      updated[row][col].ship = false;
    });

    setMyBoard(updated);

    // Обновляем счётчик кораблей
    const shipSize = shipCells.length;
    setShipsToPlace((prev) => ({
      ...prev,
      [shipSize]: prev[shipSize] + 1,
    }));

    // Если закончили расставлять — включаем режим расстановки снова
    setIsPlacing(true);
    setCurrentShipSize(shipSize);
  };

  return (
    <>
      <div style={{ marginBottom: '1rem' }}>
        <h3>Корабли для расстановки:</h3>
        <ul>
          {[4, 3, 2, 1].map((size) => (
            <li
              key={size}
              style={{
                fontWeight: currentShipSize === size ? 'bold' : 'normal',
                color: shipsToPlace[size] === 0 ? '#888' : '#000',
                cursor: shipsToPlace[size] > 0 ? 'pointer' : 'default',
              }}
              onClick={() => {
                if (shipsToPlace[size] > 0) setCurrentShipSize(size);
              }}
            >
              {size}-палубный: {shipsToPlace[size]} шт
            </li>
          ))}
        </ul>

        <button onClick={() =>
          setOrientation((o) => (o === 'horizontal' ? 'vertical' : 'horizontal'))
        }>
          Поворот ({orientation})
        </button>
      </div>

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

      <div style={{ display: 'flex', gap: '40px', padding: '2rem' }}>
        <div>
          <h2>🛡️ Моя доска</h2>
          <GameBoard
            board={myBoard}
            isOpponent={false}
            onCellClick={placeShip}
            onRightClick={removeShipAt}
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
    </>
  );
}

export default App;