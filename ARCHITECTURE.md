# Architecture Documentation

## Overview

The Collaborative Canvas application is a real-time drawing platform that allows multiple users to draw on a shared canvas simultaneously. The architecture follows a client-server model with WebSocket communication for real-time updates.

## Project Structure

```
collaborative-canvas/
├── client/                 # Client-side application
│   ├── index.html         # Main HTML file
│   ├── style.css          # Application styles
│   ├── canvas.js          # Canvas drawing logic
│   ├── websocket.js       # WebSocket client communication
│   └── main.js            # Application initialization
├── server/                # Server-side application
│   ├── server.js          # Express + WebSocket server
│   ├── rooms.js           # Room management logic
│   └── drawing-state.js   # Canvas state management
├── package.json           # Project dependencies
├── README.md              # Project documentation
└── ARCHITECTURE.md        # This file
```

## Client Architecture

### index.html
The main HTML file that provides the structure of the application. It includes:
- Canvas element for drawing
- Tool palette with controls (color, thickness, opacity, brush styles)
- Bootstrap CSS for styling

### style.css
Contains all the styling for the application, including:
- Layout styles for the canvas and tool palette
- Responsive design elements
- Animation styles

### canvas.js
**CanvasManager Class**: Handles all canvas-related operations
- Drawing operations (pen, highlighter, spray, shiny brushes)
- Mouse event handling
- Path management
- Canvas clearing
- Rendering received drawings from other users

**Key Methods:**
- `startPosition()`: Initiates drawing
- `draw()`: Handles drawing strokes
- `endPosition()`: Completes a drawing path
- `drawPen()`, `drawHighlighter()`, `drawSpray()`, `drawShiny()`: Render different brush types

### websocket.js
**WebSocketClient Class**: Manages WebSocket communication
- Connection management
- Event listeners for server messages
- Emitting drawing events to server
- Synchronizing brush settings across clients

**Key Methods:**
- `setupEventListeners()`: Sets up socket event handlers
- `emitDrawing()`: Sends drawing data to server
- `emitClearCanvas()`: Broadcasts canvas clear event
- `emitToggleEraser()`: Broadcasts eraser toggle
- `emitUpdateBrushSettings()`: Broadcasts brush setting changes

### main.js
Application entry point that:
- Initializes all components (CanvasManager, WebSocketClient, SettingsManager)
- Sets up event listeners for UI controls
- Coordinates between canvas, WebSocket, and settings managers
- Handles room ID from URL parameters

## Server Architecture

### server.js
Main server file that:
- Sets up Express HTTP server
- Initializes Socket.IO WebSocket server
- Serves static files from client directory
- Handles HTTP routes
- Manages Socket.IO connections and events

**Key Responsibilities:**
- HTTP request handling
- WebSocket connection management
- Event routing to appropriate handlers
- Integration with room and state management modules

### rooms.js
**RoomManager Class**: Manages collaborative rooms
- Room creation with unique IDs (UUID)
- Room joining/leaving
- Room existence validation
- Active room tracking

**Key Methods:**
- `createRoom()`: Creates a new room
- `joinRoom()`: Validates and allows joining a room
- `roomExists()`: Checks if a room exists
- `removeRoom()`: Removes a room from active list

### drawing-state.js
**DrawingState Class**: Manages canvas state per room
- Stores drawing history per room
- Manages brush settings per room
- Tracks eraser state
- Provides state synchronization for new users

**Key Methods:**
- `initializeRoom()`: Sets up state for a new room
- `addDrawing()`: Adds a drawing to room history
- `getDrawings()`: Retrieves all drawings for a room
- `updateBrushSettings()`: Updates brush settings
- `clearRoom()`: Clears all drawings for a room

## Communication Flow

### Drawing Flow
1. User draws on canvas → `CanvasManager.draw()` captures path
2. On mouse up → `WebSocketClient.emitDrawing()` sends path to server
3. Server receives → `drawingState.addDrawing()` stores state
4. Server broadcasts → All clients in room receive drawing event
5. Other clients → `CanvasManager.drawPen()` (or other brush method) renders the drawing

### Room Management Flow
1. User creates/joins room → Client emits `createRoom` or `joinRoom`
2. Server validates → `roomManager.createRoom()` or `roomManager.joinRoom()`
3. Server responds → Client receives `roomCreated` or `roomJoined`
4. New user joins → Server sends `roomState` with existing drawings

### State Synchronization
- When a user joins a room, the server sends the current room state
- Brush settings are synchronized across all clients in a room
- Canvas clear events are broadcast to all clients
- Eraser state is synchronized across clients

## Technologies

### Client-Side
- **Vanilla JavaScript (ES6 Modules)**: No framework dependencies
- **HTML5 Canvas API**: For drawing operations
- **Socket.IO Client**: For WebSocket communication
- **Bootstrap 4**: For UI styling

### Server-Side
- **Node.js**: Runtime environment
- **Express**: HTTP server framework
- **Socket.IO**: WebSocket server for real-time communication
- **UUID**: For generating unique room IDs

## Data Flow

### Drawing Data Structure
```javascript
{
    lineWidth: number,
    strokeStyle: string (color),
    globalAlpha: number,
    globalCompositeOperation: string,
    brushStyle: string ('pen' | 'highlighter' | 'spray' | 'shiny'),
    path: Array<{x: number, y: number}>,
    roomId: string
}
```

### Brush Settings Structure
```javascript
{
    color: string,
    opacity: number,
    thickness: number,
    penStyle: string ('solid' | 'dashed' | 'dotted'),
    brushStyle: string
}
```

## Scalability Considerations

### Current Limitations
- State is stored in memory (not persistent)
- No database integration
- No user authentication
- Single server instance

### Potential Improvements
- Add database persistence (MongoDB, PostgreSQL)
- Implement Redis for distributed state management
- Add user authentication and authorization
- Implement horizontal scaling with load balancing
- Add drawing history/undo functionality
- Implement room persistence across server restarts

## Security Considerations

### Current State
- No authentication required
- Room IDs are UUIDs (hard to guess but not secure)
- No rate limiting
- No input validation

### Recommended Improvements
- Implement user authentication
- Add rate limiting for WebSocket events
- Validate and sanitize all inputs
- Implement CORS properly for production
- Add HTTPS/WSS support
- Implement room access control

## Performance Optimizations

### Current Optimizations
- Path-based drawing (sends path arrays, not individual points)
- Client-side rendering (reduces server load)
- Efficient event broadcasting (only to room members)

### Potential Optimizations
- Implement drawing throttling/debouncing
- Add compression for large drawing paths
- Implement canvas layer caching
- Add WebGL rendering for better performance
- Implement delta compression for state updates

