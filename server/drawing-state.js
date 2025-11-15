// Canvas state management
class DrawingState {
    constructor() {
        // Store drawing state per room
        this.roomStates = new Map();
    }

    // Initialize state for a room
    initializeRoom(roomId) {
        if (!this.roomStates.has(roomId)) {
            this.roomStates.set(roomId, {
                drawings: [],
                brushSettings: {
                    color: '#000000',
                    opacity: 1,
                    thickness: 5,
                    penStyle: 'solid',
                    brushStyle: 'pen'
                },
                erasing: false
            });
        }
    }

    // Add a drawing to room state
    addDrawing(roomId, drawingData) {
        this.initializeRoom(roomId);
        const state = this.roomStates.get(roomId);
        state.drawings.push(drawingData);
    }

    // Get all drawings for a room
    getDrawings(roomId) {
        if (this.roomStates.has(roomId)) {
            return this.roomStates.get(roomId).drawings;
        }
        return [];
    }

    // Update brush settings for a room
    updateBrushSettings(roomId, settings) {
        this.initializeRoom(roomId);
        const state = this.roomStates.get(roomId);
        state.brushSettings = { ...state.brushSettings, ...settings };
    }

    // Get brush settings for a room
    getBrushSettings(roomId) {
        if (this.roomStates.has(roomId)) {
            return this.roomStates.get(roomId).brushSettings;
        }
        return {
            color: '#000000',
            opacity: 1,
            thickness: 5,
            penStyle: 'solid',
            brushStyle: 'pen'
        };
    }

    // Clear all drawings for a room
    clearRoom(roomId) {
        if (this.roomStates.has(roomId)) {
            const state = this.roomStates.get(roomId);
            state.drawings = [];
        }
    }

    // Remove room state
    removeRoom(roomId) {
        this.roomStates.delete(roomId);
    }

    // Update eraser state
    setEraserState(roomId, erasing) {
        this.initializeRoom(roomId);
        const state = this.roomStates.get(roomId);
        state.erasing = erasing;
    }

    // Get eraser state
    getEraserState(roomId) {
        if (this.roomStates.has(roomId)) {
            return this.roomStates.get(roomId).erasing;
        }
        return false;
    }
}

module.exports = new DrawingState();

