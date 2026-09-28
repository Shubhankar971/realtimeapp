# Real-Time Chat Application

A full-stack real-time chat application built with:

- React + Vite
- Node.js
- Express
- Socket.io
- MongoDB + Mongoose


The application supports persistent chat history, real-time messaging, timestamps, dummy username login, typing indicators, and online user count.

## 1. Features

### Required

- Clean responsive chat interface
- Send messages
- Receive messages instantly with Socket.io
- Persist messages in MongoDB
- Load previous messages after refresh
- Display message timestamps
- REST API for sending messages
- REST API for fetching chat history
- Socket.io connection/disconnection handling
- API and Socket error handling
- Meaningful project structure

### Bonus

- Username-based dummy authentication
- Typing indicator
- Online/offline status events
- Online user count
- MongoDB persistence
- Responsive mobile-friendly layout

## 2. Architecture

```text
React Client
   |
   | REST: GET /api/messages
   v
Express API ------------------> MongoDB
   ^
   |
   | Socket.io
   |
Socket.io Server
   |
   +----> Broadcast message:new to connected clients
```

There are two supported message paths:

1. REST `POST /api/messages`
2. Socket.io `message:send`

Both paths use the same message service and persist messages in MongoDB.

The frontend uses Socket.io for normal real-time chat delivery, while the REST GET endpoint restores chat history after a refresh.

## 3. Requirements

Install:

- Node.js 18+ recommended
- nm MongoDB local installation OR a MongoDB Atlas database

Check Node/npm:

```bash
node --version
npm --version
```

## 4. Project Setup

Clone the repository:

``
cd realtime-chat-app/backend/
https://github.com/Shubhankar971/realtimeapp/
```

The project has two applications:

```text
backend/
frontend/
```

### Backend

```bash
cd backend
npm install


Create an environment file:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
CopyItem .env.example .env
```

Configure:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/realtime_chat
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Start the backend:

```bash
npm run dev


Or:

```bash
npm start


Health check:

```text
http://localhost:5000/api/health


### Frontend

Open another terminal:

```bash
cd frontend
npm install


Create `.env`:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
CopyItem .env.example .env
```

Configure:

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

Start React:

```bash
npm run dev


Open the Vite URL shown in the terminal, normally:

```text
http://localhost:5173
```

## 5. REST API

### Health

```http
GET /api/health


Response:

```json
{
  "success": true,
  "message": "Chat API is running",
  "timestamp": "2026-01-01T00:00:00.000Z"
}
```

### Fetch messages

