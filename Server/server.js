const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  path: '/hikingAssist'
});

app.use(cors());
app.use(express.json());

const client_id = 'ch1xa6ojlq'; 
const client_secret = 'TWRQUkyUMJXG82q1vjJgE9IpxkYVSQCnwOfKSjbP'; 

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on('text-to-speech', async (text) => {
        const api_url = 'https://naveropenapi.apigw.ntruss.com/tts-premium/v1/tts';
        
        try {
            const response = await axios.post(api_url, `speaker=nara&volume=0&speed=0&pitch=0&text=${encodeURIComponent(text)}&format=mp3`, {
                headers: {
                    'X-NCP-APIGW-API-KEY-ID': client_id,
                    'X-NCP-APIGW-API-KEY': client_secret,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                responseType: 'arraybuffer',
            });

            // 클라이언트에 음성 데이터를 base64 형식으로 전송합니다.
            const audioBuffer = Buffer.from(response.data, 'binary').toString('base64');
            socket.emit('audio', audioBuffer);
        } catch (error) {
            console.error('Error calling TTS API:', error.message);
            socket.emit('error', 'Error calling TTS API');
        }
    });
});

app.post('/generate-tts', async (req, res) => {
    const { text } = req.body;
    const api_url = 'https://naveropenapi.apigw.ntruss.com/tts-premium/v1/tts';

    try {
        const response = await axios.post(api_url, `speaker=nara&volume=0&speed=0&pitch=0&text=${encodeURIComponent(text)}&format=mp3`, {
            headers: {
                'X-NCP-APIGW-API-KEY-ID': client_id,
                'X-NCP-APIGW-API-KEY': client_secret,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            responseType: 'arraybuffer',
        });

        const filename = `tts_${Date.now()}.mp3`;
        const filepath = path.join(__dirname, filename);
        fs.writeFileSync(filepath, response.data);

        res.send({ filename });
    } catch (error) {
        console.error('Error generating TTS:', error.message);
        res.status(500).send('Error generating TTS');
    }
});

app.get('/download-tts/:filename', (req, res) => {
    const { filename } = req.params;
    const filepath = path.join(__dirname, filename);
    res.download(filepath, (err) => {
        if (err) {
            console.error('Error downloading the file:', err);
            res.status(500).send('Error downloading the file');
        }
        fs.unlink(filepath, (err) => {
            if (err) {
                console.error('Error deleting the file:', err);
            }
        });
    });
});

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
