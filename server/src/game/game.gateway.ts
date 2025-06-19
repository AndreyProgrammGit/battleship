import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { isAllShipsSunk } from './utils/isAllShipSunk';

interface PlayerState {
  id: string;
  board: any;
  ready: boolean;
}

interface PlyaerInRoom {
  roomId: string;
  user: string;
  userId: string;
}

let players: PlayerState[] = [];
let rooms: { room: string; user: string; name: string }[] = [];
let turnIndex = 0;

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private clients: Map<string, Socket> = new Map();
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    this.clients.set(client.id, client);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.clients.delete(client.id);
    const removedRooms = rooms.filter((r) => r.user === client.id);
    for (const item of removedRooms) {
      client.leave(item.room);
    }

    client.broadcast.emit('userIsLeave', {
      message: `${client.id} вышел из комнаты`,
    });

    removedRooms.forEach((item) => {
      const index = rooms.findIndex((r) => r.user === item.user);
      if (index !== -1) rooms.splice(index, 1);
    });

    players = players.filter((p) => p.id !== client.id);
  }

  @SubscribeMessage('getRooms')
  sendRooms(@ConnectedSocket() client: Socket) {
    client.emit('sendAllRooms', rooms);
  }

  @SubscribeMessage('joinToRoom')
  async handleJoinToRoom(
    @MessageBody() body: PlyaerInRoom,
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, user, userId } = body;
    client.join(roomId);

    if (!rooms.find((item) => item.room === roomId)) {
      console.log('created room');
      rooms.push({ room: roomId, user: client.id, name: user });
    }

    console.log('join room', rooms);

    client.to(roomId).emit('userJoined', {
      user,
      userId,
    });

    client.emit('joinedRoom', { roomId });

    const socketsInRoom = await this.server.in(roomId).fetchSockets();

    if (socketsInRoom.length >= 2) {
      const index = rooms.findIndex((i) => i.room === roomId);
      if (index !== -1) rooms.splice(index, 1);
    }

    client.emit('roomIsFull', {
      countUsersInRoom: socketsInRoom.length,
    });
  }

  @SubscribeMessage('placeShips')
  handlePlaceShips(
    @MessageBody() board: any,
    @ConnectedSocket() client: Socket,
  ) {
    if (players.length >= 2) {
      players.splice(0, players.length);
      turnIndex = 0;
    }

    let player = players.find((p) => p.id === client.id);
    if (player) {
      player.board = board;
      player.ready = true;
    } else {
      players.push({ id: client.id, board, ready: true });
    }

    client.emit('shipsPlacedAck', { status: 'ok' });
    client.broadcast.emit('opponentReady', { clientId: client.id });

    if (players.length === 2 && players.every((p) => p.ready)) {
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
    if (cell.hit || cell.miss) return;

    const hit = cell.ship;
    if (hit) {
      cell.hit = true;

      // Отметка вокруг попадания (по желанию)
      const deltas = [-1, 0, 1];
      for (let dy of deltas) {
        for (let dx of deltas) {
          const nx = data.x + dx;
          const ny = data.y + dy;
          if (
            ny >= 0 &&
            ny < 10 &&
            nx >= 0 &&
            nx < 10 &&
            !(dx === 0 && dy === 0)
          ) {
            const neighbor = targetPlayer.board[ny][nx];
            if (!neighbor.ship && !neighbor.hit && !neighbor.miss) {
              neighbor.nearHit = true;
            }
          }
        }
      }

      // ✅ Проверка на конец игры
      if (isAllShipsSunk(targetPlayer.board)) {
        shooter.emit('gameOver', { winner: `player${shooterIndex + 1}` });
        this.clients
          .get(targetPlayer.id)
          ?.emit('gameOver', { winner: `player${shooterIndex + 1}` });

        console.log(`Game Over. Winner: player${shooterIndex + 1}`);
        players = [];
        turnIndex = 0;
        return;
      }

      // Попадание — ход остаётся у игрока
    } else {
      cell.miss = true;
      turnIndex = targetIndex;
    }

    const shooterSocket = this.clients.get(shooterPlayer.id);
    const targetSocket = this.clients.get(targetPlayer.id);

    shooterSocket?.emit('fireResult', {
      x: data.x,
      y: data.y,
      hit,
      board: targetPlayer.board,
      yourTurn: turnIndex === shooterIndex,
      isYourShot: true,
    });

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
