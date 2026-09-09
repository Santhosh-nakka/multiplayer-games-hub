const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Store active rooms
const rooms = new Map(); 
// gameType -> array of waiting sockets
const waitingPlayers = new Map(); 

function checkTicTacToeWin(board) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
    [0, 4, 8], [2, 4, 6]             // Diagonals
  ];
  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  if (!board.includes(null) && !board.includes('')) return 'draw';
  return null;
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_queue', (gameType) => {
    let queue = waitingPlayers.get(gameType) || [];
    
    // Check if someone is waiting
    if (queue.length > 0) {
      const opponent = queue.shift();
      waitingPlayers.set(gameType, queue);
      
      const roomId = `room_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      // Initialize game state based on gameType
      let gameState = {};
      if (gameType === 'tic-tac-toe') {
        gameState = {
          board: Array(9).fill(''),
          turn: 'X',
          winner: null,
          players: {
            [opponent.id]: 'X',
            [socket.id]: 'O'
          }
        };
      }

      const room = {
        id: roomId,
        players: [opponent.id, socket.id],
        gameType,
        gameState
      };
      rooms.set(roomId, room);

      opponent.join(roomId);
      socket.join(roomId);

      // Notify both players
      io.to(roomId).emit('match_found', {
        roomId,
        gameType,
        opponentId: socket.id // Actually we don't strictly need opponentId on client
      });
      
      // Send initial state
      io.to(roomId).emit('game_update', room.gameState);
      
      console.log(`Match created for ${gameType} in room ${roomId}`);
    } else {
      queue.push(socket);
      waitingPlayers.set(gameType, queue);
      socket.emit('waiting_for_match');
      console.log(`${socket.id} is waiting for ${gameType}`);
    }
  });

  socket.on('make_move', ({ roomId, move }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    if (room.gameType === 'tic-tac-toe') {
      const { index } = move;
      const { board, turn, winner, players } = room.gameState;
      
      // Validate move
      if (winner || board[index] !== '') return;
      
      // Check if it's the correct player's turn
      const playerSymbol = players[socket.id];
      if (playerSymbol !== turn) return;

      // Apply move
      board[index] = playerSymbol;
      
      // Check win
      const result = checkTicTacToeWin(board);
      if (result) {
        room.gameState.winner = result;
      } else {
        room.gameState.turn = turn === 'X' ? 'O' : 'X';
      }

      io.to(roomId).emit('game_update', room.gameState);
    }
  });

  socket.on('play_again', (roomId) => {
    const room = rooms.get(roomId);
    if (!room) return;
    
    // For now, reset instantly when someone hits play again.
    // In a full game, you might wait for both to agree.
    if (room.gameType === 'tic-tac-toe') {
      // Swap symbols for fairness
      const p1 = room.players[0];
      const p2 = room.players[1];
      const currentX = Object.keys(room.gameState.players).find(k => room.gameState.players[k] === 'X');
      
      room.gameState = {
        board: Array(9).fill(''),
        turn: 'X',
        winner: null,
        players: {
          [p1]: currentX === p1 ? 'O' : 'X',
          [p2]: currentX === p2 ? 'O' : 'X'
        }
      };
      
      io.to(roomId).emit('game_update', room.gameState);
    }
  });

  socket.on('leave_room', (roomId) => {
    socket.leave(roomId);
    const room = rooms.get(roomId);
    if (room) {
      room.players = room.players.filter(p => p !== socket.id);
      io.to(roomId).emit('opponent_left');
      if (room.players.length === 0) {
        rooms.delete(roomId);
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Remove from queue
    for (const [gameType, queue] of waitingPlayers.entries()) {
      const index = queue.findIndex(s => s.id === socket.id);
      if (index !== -1) {
        queue.splice(index, 1);
        waitingPlayers.set(gameType, queue);
      }
    }
    
    // Handle leaving active rooms
    for (const [roomId, room] of rooms.entries()) {
      if (room.players.includes(socket.id)) {
        room.players = room.players.filter(p => p !== socket.id);
        io.to(roomId).emit('opponent_left');
        rooms.delete(roomId);
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
