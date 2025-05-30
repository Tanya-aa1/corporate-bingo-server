// index.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

const phrases = [
  "Let's circle back", "Synergy", "Can you see my screen?", "Touch base",
  "Bandwidth", "Low-hanging fruit", "Take this offline", "Ping me",
  "Move the needle", "Quick win", "Deep dive", "Align", "Reach out",
  "Put a pin in it", "Jump on a call", "Leverage", "Think outside the box",
  "Win-win", "Double-click", "At the end of the day", "Granular", "Ideate",
  "Push back", "New normal", "Give 110%"
];

const shuffle = (array) => [...array].sort(() => Math.random() - 0.5);

const generateBoard = () => {
  const shuffled = shuffle(phrases);
  return Array.from({ length: 5 }, (_, i) =>
    Array.from({ length: 5 }, (_, j) => ({
      text: shuffled[i * 5 + j],
      marked: false
    }))
  );
};

const roomBoards = {}; // Store boards per room

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('join_room', ({ room, username }) => {
    socket.join(room);
    socket.data.username = username;

    // Generate board for room if it doesn't exist
    if (!roomBoards[room]) {
      roomBoards[room] = generateBoard();
    }

    // Send board to this client
    socket.emit('board_data', roomBoards[room]);

    console.log(`${username} joined room ${room}`);
  });

  socket.on('bingo_win', ({ room, username }) => {
    console.log(`${username} claims bingo in room ${room}`);
    io.to(room).emit('bingo_winner', username);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(3001, () => {
  console.log('Server listening on port 3001');
});
