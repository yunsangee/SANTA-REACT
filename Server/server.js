const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);

app.use(cors());

const io = socketIo(server, {
  cors: {
    origin: "*",
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
      const response = await axios.post('https://www.dearmysanta.site/hikingGuide/react/getUserCoordination', userLocation, {
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
      const response = await axios.post('http://www.dearmysanta.site/hikingGuide/react/addHikingRecord', record, {
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

// TTS 엔드포인트 추가
const client_id = 'ch1xa6ojlq'; 
const client_secret = 'TWRQUkyUMJXG82q1vjJgE9IpxkYVSQCnwOfKSjbP'; 

app.get('/tts', async (req, res) => {
  const text = req.query.text || '좋은 하루 되세요';
  const api_url = 'https://naveropenapi.apigw.ntruss.com/tts-premium/v1/tts';

  try {
    const response = await axios.post(api_url, `speaker=nara&volume=0&speed=0&pitch=0&text=${encodeURIComponent(text)}&format=mp3`, {
      headers: {
        'X-NCP-APIGW-API-KEY-ID': client_id,
        'X-NCP-APIGW-API-KEY': client_secret,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      responseType: 'stream',
    });

    const filename = `tts_${Date.now()}.mp3`;
    const filepath = path.join(__dirname, filename);
    const writeStream = fs.createWriteStream(filepath);

    response.data.pipe(writeStream);

    writeStream.on('finish', () => {
      res.sendFile(filepath, (err) => {
        if (err) {
          console.error('Error sending the file:', err);
          res.status(500).send('Error sending the file');
        }
        fs.unlink(filepath, (err) => {
          if (err) {
            console.error('Error deleting the file:', err);
          }
        });
      });
    });

  } catch (error) {
    console.error('Error calling TTS API:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
    res.status(500).send('Error calling TTS API');
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
