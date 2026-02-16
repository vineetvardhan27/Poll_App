# Quick Start Guide - Polling App

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have:
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** - Either:
  - Local installation - [Download](https://www.mongodb.com/try/download/community)
  - OR MongoDB Atlas account (free tier) - [Sign up](https://www.mongodb.com/cloud/atlas/register)

---

## 📥 Installation

### Step 1: Install Dependencies

```bash
# Navigate to project root
cd polling-app

# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies  
cd ../client
npm install

# Go back to root
cd ..
```

**OR use the shortcut:**

```bash
cd polling-app
npm run install-all
```

---

## ⚙️ Configuration

### MongoDB Setup

**Option A: Local MongoDB**

1. Start MongoDB service:
   ```bash
   # Windows
   mongod

   # Linux/Mac
   sudo systemctl start mongod
   ```

2. The `.env` file in `server/` is already configured for local:
   ```env
   MONGODB_URI=mongodb://localhost:27017/polling-app
   ```

**Option B: MongoDB Atlas (Cloud)**

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Get your connection string
3. Update `server/.env`:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/polling-app
   ```

---

## 🏃 Running the Application

### Method 1: Run Both Servers Concurrently (Recommended)

```bash
# From project root
cd polling-app
npm run dev
```

This starts both backend and frontend simultaneously!

### Method 2: Run Separately

**Terminal 1 - Backend:**
```bash
cd polling-app/server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd polling-app/client
npm run dev
```

---

## 🌐 Access the Application

Once running, open your browser:

- **Frontend (React)**: http://localhost:5173
- **Backend API**: http://localhost:5000

---

## 🎯 Testing the App

### Test 1: Create a Poll

1. Go to http://localhost:5173
2. Enter a question: "What's your favorite programming language?"
3. Add options: "JavaScript", "Python", "Java", "C++"
4. Click **"Create Poll"**
5. A success modal appears with your shareable link!

### Test 2: Vote on a Poll

1. Click **"View Poll"** from the success modal
2. Select an option
3. Click **"Submit Vote"**
4. See results display with percentages!

### Test 3: Real-Time Updates ⚡

1. Copy the poll link from the share section
2. Open the link in **two different browser windows** (side by side)
3. Vote in one window
4. **Watch the other window update instantly!** 🎉

No page refresh needed!

### Test 4: Anti-Abuse Mechanisms

1. Try voting again in the same browser → **Blocked** ❌
2. Open an incognito window with the same link → **Also Blocked** (IP tracking) ❌
3. Open on your phone (different network) → **Allowed** ✅

---

## 🛠️ Development Commands

### Server Commands

```bash
cd server

# Start with auto-reload
npm run dev

# Start production mode
npm start
```

### Client Commands

```bash
cd client

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🎨 Features to Try

### Poll Creation Page (/)
- ✅ Add/remove options dynamically (2-10 options)
- ✅ Character counter for question (500 max)
- ✅ Beautiful Tailwind CSS dark theme
- ✅ Success modal with shareable link
- ✅ One-click copy to clipboard

### Poll View Page (/poll/:id)
- ✅ Real-time vote updates
- ✅ Animated progress bars
- ✅ Winner highlighting (green border)
- ✅ Vote count display
- ✅ Share link with copy button
- ✅ Loading & error states
- ✅ Mobile responsive

---

## 🐛 Troubleshooting

### MongoDB Connection Error

**Error**: `MongooseServerSelectionError`

**Solution**:
1. Check MongoDB is running: `mongod --version`
2. Verify connection string in `server/.env`
3. For Atlas: Check IP whitelist (add 0.0.0.0/0 for testing)

### Port Already in Use

**Error**: `Port 5000 is already in use`

**Solution**:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

### Tailwind CSS Not Working

**Solution**:
```bash
cd client
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Real-Time Updates Not Working

**Check**:
1. Server logs show "Socket.IO enabled"
2. Browser console shows "Socket connected: xxxxx"
3. Network tab shows WebSocket connection (green)

---

## 📊 Test Data

### Sample Polls to Create:

**Tech Poll:**
```
Question: What's your favorite tech stack?
Options: MERN, MEAN, Django, Laravel, Ruby on Rails
```

**Food Poll:**
```
Question: Best pizza topping?
Options: Pepperoni, Mushrooms, Olives, Pineapple 🍍
```

**Quick Poll:**
```
Question: Tabs or Spaces?
Options: Tabs, Spaces
```

---

## 📁 Project Structure

```
polling-app/
├── client/                 # React frontend (Tailwind CSS)
│   ├── src/
│   │   ├── pages/         # CreatePoll, PollView
│   │   ├── services/      # API, Socket.IO
│   │   ├── utils/         # Fingerprint, helpers
│   │   └── ...
│   └── package.json
├── server/                # Express backend
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API endpoints
│   ├── middleware/       # Rate limiting, IP tracking
│   └── server.js
└── package.json
```

---

## 🎯 Next Steps

1. ✅ Test poll creation
2. ✅ Test real-time voting
3. ✅ Test anti-abuse (try voting twice)
4. ✅ Test on mobile device
5. 📤 Deploy to production (Phase 4)

---

## 🚀 Ready for Deployment

When you're ready to deploy:
- **Frontend**: Vercel, Netlify
- **Backend**: Railway, Render, Heroku
- **Database**: MongoDB Atlas

See deployment guide in Phase 4!

---

## 💡 Tips

- Use **Chrome DevTools** to see Socket.IO events in Network tab
- Check **MongoDB Compass** to view database records
- Open **2+ browser windows** to see real-time magic ✨
- Try different screen sizes to test responsive design

---

**Happy Polling! 🎉**

Need help? Check the documentation in the repo!
