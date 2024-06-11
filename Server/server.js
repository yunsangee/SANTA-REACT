const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const axios = require('axios');

const app = express();
const server = http.createServer(app);

app.use(cors());

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('a user connected:', socket.id);

  socket.on('location', async (location) => {
    console.log('Received location from user:', socket.id, location);

    const userLocation = {
      userNo: 1,
      userLatitude: location.latitude,
      userLongitude: location.longitude
    };

    try {
      console.log('Sending location to Spring Boot server:', userLocation);
      const response = await axios.post('http://localhost:8001/hikingGuide/react/getUserCoordination', userLocation, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Location sent to Spring Boot server:', response.data);
    } catch (error) {
      console.error('Error sending location to Spring Boot server:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      }
    }

    io.emit('locationUpdate', location);
  });

  socket.on('hikingRecord', async (record) => {
    console.log('Received hiking record from user:', socket.id, record);

    try {
      console.log('Sending hiking record to Spring Boot server:', record);
      const response = await axios.post('http://localhost:8001/hikingGuide/react/addHikingRecord', record, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Hiking record sent to Spring Boot server:', response.data);
    } catch (error) {
      console.error('Error sending hiking record to Spring Boot server:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
