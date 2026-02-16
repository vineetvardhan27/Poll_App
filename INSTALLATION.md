# Installation Commands - Quick Reference

## 📦 Complete Installation Guide

### Method 1: Install Everything at Once (Recommended)

```bash
# Navigate to project root
cd polling-app

# Install root dependencies
npm install

# Install all dependencies (root + server + client)
npm run install-all
```

---

### Method 2: Install Step by Step

#### Step 1: Root Dependencies
```bash
cd polling-app
npm install
```

#### Step 2: Server Dependencies
```bash
cd server
npm install
```

**Packages installed:**
- express ^4.18.2
- mongoose ^8.0.3
- socket.io ^4.6.1
- cors ^2.8.5
- dotenv ^16.3.1
- nodemon ^3.0.2 (dev)

#### Step 3: Client Dependencies
```bash
cd client
npm install
```

**Packages installed:**
- react ^18.2.0
- react-dom ^18.2.0
- axios ^1.6.2
- socket.io-client ^4.6.1
- react-router-dom ^6.20.1
- vite ^5.0.8 (dev)
- @vitejs/plugin-react ^4.2.1 (dev)
- tailwindcss ^3.4.0 (dev)
- autoprefixer ^10.4.16 (dev)
- postcss ^8.4.32 (dev)

---

## 🏃 Running the Application

### Run Both Client & Server Concurrently
```bash
# From root folder
npm run dev
```

### Run Server Only
```bash
# From root folder
npm run dev-server

# OR from server folder
cd server
npm run dev
```

### Run Client Only
```bash
# From root folder
npm run dev-client

# OR from client folder
cd client
npm run dev
```

---

## 🔧 Environment Setup

### Configure MongoDB
Edit `server/.env`:
```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017/polling-app
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### For MongoDB Atlas (Cloud)
```bash
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/polling-app
```

---

## ✅ Verify Installation

### Check if dependencies are installed:

**Root:**
```bash
cd polling-app
npm list --depth=0
```

**Server:**
```bash
cd server
npm list --depth=0
```

**Client:**
```bash
cd client
npm list --depth=0
```

---

## 🐛 Troubleshooting

### If npm install fails:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### If MongoDB connection fails:
- Make sure MongoDB is running locally, or
- Use MongoDB Atlas connection string
- Check firewall settings

---

## 📍 Access Points

After running `npm run dev`:

- **Client (Frontend)**: http://localhost:5173
- **Server (Backend)**: http://localhost:5000
- **API Test**: http://localhost:5000/ (should return: `{"message": "Polling App API"}`)