```http
GET /api/messages


Optional:

```http
GET /api/messages?limit=50
```

### Send message

```http
POST /api/messages
Content-Type: application/json
```

Body:

```json
{
  "username": "Shubhankar",
  "text": "Hello everyone!"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "username": "Shubhankar",
    "text": "Hello everyone!",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

The REST POST endpoint also emits `message:new` through Socket.io so connected clients immediately receive the message.

## 6. Socket.io Events

### Client -> Server

```text
user:join
message:send
typing:start
typing:stop
```

### Server -> Client

```text
connection:ready
message:new
message:error
users:count
typing:update
user:status
```

### Sending a message

```js
socket.emit(
  "message:send",
  { text: "Hello!" },
  (response) => {
    console.log(response);
  }
);
```

### Receiving a message

```js
socket.on("message:new", (message) => {
  console.log(message);
});
```

## 7. Design Decisions

### React instead of React Native

The assignment permits React or React Native. React web was selected because it provides a fast setup and allows the reviewer to test the application immediately in a browser.

### Socket.io

Socket.io is used as the mandatory real-time transport. The application does not depend on polling or Firebase for real-time messaging.

### MongoDB

MongoDB was selected because chat messages have a simple document structure and Mongoose provides schema validation and timestamps.

### Shared message service

Both REST and Socket.io message creation use the same `createMessage()` service. This avoids duplicating validation and database logic.

### Client-side history restoration

When the application loads, it calls:

```text
GET /api/messages


This ensures messages remain visible after a browser refresh.

### Dummy authentication

The username is stored in `localStorage`. This is intentionally not secure authentication; it satisfies the optional username-login requirement without introducing unnecessary authentication infrastructure.

## 8. Assumptions

- This is a single global chat room.
- Username authentication is intentionally dummy authentication.
- Messages are limited to 2,000 characters.
- Usernames are limited to 30 characters.
- The latest 100 messages are loaded by default.
- Up to 200 messages can be requested through the API.
- MongoDB is available locally or through MongoDB Atlas.
- No file/image attachments are required by the assignment.
- No production authentication or authorization is required.

## 9. Error Handling

The backend includes:

- Request validation
- Central Express error middleware
- 404 handling
- Socket acknowledgement errors
- Socket connection error handling
- MongoDB startup failure handling

The frontend displays connection, API, and message errors to the user.

## 10. Testing the Real-Time Feature

Open the application in two browser windows.

Example:

```text
Window A -> username: Alice
Window B -> username: Bob
```

Send a message from Alice.

The message should appear immediately in Bob's window without refreshing.

Test the following:

- Send message
- Refresh browser
- Confirm history remains
- Open two browser windows
- Confirm real-time delivery
- Start typing
- Confirm typing indicator
- Close one window
- Confirm online count changes
- Stop MongoDB
- Confirm appropriate connection/API errors

## 11. Production Environment Variables

Backend:

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
CLIENT_URL=https://your-frontend-domain.com
NODE_ENV=production
```

Frontend:

```env
VITE_API_URL=https://your-backend-domain.com
VITE_SOCKET_URL=https://your-backend-domain.com
```

For production, use HTTPS/WSS and restrict CORS to the actual frontend domain.

## 12. GitHub Setup

From the project root:

```bash
git init
git add .
git commit -m "Build real-time chat application"
```

Create a new empty repository on GitHub named:

```text
realtime-chat-app
```

Then:

```bash
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/realtime-chat-app.git
git push -u origin main
```

Important:

- Do NOT commit `.env`.
- `.env.example` should be committed.
- Never commit MongoDB passwords, API keys, or production credentials.

## 13. Suggested GitHub Repository Description

```text
Full-stack real-time chat application built with React, Node.js, Express, Socket.io and MongoDB. Includes persistent chat history, real-time messaging, typing indicators, timestamps and online status.
```

## 14. Suggested Submission Notes

```text
Implemented a real-time chat application using React, Node.js, Express, Socket.io and MongoDB.

Key requirements completed:
- Real-time messaging using Socket.io
- REST API for sending and fetching messages
- Persistent MongoDB chat history
- Message timestamps
- Connection/disconnection handling
- Responsive chat UI
- Error handling
- Clean folder architecture

Bonus features:
- Dummy username login
- Typing indicator
- Online user count
- Online/offline status events
```

## 15. Deployment

### Backend

The backend can be deployed to a Node.js-compatible platform such as Render or Railway.

Set:

```env
MONGODB_URI=...
CLIENT_URL=https://your-frontend-url.com
NODE_ENV=production
```

Use:

```bash
npm start
```

as the start command.

### Frontend

Build:

```bash
npm run build
```

Deploy the generated `dist` directory to a static hosting provider.

Configure:

```env
VITE_API_URL=https://your-backend-url.com
VITE_SOCKET_URL=https://your-backend-url.com
```

## 16. Final Checklist

- [x] React frontend
- [x] Node.js backend
- [x] Express REST APIs
- [x] Socket.io real-time communication
- [x] MongoDB persistence
- [x] Chat history after refresh
- [x] Message timestamps
- [x] Connection/disconnection handling
- [x] API error handling
- [x] Socket error handling
- [x] Clean folder structure
- [x] README
- [x] Environment examples
- [x] Dummy username login
- [x] Typing indicator
- [x] Online/offline status
- [x] GitHub instructions
