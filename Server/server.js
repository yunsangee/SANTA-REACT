const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Enable CORS for express
app.use(cors());

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

let userLocations = {}; // Store the latest location of each connected user

io.on('connection', (socket) => {
  console.log('a user connected');

  // Listen for location updates from the client
  socket.on('location', (location) => {
    console.log('Received location from user:', socket.id, location);
    // Store the location with the socket ID as the key
    userLocations[socket.id] = location;
  });

  socket.on('disconnect', () => {
    console.log('user disconnected:', socket.id);
    // Remove the user’s location when they disconnect
    delete userLocations[socket.id];
  });
});

// Emit stored user locations every 2 seconds
setInterval(() => {
  console.log('Broadcasting user locations:', userLocations);
  io.emit('locationUpdate', userLocations);
}, 2000);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});