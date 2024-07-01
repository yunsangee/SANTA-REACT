const express = require('express');
const https = require('https');
const fs = require('fs');
const socketIo = require('socket.io');
const cors = require('cors');
const axios = require('axios');

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST"]
}));

const server = https.createServer({
  key: fs.readFileSync('/etc/ssl/private/privkey.pem'),
  cert: fs.readFileSync('/etc/ssl/certs/fullchain.pem')
}, app);

const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  path: '/hikingAssist'
});

io.on('connection', (socket) => {
  console.log('a user connected:', socket.id);

  socket.on('location', async (location) => {
    console.log('Received location from user:', socket.id, location);

    const userLocation = {
      userLatitude: location.latitude,
      userLongitude: location.longitude
    };

    try {
      console.log('Sending location to Spring Boot server:', userLocation);
      const response = await axios.post('https://www.dearmysanta.site/hiking/react/getUserCoordination', userLocation, {
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
      const response = await axios.post('https://www.dearmysanta.site/hiking/react/addHikingRecord', record, {
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

const client_id = 'ch1xa6ojlq';
const client_secret = 'TWRQUkyUMJXG82q1vjJgE9IpxkYVSQCnwOfKSjbP';

app.get('/hikingAssist/tts', async (req, res) => {
  const text = decodeURIComponent(req.query.text || '좋은 하루 되세요');
  const api_url = 'https://naveropenapi.apigw.ntruss.com/tts-premium/v1/tts';

  try {
    const response = await axios.post(api_url, null, {
      params: {
        speaker: 'nara',
        volume: '0',
        speed: '0',
        pitch: '0',
        text: text,
        format: 'mp3'
      },
      headers: {
        'X-NCP-APIGW-API-KEY-ID': client_id,
        'X-NCP-APIGW-API-KEY': client_secret,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      responseType: 'arraybuffer'
    });

    res.setHeader('Content-Type', 'audio/mp3');
    res.send(response.data);
  } catch (error) {
    console.error('Error during TTS request:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
    res.status(500).send('Error generating TTS');
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
