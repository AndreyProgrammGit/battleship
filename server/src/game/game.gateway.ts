import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';

interface PlayerState {
  id: string;
  board: any;
  ready: boolean;
}

let players: PlayerState[] = [];
let turnIndex = 0;

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private clients: Map<string, Socket> = new Map();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    this.clients.set(client.id, client);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.clients.delete(client.id);
    // Удаляем игрока из списка
    players = players.filter(p => p.id !== client.id);
  }

  @SubscribeMessage('placeShips')
  handlePlaceShips(@MessageBody() board: any, @ConnectedSocket() client: Socket) {
    
    if (players.length >= 2) {
      players.splice(0, players.length);
      turnIndex = 0;
    }
    
    let player = players.find(p => p.id === client.id);
    if (player) {
      player.board = board;
      player.ready = true;
    } else {
      players.push({ id: client.id, board, ready: true });
    }
    
    console.log('players', players);

    client.emit('shipsPlacedAck', { status: 'ok' });
    client.broadcast.emit('opponentReady', { clientId: client.id });

    if (players.length === 2 && players.every(p => p.ready)) {
      const [p1, p2] = players;
      this.clients.get(p1.id)?.emit('bothReady', {
        role: 'player1',
        yourTurn: true,
      });
      this.clients.get(p2.id)?.emit('bothReady', {
        role: 'player2',
        yourTurn: false,
      });
    }
  }

  @SubscribeMessage('fire')
  handleFire(
    @MessageBody() data: { x: number; y: number },
    @ConnectedSocket() shooter: Socket,
  ) {
    const shooterIndex = players.findIndex((p) => p.id === shooter.id);
    const targetIndex = 1 - shooterIndex;

    if (shooterIndex === -1 || turnIndex !== shooterIndex) return;

    const targetPlayer = players[targetIndex];
    const shooterPlayer = players[shooterIndex];
    
    if (!targetPlayer || !shooterPlayer) return;

    const cell = targetPlayer.board[data.y][data.x];

    // Проверяем, не стреляли ли уже в эту клетку
    if (cell.hit || cell.miss) return;

    const hit = cell.ship;
    if (hit) {
      cell.hit = true;
      // При попадании ход остается у стрелявшего
    } else {
      cell.miss = true;
      // При промахе ход переходит к противнику
      turnIndex = targetIndex;
    }

    const shooterSocket = this.clients.get(shooterPlayer.id);
    const targetSocket = this.clients.get(targetPlayer.id);

    // Стрелявшему отправляем доску противника (обновленную)
    shooterSocket?.emit('fireResult', {
      x: data.x,
      y: data.y,
      hit,
      board: targetPlayer.board,
      yourTurn: turnIndex === shooterIndex,
      isYourShot: true,
    });

    // Цели отправляем его собственную доску (обновленную)
    targetSocket?.emit('fireResult', {
      x: data.x,
      y: data.y,
      hit,
      board: targetPlayer.board,
      yourTurn: turnIndex === targetIndex,
      isYourShot: false,
    });

    console.log(`Shot at (${data.x}, ${data.y}): ${hit ? 'HIT' : 'MISS'}`);
    console.log(`Turn now: player${turnIndex + 1}`);
  }
}