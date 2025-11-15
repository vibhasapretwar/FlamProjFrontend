// Room management
const { v4: uuidv4 } = require('uuid');

class RoomManager {
    constructor() {
        this.activeRooms = new Set();
    }

    createRoom() {
        const roomId = uuidv4();
        this.activeRooms.add(roomId);
        return roomId;
    }

    joinRoom(roomId) {
        if (this.activeRooms.has(roomId)) {
            return true;
        }
        return false;
    }

    roomExists(roomId) {
        return this.activeRooms.has(roomId);
    }

    removeRoom(roomId) {
        this.activeRooms.delete(roomId);
    }

    getAllRooms() {
        return Array.from(this.activeRooms);
    }
}

module.exports = new RoomManager();

