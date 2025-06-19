export const setupSocketListeners = (
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
) => {
  console.log("Setting up socket listeners");

  socketRef.current = socket;

  socketRef.current.on("opponentReady", (data) => {
    setOpponentReady(true);
  });

  socketRef.current.on("bothReady", ({ role, yourTurn }) => {
    setPlayerRole(role);
    playerRoleRef.current = role;
    setCurrentTurn(
      yourTurn ? role : role === "player1" ? "player2" : "player1"
    );
    setGameStarted(true);
  });

  socketRef.current.on(
    "fireResult",
    ({ x, y, hit, board, yourTurn, isYourShot }) => {
      console.log("fireResult:", { x, y, hit, yourTurn, isYourShot });

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
      setCurrentTurn(
        yourTurn
          ? playerRoleRef.current
          : playerRoleRef.current === "player1"
          ? "player2"
          : "player1"
      );
    }
  );

  socketRef.current.on("gameOver", ({ winner }) => {
    const player = playerRoleRef.current;
    setGameOver(true);
    setGameResult(winner === player ? "win" : "lose");
  });
};
