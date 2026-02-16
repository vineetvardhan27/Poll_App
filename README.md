# Polling App - Real-time Voting Application

A MERN stack application that allows users to create polls, share them via links, and view real-time voting results.

## 📋 Project Structure

```
polling-app/
├── client/              # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── App.css
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── server/              # Node.js + Express backend
│   ├── server.js
│   ├── .env
│   └── package.json
└── package.json         # Root package.json
```

## 🚀 Installation Commands

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Step 1: Install Root Dependencies
```bash
cd polling-app
npm install
```

### Step 2: Install Server Dependencies
```bash
cd server
npm install
```

**Server Dependencies:**
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `socket.io` - Real-time communication
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variables
- `nodemon` (dev) - Auto-restart server

### Step 3: Install Client Dependencies
```bash
cd client
npm install
```

**Client Dependencies:**
- `react` - UI library
- `react-dom` - React DOM renderer
- `react-router-dom` - Routing
- `axios` - HTTP client
- `socket.io-client` - Real-time client
- `vite` (dev) - Build tool
- `@vitejs/plugin-react` (dev) - Vite React plugin

### Step 4: Or Install All at Once
From the root directory:
```bash
npm run install-all
```

## 🔧 Configuration

### Server Configuration (.env)
Create or update `server/.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/polling-app
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

**For MongoDB Atlas:**
Replace `MONGODB_URI` with your Atlas connection string:
```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/polling-app
```

## 🏃 Running the Application

### Development Mode

**Option 1: Run Both (Concurrent)**
```bash
npm run dev
```

**Option 2: Run Separately**

Terminal 1 - Server:
```bash
npm run dev-server
```

Terminal 2 - Client:
```bash
npm run dev-client
```

### Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## 🛡️ Fairness/Anti-Abuse Mechanisms

### 1. **Browser-based Voting Lock (LocalStorage/Cookies)**
- **What it prevents**: Multiple votes from the same browser
- **How it works**: Stores voted poll IDs in browser's localStorage
- **Limitations**: Can be bypassed by clearing browser data or using incognito mode

### 2. **IP Address Rate Limiting**
- **What it prevents**: Spam voting from the same network/IP
- **How it works**: Tracks voting requests by IP address with time-based throttling
- **Limitations**: Multiple users behind NAT share the same public IP; VPNs can bypass

## 📦 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router, Socket.IO Client
- **Backend**: Node.js, Express, Socket.IO
- **Database**: MongoDB with Mongoose
- **Real-time**: Socket.IO
- **Styling**: Tailwind CSS with custom dark theme

## 🎯 Features Implemented

### Backend (Phase 2)
- ✅ MongoDB schema with validation
- ✅ RESTful API endpoints (create, get polls)
- ✅ Socket.IO real-time communication
- ✅ IP address tracking
- ✅ Browser fingerprinting support
- ✅ Rate limiting middleware

### Frontend (Phase 3)
- ✅ React with Vite
- ✅ Poll creation interface
- ✅ Interactive voting UI
- ✅ Real-time results display
- ✅ Browser fingerprinting
- ✅ LocalStorage vote tracking
- ✅ Copy-to-clipboard share links
- ✅ Responsive design
- ✅ Error handling & loading states

## ✅ Implementation Status

- ✅ Poll model (MongoDB schema with anti-abuse)
- ✅ Poll creation API
- ✅ Voting interface with real-time updates
- ✅ Socket.IO real-time events
- ✅ Browser fingerprinting
- ✅ IP tracking
- ⬜ Deploy to production (Phase 4)

## 🔗 Deployment (Coming Soon)

- Frontend: Vercel/Netlify
- Backend: Railway/Render
- Database: MongoDB Atlas

---

Created as part of a technical assessment
