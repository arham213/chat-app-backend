# Chat System Backend - API Documentation

## Overview
A real-time chat system built with Node.js, Express, Socket.IO, and MongoDB. Supports user authentication, one-to-one chats, and real-time messaging.

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or remote connection)

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment variables:**
Create a `.env` file in the root directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chat-system
JWT_SECRET=your_jwt_secret_key_here_change_in_production
NODE_ENV=development
```

3. **Start MongoDB:**
Make sure MongoDB is running on your system.

4. **Run the server:**
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

---

## Postman Collection

A complete Postman collection is included for easy API testing!

### Quick Import
1. Open Postman
2. Click **Import** → Select `postman_collection.json`
3. All endpoints ready to test with automatic token management

### Features
- ✅ Auto-saves JWT tokens after login/register
- ✅ Auto-saves chat IDs when creating chats
- ✅ Pre-configured request bodies with sample data
- ✅ All authenticated endpoints use saved tokens

See [POSTMAN_GUIDE.md](POSTMAN_GUIDE.md) for detailed testing instructions.

---

## REST API Endpoints

### Authentication

#### Register User
- **POST** `/api/auth/register`
- **Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```
- **Response:**
```json
{
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

#### Login User
- **POST** `/api/auth/login`
- **Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
- **Response:**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "username": "johndoe",
    "email": "john@example.com",
    "online": true
  }
}
```

### Users

#### Get All Users
- **GET** `/api/users`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
```json
{
  "users": [
    {
      "_id": "user_id",
      "username": "janedoe",
      "email": "jane@example.com",
      "online": true,
      "lastSeen": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```

#### Get Current User Profile
- **GET** `/api/users/me`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
```json
{
  "user": {
    "_id": "user_id",
    "username": "johndoe",
    "email": "john@example.com",
    "online": true,
    "lastSeen": "2024-01-01T12:00:00.000Z"
  }
}
```

### Chats

#### Get All Chats
- **GET** `/api/chats`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
```json
{
  "chats": [
    {
      "_id": "chat_id",
      "participants": [
        {
          "_id": "user_id_1",
          "username": "johndoe",
          "online": true
        },
        {
          "_id": "user_id_2",
          "username": "janedoe",
          "online": false
        }
      ],
      "lastMessage": {
        "_id": "message_id",
        "content": "Hello!",
        "createdAt": "2024-01-01T12:00:00.000Z"
      },
      "updatedAt": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```

#### Create or Get Chat
- **POST** `/api/chats/create`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "participantId": "other_user_id"
}
```
- **Response:**
```json
{
  "message": "Chat created successfully",
  "chat": {
    "_id": "chat_id",
    "participants": [...],
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
}
```

#### Get Chat Messages
- **GET** `/api/chats/:chatId/messages?limit=50&skip=0`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
```json
{
  "messages": [
    {
      "_id": "message_id",
      "chat": "chat_id",
      "sender": {
        "_id": "user_id",
        "username": "johndoe"
      },
      "content": "Hello!",
      "read": false,
      "createdAt": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```

---

## Socket.IO Events

### Connection

Connect to Socket.IO with authentication:
```javascript
const socket = io('http://localhost:5000', {
  auth: {
    token: 'your_jwt_token_here'
  }
});
```

### Client → Server Events

#### Join Chat Room
```javascript
socket.emit('join_chat', chatId);
```

#### Send Message
```javascript
socket.emit('send_message', {
  chatId: 'chat_id',
  content: 'Hello, how are you?'
});
```

#### Typing Indicator
```javascript
socket.emit('typing', {
  chatId: 'chat_id',
  isTyping: true
});
```

#### Mark Messages as Read
```javascript
socket.emit('mark_read', {
  chatId: 'chat_id'
});
```

### Server → Client Events

#### New Message
```javascript
socket.on('new_message', (data) => {
  console.log('New message:', data.message);
  // data.message contains the full message object
});
```

#### Chat Updated
```javascript
socket.on('chat_updated', (data) => {
  console.log('Chat updated:', data.chatId, data.lastMessage);
});
```

#### User Typing
```javascript
socket.on('user_typing', (data) => {
  console.log(`${data.username} is typing:`, data.isTyping);
});
```

#### Messages Read
```javascript
socket.on('messages_read', (data) => {
  console.log('Messages read in chat:', data.chatId);
});
```

#### User Status
```javascript
socket.on('user_status', (data) => {
  console.log(`User ${data.userId} is ${data.online ? 'online' : 'offline'}`);
});
```

#### Error
```javascript
socket.on('error', (data) => {
  console.error('Socket error:', data.message);
});
```

---

## React Integration Example

Here's a basic example of how to integrate this backend with React:

```javascript
import { io } from 'socket.io-client';
import { useState, useEffect } from 'react';

function ChatApp() {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      // Connect to socket
      const newSocket = io('http://localhost:5000', {
        auth: { token }
      });

      setSocket(newSocket);

      // Listen for new messages
      newSocket.on('new_message', (data) => {
        setMessages(prev => [...prev, data.message]);
      });

      return () => newSocket.close();
    }
  }, [token]);

  const sendMessage = (chatId, content) => {
    socket.emit('send_message', { chatId, content });
  };

  // ... rest of your component
}
```

---

## Database Schema

### User
- `username`: String (unique, required)
- `email`: String (unique, required)
- `password`: String (hashed, required)
- `online`: Boolean
- `lastSeen`: Date

### Chat
- `participants`: Array of User IDs (exactly 2)
- `lastMessage`: Message ID reference
- `updatedAt`: Date

### Message
- `chat`: Chat ID reference
- `sender`: User ID reference
- `content`: String
- `read`: Boolean
- `createdAt`: Date

---

## Features

✅ User registration and authentication with JWT
✅ One-to-one chat creation (prevents duplicate chats)
✅ Real-time messaging with Socket.IO
✅ Message persistence in MongoDB
✅ Online/offline status tracking
✅ Typing indicators
✅ Read receipts
✅ Message history with pagination
✅ Secure authentication for Socket.IO connections

---

## Testing the API

You can test the API using tools like Postman or curl:

```bash
# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john","email":"john@test.com","password":"test123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"test123"}'

# Get users (replace TOKEN with actual token)
curl http://localhost:5000/api/users \
  -H "Authorization: Bearer TOKEN"
```

---

## Next Steps for React Frontend

1. Create login/register forms
2. Set up Socket.IO client connection
3. Build chat list component
4. Create message display and input components
5. Implement typing indicators
6. Add online status indicators
7. Handle read receipts

Good luck with your React practice! 🚀
