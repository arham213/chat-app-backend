# chat-app-backend

Node.js + Express backend for the real-time chat system. Manages WebSocket connections via Socket.IO, persists messages and user data in MongoDB, and handles JWT-based authentication.

**Frontend:** [chat-app-frontend](https://github.com/arham213/chat-app-frontend) | **Live:** [chat-app-frontend-beta-three.vercel.app](https://chat-app-frontend-beta-three.vercel.app/)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express |
| Real-time | Socket.IO |
| Database | MongoDB, Mongoose |
| Auth | JWT |
| Deployment | Railway |

---

## Local Setup

```bash
git clone https://github.com/arham213/chat-app-backend.git
cd chat-app-backend
npm install
```

### Environment Variables

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

---

[linkedin.com/in/arhamasjid](https://linkedin.com/in/arhamasjid) · arhamasjid213@gmail.com
