const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const axios = require('axios');

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

const haversineDistance = (coords1, coords2) => {
  const toRad = (x) => x * Math.PI / 180;

  const lat1 = coords1.latitude;
  const lon1 = coords1.longitude;
  const lat2 = coords2.latitude;
  const lon2 = coords2.longitude;

  const R = 6371; // Earth radius in kilometers

  const x1 = lat2 - lat1;
  const dLat = toRad(x1);
  const x2 = lon2 - lon1;
  const dLon = toRad(x2);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const d = R * c;

  return d;
};

// Generate random coordinates within a specified range
const generateRandomCoordinates = (center, range) => {
  const getRandomInRange = (min, max) => Math.random() * (max - min) + min;

  const latitude = getRandomInRange(center.latitude - range, center.latitude + range);
  const longitude = getRandomInRange(center.longitude - range, center.longitude + range);

  return { latitude, longitude };
};

io.on('connection', (socket) => {
  console.log('a user connected');

  // Listen for location updates from the client
  socket.on('location', (location) => {
    console.log('Received location from user:', socket.id, location);

    // Generate random coordinates and send them to the client
    const randomCoordinates = generateRandomCoordinates(location, 0.01); // Generate random coordinates within 0.01 degrees
    const distance = haversineDistance(location, randomCoordinates);

    console.log(`Generated random coordinates: ${randomCoordinates.latitude}, ${randomCoordinates.longitude}`);
    console.log(`Distance to random coordinates: ${distance} km`);

    // Emit the random coordinates, distance, and notification status back to the client
    socket.emit('randomCoordinate', { randomCoordinates, distance, almostThere: distance < 0.5 });

    // Optionally, you can log the distance here if needed
    console.log(`Distance to random coordinates: ${distance} km`);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
