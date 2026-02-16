# Quick Deployment Checklist

## 🎯 Overview
- **Backend**: Render (https://dashboard.render.com)
- **Frontend**: Vercel (https://vercel.com)
- **Database**: MongoDB Atlas (https://cloud.mongodb.com)

---

## Step 1️⃣: MongoDB Atlas Setup (5 min)

### 1.1 Create Cluster
- [ ] Go to https://cloud.mongodb.com
- [ ] Click "Build a Database" → Select FREE tier (M0)
- [ ] Region: **Singapore** or **Frankfurt**
- [ ] Click "Create"

### 1.2 Create User
- [ ] Go to "Database Access" → "Add New Database User"
- [ ] Username: `pollapp`
- [ ] Password: Generate and **SAVE IT**
- [ ] Privileges: "Read and write to any database"
- [ ] Click "Add User"

### 1.3 Network Access
- [ ] Go to "Network Access" → "Add IP Address"
- [ ] Click "Allow Access from Anywhere" (0.0.0.0/0)
- [ ] Click "Confirm"

### 1.4 Get Connection String
- [ ] Go to "Database" → "Connect" → "Connect your application"
- [ ] Copy connection string:
  ```
  mongodb+srv://pollapp:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
  ```
- [ ] **Replace `<password>` with your actual password**
- [ ] **SAVE THIS** - you'll need it for Render

✅ MongoDB Atlas Ready!

---

## Step 2️⃣: Deploy Backend to Render (10 min)

### 2.1 Login to Render
- [ ] Go to https://dashboard.render.com
- [ ] Login with GitHub

### 2.2 Create Web Service
- [ ] Click **"New +"** → **"Web Service"**
- [ ] Click **"Connect a repository"**
- [ ] Select your GitHub account → Find **"Poll_App"**
- [ ] Click **"Connect"**

### 2.3 Configure Service Settings

#### Basic Info:
```
Name: polling-app-backend
Region: Singapore (or Frankfurt)
Branch: main
```

#### Build Settings:
```
Root Directory: server
Runtime: Node
Build Command: npm install
Start Command: node server.js
```

#### Instance Type:
```
Instance Type: Free
```

### 2.4 Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add these 4 variables:

| Key | Value | Example |
|-----|-------|---------|
| `MONGODB_URI` | Your MongoDB connection string from Step 1.4 | `mongodb+srv://pollapp:YourPassword@cluster0.xxxxx.mongodb.net/` |
| `PORT` | `10000` | `10000` |
| `NODE_ENV` | `production` | `production` |
| `CLIENT_URL` | `*` | `*` (we'll update this later) |

⚠️ **Important**: 
- Make sure `MONGODB_URI` has your actual password (no `<password>` placeholder)
- Root Directory MUST be `server`

### 2.5 Deploy
- [ ] Click **"Create Web Service"**
- [ ] Wait 3-5 minutes
- [ ] Check logs for: ✅ "MongoDB connected successfully"
- [ ] **COPY YOUR BACKEND URL** from the top of the page
  ```
  Example: https://polling-app-backend-xxxx.onrender.com
  ```

### 2.6 Test Backend
- [ ] Open your backend URL in browser
- [ ] You should see:
  ```json
  {
    "message": "Polling App API",
    "status": "running"
  }
  ```

✅ Backend Deployed!

**Your Backend URL**: `https://polling-app-backend-xxxx.onrender.com`

---

## Step 3️⃣: Deploy Frontend to Vercel (5 min)

### 3.1 Login to Vercel
- [ ] Go to https://vercel.com
- [ ] Login with GitHub

### 3.2 Import Project
- [ ] Click **"Add New..."** → **"Project"**
- [ ] Find **"Poll_App"** repository
- [ ] Click **"Import"**

### 3.3 Configure Project Settings

#### Framework:
```
Framework Preset: Vite (should auto-detect)
```

#### Root Directory:
- [ ] Click **"Edit"** next to "Root Directory"
- [ ] Select **`client`** folder ⚠️ **CRITICAL**
- [ ] Click "Continue"

### 3.4 Environment Variables

Click **"Environment Variables"** and add these 2 variables:

| Name | Value |
|------|-------|
| `VITE_API_URL` | `https://your-backend.onrender.com/api` |
| `VITE_SOCKET_URL` | `https://your-backend.onrender.com` |

**Replace with YOUR actual Render URL from Step 2.5**

Example:
```
VITE_API_URL=https://polling-app-backend-xxxx.onrender.com/api
VITE_SOCKET_URL=https://polling-app-backend-xxxx.onrender.com
```

⚠️ **Important**: 
- No trailing slash at the end
- `/api` only in `VITE_API_URL`
- Root Directory MUST be `client`

### 3.5 Deploy
- [ ] Click **"Deploy"**
- [ ] Wait 1-2 minutes
- [ ] **COPY YOUR FRONTEND URL**
  ```
  Example: https://poll-app-xxxx.vercel.app
  ```

✅ Frontend Deployed!

**Your Frontend URL**: `https://poll-app-xxxx.vercel.app`

---

## Step 4️⃣: Link Backend ↔ Frontend (2 min)

### 4.1 Update Backend CORS
- [ ] Go back to **Render Dashboard** → Your service
- [ ] Click **"Environment"** (left sidebar)
- [ ] Find `CLIENT_URL` variable
- [ ] Click **"Edit"**
- [ ] **Change value from `*` to your Vercel URL**:
  ```
  https://poll-app-xxxx.vercel.app
  ```
- [ ] Click **"Save Changes"**
- [ ] Service will auto-redeploy (30-60 seconds)

### 4.2 Wait for Redeploy
- [ ] Watch the "Events" tab
- [ ] Wait for "Deploy live" status

✅ Everything Connected!

---

## Step 5️⃣: Testing (5 min)

### 5.1 Basic Test
- [ ] Open your **Vercel URL** in browser
- [ ] Page loads with "Create a Poll" button?

### 5.2 Create Poll Test
- [ ] Click "Create a Poll"
- [ ] Add question: "What's your favorite color?"
- [ ] Add options: "Red", "Blue", "Green"
- [ ] Click "Create Poll"
- [ ] Success modal appears with link?
- [ ] Click "Copy Link"

### 5.3 Real-time Test
- [ ] Open **TWO browser windows**:
  - Window 1: Normal browser
  - Window 2: Incognito/Private mode
- [ ] Paste poll link in both windows
- [ ] **In Window 1**: Vote for "Red"
- [ ] **In Window 2**: Does it update automatically? ✨

### 5.4 Anti-Abuse Test
- [ ] Try voting again in same browser
- [ ] Should show error: "You have already voted"

### 5.5 Persistence Test
- [ ] Refresh the page
- [ ] Vote count should remain ✅

---

## 🎉 Deployment Complete!

### Your Live URLs:
```
Frontend: https://poll-app-xxxx.vercel.app
Backend:  https://polling-app-backend-xxxx.onrender.com
Database: MongoDB Atlas (Cluster0)
```

---

## 📝 Configuration Summary

### Render (Backend):
```
Root Directory: server
Build Command: npm install
Start Command: node server.js

Environment Variables:
- MONGODB_URI = mongodb+srv://pollapp:password@cluster0.xxxxx.mongodb.net/
- PORT = 10000
- NODE_ENV = production
- CLIENT_URL = https://poll-app-xxxx.vercel.app
```

### Vercel (Frontend):
```
Root Directory: client
Framework: Vite

Environment Variables:
- VITE_API_URL = https://polling-app-backend-xxxx.onrender.com/api
- VITE_SOCKET_URL = https://polling-app-backend-xxxx.onrender.com
```

---

## ⚠️ Common Issues

### Issue: "Network Error" in frontend
**Fix**: Check `VITE_API_URL` has no trailing slash

### Issue: "CORS Error"
**Fix**: Update `CLIENT_URL` in Render to match exact Vercel URL

### Issue: Backend shows "Offline" on Render
**Fix**: Wait 30-60 seconds (free tier spins down when idle)

### Issue: "MongoDB connection error"
**Fix**: Check password in `MONGODB_URI` (no special characters issues)

---

## 🚀 Next Steps

1. Share your poll app with friends!
2. Monitor usage in Render/Vercel dashboards
3. Consider upgrading if you hit free tier limits:
   - Render Free: Spins down after 15 min inactivity
   - Vercel Free: 100GB bandwidth/month
   - MongoDB Atlas Free: 512MB storage

---

## 📞 Need Help?

- Full detailed guide: See `DEPLOYMENT.md` in your project
- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- MongoDB Docs: https://docs.atlas.mongodb.com

---

**Last Updated**: February 2026
**Made with ❤️ by Vineet**
