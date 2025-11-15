// WebSocket client
export class WebSocketClient {
    constructor(roomId, canvasManager, settings) {
        this.roomId = roomId;
        this.canvasManager = canvasManager;
        this.settings = settings;
        this.socket = io();
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.socket.on('connect', () => {
            console.log('Connected to server socket');

            if (this.roomId) {
                this.socket.emit('joinRoom', { roomId: this.roomId });
                console.log(`Joined room: ${this.roomId}`);
            }
        });

        this.socket.on('roomNotFound', (roomId) => {
            alert(`Room with ID: ${roomId} not found`);
            window.location.href = '/';
        });

        this.socket.on('drawing', (data) => {
            const { brushStyle, path, lineWidth, strokeStyle, globalAlpha } = data;

            switch (brushStyle) {
                case 'pen':
                    this.canvasManager.drawPen(path, lineWidth, strokeStyle, globalAlpha);
                    break;
                case 'highlighter':
                    this.canvasManager.drawHighlighter(path, lineWidth, strokeStyle);
                    break;
                case 'spray':
                    this.canvasManager.drawSpray(path, lineWidth, strokeStyle);
                    break;
                case 'shiny':
                    this.canvasManager.drawShiny(path, lineWidth, strokeStyle);
                    break;
            }
        });

        this.socket.on('clearCanvas', () => {
            this.canvasManager.clearCanvas();
        });

        this.socket.on('toggleEraser', (erasingState) => {
            this.settings.setErasing(erasingState);
        });

        this.socket.on('updateBrushSettings', (settings) => {
            this.settings.updateFromRemote(settings);
        });
    }

    emitDrawing(path) {
        const settings = this.settings.getSettings();
        this.socket.emit('drawing', {
            lineWidth: settings.thickness,
            strokeStyle: settings.color,
            globalAlpha: settings.opacity,
            globalCompositeOperation: 'source-over',
            brushStyle: settings.brushStyle,
            path: path,
            roomId: this.roomId
        });
    }

    emitClearCanvas() {
        this.socket.emit('clearCanvas', this.roomId);
    }

    emitToggleEraser(erasing) {
        this.socket.emit('toggleEraser', { roomId: this.roomId, erasing });
    }

    emitUpdateBrushSettings() {
        const settings = this.settings.getSettings();
        this.socket.emit('updateBrushSettings', { 
            roomId: this.roomId, 
            settings: {
                color: settings.color,
                opacity: settings.opacity,
                thickness: settings.thickness,
                penStyle: settings.penStyle,
                brushStyle: settings.brushStyle
            }
        });
    }
}

