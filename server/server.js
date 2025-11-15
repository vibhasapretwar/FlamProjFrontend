// Express + WebSocket server
const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const roomManager = require('./rooms.js');
const drawingState = require('./drawing-state.js');

const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'client')));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});

app.get('/canvas', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Create room
    socket.on('createRoom', () => {
        const roomId = roomManager.createRoom();
        socket.join(roomId);
        drawingState.initializeRoom(roomId);
        socket.emit('roomCreated', roomId);
        console.log(`Room created with ID: ${roomId}`);
    });

    // Join room
    socket.on('joinRoom', ({ roomId }) => {
        if (roomManager.joinRoom(roomId)) {
            socket.join(roomId);
            drawingState.initializeRoom(roomId);
            socket.emit('roomJoined', roomId);
            
            // Send current room state to the new user
            const drawings = drawingState.getDrawings(roomId);
            const settings = drawingState.getBrushSettings(roomId);
            socket.emit('roomState', { drawings, settings });
            
            console.log(`User ${socket.id} joined room: ${roomId}`);
        } else {
            socket.emit('roomNotFound', roomId);
            console.log(`Room with ID: ${roomId} not found`);
        }
    });

    // Handle drawing event
    socket.on('drawing', (data) => {
        if (data.roomId && roomManager.roomExists(data.roomId)) {
            drawingState.addDrawing(data.roomId, data);
            socket.to(data.roomId).emit('drawing', data);
        }
    });

    // Handle clear canvas event
    socket.on('clearCanvas', (roomId) => {
        if (roomId && roomManager.roomExists(roomId)) {
            drawingState.clearRoom(roomId);
            io.to(roomId).emit('clearCanvas');
        }
    });

    // Handle toggle eraser event
    socket.on('toggleEraser', ({ roomId, erasing }) => {
        if (roomId && roomManager.roomExists(roomId)) {
            drawingState.setEraserState(roomId, erasing);
            socket.to(roomId).emit('toggleEraser', erasing);
        }
    });

    // Handle update brush settings event
    socket.on('updateBrushSettings', ({ roomId, settings }) => {
        if (roomId && roomManager.roomExists(roomId)) {
            drawingState.updateBrushSettings(roomId, settings);
            socket.to(roomId).emit('updateBrushSettings', settings);
        }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

// Start server
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

