const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose'); // mongodb를 mongoose로 변경
const cors = require('cors');
const bodyParser = require('body-parser');
const awsSdk = require('aws-sdk');
const multer = require('multer');
const PropertiesReader = require('properties-reader');
const path = require('path');

// Express 앱과 HTTP 서버 설정
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
     path: '/chatting'
});

// app.use(cors());
app.use(bodyParser.json());

const properties = PropertiesReader(path.join(__dirname, 'common.properties'));
const mongoUri = properties.get('mongo.uri'); // 로컬 MongoDB URI

mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log('MongoDB connection error:', err));

const chatSchema = new mongoose.Schema({
    roomNo: { type: Number, required: true, unique: true },
    messages: [{
        // _id 필드를 명시하지 않으면 기본적으로 생성됨.
        userNo: Number,
        userNickname: String,
        contents: String,
        isImage: { type: Boolean, default: false },
        isDeleted: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now }
    }]
});

const Chat = mongoose.model('Chat', chatSchema);

// 채팅방 생성 핸들러
app.post('/createChattingRoom', async (req, res) => {
    const { roomNo } = req.body;
    
    const existingRoom = await Chat.findOne({ roomNo });
    if (!existingRoom) {
        const newChattingRoom = new Chat({ roomNo, messages: [] });
        await newChattingRoom.save();
        res.status(201).send({ message: 'Chatting room created' });
    } else {
        res.status(201).send({ message: 'Chatting room already exists' });
    }
});

io.on('connection', (socket) => {
    socket.on('joinRoom', async (roomNo) => {
        socket.join(roomNo);
        console.log(`Client ${socket.id} joined room ${roomNo}`); // 클라이언트가 방에 참여할 때 로그 찍기

        // 과거 채팅 기록을 조회하여 클라이언트로 전송
        const chattingRoom = await Chat.findOne({ roomNo });
        if (chattingRoom) {
            socket.emit('loadMessages', chattingRoom.messages);
        }
    });

    socket.on('chatMessage', async ({ roomNo, message }) => {

        console.log('Message Send Event')

        const chattingRoom = await Chat.findOne({ roomNo });
        if (chattingRoom) {
            // 새로운 메시지에 고유 ID가 자동으로 추가됨

            // chattingRoom.messages.push(message);
            // await chattingRoom.save();

            // io.to(roomNo).emit('message', message);

            const newMessage = chattingRoom.messages.create(message);
            chattingRoom.messages.push(newMessage);
            await chattingRoom.save();

            console.log(`newMessage = ${newMessage}`);

            io.to(roomNo).emit('message', newMessage);
            io.emit('lastMessage', { roomNo, lastMessage: newMessage });
        }
    });

    // 메시지 삭제
    socket.on('deleteMessage', async ({ roomNo, messageId }) => {

        console.log('Message Delete Event')
        console.log(`meesage id = ${messageId}`)

        const chattingRoom = await Chat.findOne({ roomNo });
        if (chattingRoom) {
            const message = chattingRoom.messages.id(messageId);
            if (message) {
                const userNickname = message.userNickname;
                message.isDeleted = true;
                await chattingRoom.save();

                io.to(roomNo).emit('deleteMessage', {userNickname, messageId, isDeleted: true });
            }
        }
    });

    socket.on('getLastMessage', async (roomNo) => {

        const chattingRoom = await Chat.findOne({ roomNo });
        if (chattingRoom) {
            const lastMessage = chattingRoom.messages[chattingRoom.messages.length - 1];
            if (lastMessage.isDeleted) {
                lastMessage.contents = '삭제된 메시지입니다.';
            }
            socket.emit('lastMessage', { roomNo, lastMessage });
        }
    });

});

server.listen(3002, () => {
    console.log('Server is listening on port 3002');
});
