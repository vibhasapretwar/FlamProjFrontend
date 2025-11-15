// App initialization
import { CanvasManager } from './canvas.js';
import { WebSocketClient } from './websocket.js';

// Settings manager
class SettingsManager {
    constructor() {
        this.color = '#000000';
        this.opacity = 1;
        this.thickness = 5;
        this.penStyle = 'solid';
        this.brushStyle = 'pen';
        this.erasing = false;
        this.initializeElements();
    }

    initializeElements() {
        this.colorInput = document.getElementById('color');
        this.opacityInput = document.getElementById('opacity');
        this.thicknessInput = document.getElementById('thickness');
        this.penStyleSelect = document.getElementById('penStyle');
        this.brushStyleSelect = document.getElementById('brushStyle');
        this.eraserButton = document.getElementById('eraserButton');
    }

    getSettings() {
        return {
            color: this.colorInput.value,
            opacity: parseFloat(this.opacityInput.value),
            thickness: parseInt(this.thicknessInput.value),
            penStyle: this.penStyleSelect.value,
            brushStyle: this.brushStyleSelect.value,
            erasing: this.erasing
        };
    }

    setErasing(erasing) {
        this.erasing = erasing;
        this.eraserButton.textContent = erasing ? 'Drawing' : 'Eraser';
    }

    updateFromRemote(settings) {
        this.colorInput.value = settings.color;
        this.opacityInput.value = settings.opacity;
        this.thicknessInput.value = settings.thickness;
        this.penStyleSelect.value = settings.penStyle;
        this.brushStyleSelect.value = settings.brushStyle;
    }
}

// Initialize app when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    
    // Get room ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('roomId');

    // Initialize managers
    const settings = new SettingsManager();
    const canvasManager = new CanvasManager(canvas, ctx, settings);
    const wsClient = new WebSocketClient(roomId, canvasManager, settings);

    // Drawing event handlers
    let currentPath = [];

    canvas.addEventListener('mousedown', (e) => {
        canvasManager.startPosition(e);
    });

    canvas.addEventListener('mouseup', () => {
        const path = canvasManager.endPosition();
        if (path.length > 0) {
            wsClient.emitDrawing(path);
        }
        currentPath = [];
    });

    canvas.addEventListener('mousemove', (e) => {
        canvasManager.draw(e);
    });

    // Tool button handlers
    settings.eraserButton.addEventListener('click', () => {
        settings.erasing = !settings.erasing;
        settings.setErasing(settings.erasing);
        wsClient.emitToggleEraser(settings.erasing);
    });

    const clearButton = document.getElementById('clearButton');
    clearButton.addEventListener('click', () => {
        canvasManager.clearCanvas();
        wsClient.emitClearCanvas();
    });

    // Settings change handlers
    settings.colorInput.addEventListener('change', () => {
        wsClient.emitUpdateBrushSettings();
    });

    settings.opacityInput.addEventListener('change', () => {
        wsClient.emitUpdateBrushSettings();
    });

    settings.thicknessInput.addEventListener('change', () => {
        wsClient.emitUpdateBrushSettings();
    });

    settings.penStyleSelect.addEventListener('change', () => {
        wsClient.emitUpdateBrushSettings();
    });

    settings.brushStyleSelect.addEventListener('change', () => {
        wsClient.emitUpdateBrushSettings();
    });
});

