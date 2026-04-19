# chat-app-backend

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white&style=flat-square)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white&style=flat-square)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4-010101?logo=socket.io&logoColor=white&style=flat-square)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white&style=flat-square)
![Deployed on Railway](https://img.shields.io/badge/Deployed-Railway-0B0D0E?logo=railway&logoColor=white&style=flat-square)

Node.js + Express backend for the real-time chat system. Manages WebSocket connections via Socket.IO, persists messages and user data in MongoDB, and handles JWT-based authentication.

**Live:** [chat-app-backend-dummy.up.railway.app](https://chat-app-backend-dummy.up.railway.app) &nbsp;|&nbsp; **Frontend:** [chat-app-frontend](https://github.com/arham213/chat-app-frontend)

---

## Features

- JWT-based authentication (register and login)
- Real-time bidirectional messaging via Socket.IO
- Typing indicators and read receipts
- Online presence detection and last-seen tracking
- In-chat image sharing via Vercel Blob
- One-to-one chat creation with duplicate prevention
- Paginated message history
- Authenticated Socket.IO connections

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express |
| Real-time | Socket.IO |
| Database | MongoDB, Mongoose |
| Auth | JWT |
| File Storage | Vercel Blob |
| Deployment | Railway |

---

## Local Setup

### Prerequisites
- Node.js 18+
- MongoDB running locally or a [MongoDB Atlas](https://www.mongodb.com/atlas) connection string

```bash
git clone https://github.com/arham213/chat-app-backend.git
cd chat-app-backend
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
FRONTEND_URL=your_frontend_url
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

```bash
npm run dev   # development (nodemon)
npm start     # production
```

See the [frontend README](https://github.com/arham213/chat-app-frontend#readme) for full frontend setup instructions.

---

## Author

[LinkedIn](https://linkedin.com/in/arhamasjid) · arhamasjid213@gmail.com
