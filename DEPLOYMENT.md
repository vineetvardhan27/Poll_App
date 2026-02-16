# Deployment Guide: Real-time Polling App

This guide follows the industry-standard MERN stack deployment sequence: **Database → Backend → Frontend**.

## Prerequisites

✅ GitHub account  
✅ Render account (for backend) - [dashboard.render.com](https://dashboard.render.com)  
✅ Vercel account (for frontend) - [vercel.com](https://vercel.com)  
✅ MongoDB Atlas account (for database) - [cloud.mongodb.com](https://cloud.mongodb.com)

---

## Phase 1: Database Setup (MongoDB Atlas)

### Step 1: Create MongoDB Cluster

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) and log in
2. Click **"Build a Database"**
3. Choose **FREE** tier (M0 Sandbox)
4. Select **Region**: Singapore or Frankfurt (closest to your users)
5. Click **"Create"**

### Step 2: Create Database User

1. Go to **Database Access** (left sidebar)
2. Click **"Add New Database User"**
3. Choose **Password** authentication
4. Username: `pollapp` (or your choice)
5. Password: Generate a strong password and **save it**
6. Set privileges to **Read and write to any database**
7. Click **"Add User"**

### Step 3: Whitelist IP Addresses

1. Go to **Network Access** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Click **"Confirm"**

### Step 4: Get Connection String

1. Go to **Database** → **Connect**
2. Choose **"Connect your application"**
3. Copy the connection string (looks like):
   ```
   mongodb+srv://pollapp:<password>@cluster0.xxxxx.mongodb.net/
   ```
4. Replace `<password>` with your actual password
5. Add database name at the end: `?retryWrites=true&w=majority`
6. **Save this** - you'll need it for Render

---

## Phase 2: Deploy Backend to Render

### Step 1: Prepare Code (Already Done ✅)

Your code is already production-ready with:
- ✅ Dynamic port: `process.env.PORT || 5000`
- ✅ Trust proxy: `app.set('trust proxy', true)`
- ✅ CORS configuration: Uses `CLIENT_URL` environment variable
- ✅ MongoDB reconnection logic

### Step 2: Push to GitHub (Already Done ✅)

Your code is already pushed to: https://github.com/vineetvardhan27/Poll_App

### Step 3: Deploy on Render

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Click **"Connect a repository"** → Select **Poll_App**

### Step 4: Configure Service

**Basic Settings:**
- **Name**: `polling-app-backend`
- **Region**: Singapore or Frankfurt
- **Branch**: `main`
- **Root Directory**: `server` ⚠️ **Critical!**
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `node server.js`

**Environment Variables:**
Click **"Advanced"** → **"Add Environment Variable"**

| Key | Value |
|-----|-------|
| `MONGODB_URI` | Your MongoDB Atlas connection string from Phase 1 |
| `PORT` | `10000` (Render's default) |
| `NODE_ENV` | `production` |
| `CLIENT_URL` | `*` (we'll update this after frontend deployment) |

### Step 5: Deploy

1. Click **"Create Web Service"**
2. Wait 2-5 minutes for deployment
3. Watch the logs for "MongoDB connected successfully"
4. **Copy the URL** at the top (e.g., `https://polling-app-backend.onrender.com`)

⚠️ **Important**: Free tier on Render spins down after inactivity. First request may take 30-60 seconds.

### Step 6: Test Backend

Open in browser: `https://polling-app-backend.onrender.com`

You should see:
```json
{
  "message": "Polling App API",
  "status": "running",
  "endpoints": {
    "createPoll": "POST /api/polls",
    "getPoll": "GET /api/polls/:id",
    "getAllPolls": "GET /api/polls"
  }
}
```

---

## Phase 3: Deploy Frontend to Vercel

### Step 1: Create Environment Variables Locally

1. Navigate to `client` folder
2. Copy `.env.example` to `.env`:
   ```bash
   cd client
   cp .env.example .env
   ```
3. Edit `.env` and add your Render backend URL:
   ```env
   VITE_API_URL=https://polling-app-backend.onrender.com/api
   VITE_SOCKET_URL=https://polling-app-backend.onrender.com
   ```

### Step 2: Test Locally (Optional)

```bash
npm run dev
```

Create a poll and verify it works with the live backend.

### Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and log in with GitHub
2. Click **"Add New..."** → **"Project"**
3. Select **Poll_App** repository
4. Click **"Import"**

### Step 4: Configure Project

**Framework Preset**: Vite (should auto-detect)

**Root Directory**: 
- Click **"Edit"** next to Root Directory
- Select **`client`** folder ⚠️ **Critical!**

**Build and Output Settings**:
- Keep defaults (Vite handles this automatically)

**Environment Variables**:
Click **"Environment Variables"** and add:

| Name | Value |
|------|-------|
| `VITE_API_URL` | `https://polling-app-backend.onrender.com/api` |
| `VITE_SOCKET_URL` | `https://polling-app-backend.onrender.com` |

⚠️ **No trailing slash** in URLs!

### Step 5: Deploy

1. Click **"Deploy"**
2. Wait 1-2 minutes
3. **Copy the URL** (e.g., `https://polling-app-vineet.vercel.app`)

---

## Phase 4: The Final Handshake (Link Backend ↔ Frontend)

Now both are live, but we need to secure CORS properly.

### Step 1: Update Backend CORS

1. Go back to **Render Dashboard** → Your service
2. Click **"Environment"** (left sidebar)
3. Find `CLIENT_URL` variable
4. **Update value** to your Vercel URL:
   ```
   https://polling-app-vineet.vercel.app
   ```
5. Click **"Save Changes"**
6. Service will automatically redeploy (30-60 seconds)

### Step 2: Verify Deployment

Wait for Render to redeploy, then test:

---

## Testing Checklist

### ✅ Basic Functionality

1. **Visit Vercel URL**: Does the page load?
2. **Create Poll**: 
   - Click "Create Poll"
   - Add question and options
   - Submit
   - Does success modal appear with shareable link?
3. **Copy Link**: Click "Copy Link" button

### ✅ Real-time Voting

1. **Open two browser windows**:
   - Window 1: Your normal browser (e.g., Chrome)
   - Window 2: Incognito/Private window
2. **In Window 1**: Paste the poll link → Vote
3. **In Window 2**: Paste the poll link
4. **Verify**: Does vote count update instantly in Window 2?

### ✅ Anti-Abuse Mechanisms

1. **Try voting twice** from same browser → Should show error
2. **Refresh page** → Vote count persists
3. **Vote from different device** (mobile) → Works correctly

### ✅ Performance

1. **Check Render logs**: No errors about MongoDB disconnections
2. **First load**: May take 30-60 seconds (free tier spin-up)
3. **Subsequent loads**: Should be fast

---

## Troubleshooting

### Backend Issues

**Error: "MongoDB connection error"**
- Check `MONGODB_URI` has correct password
- Verify IP whitelist in MongoDB Atlas (should be 0.0.0.0/0)

**Error: "Cannot GET /"**
- Check Root Directory is set to `server` in Render

**Error: 502 Bad Gateway**
- Backend is starting (wait 60 seconds on free tier)
- Check Render logs for errors

### Frontend Issues

**Error: "Network Error" or "CORS error"**
- Verify `VITE_API_URL` is correct (no trailing slash)
- Check `CLIENT_URL` in Render matches your Vercel URL exactly

**Poll doesn't create**
- Open browser DevTools → Network tab
- Check if API requests are going to correct URL
- Verify backend is responding (visit backend URL directly)

**Real-time updates not working**
- Check `VITE_SOCKET_URL` environment variable
- Verify Socket.IO connection in browser Console
- Ensure backend is using same URL for both HTTP and WebSocket

### MongoDB Issues

**Error: "Authentication failed"**
- Password in connection string may have special characters
- URL-encode special characters (e.g., `@` → `%40`)

---

## Post-Deployment

### Custom Domain (Optional)

**Vercel**:
1. Go to Project → Settings → Domains
2. Add your domain (e.g., `poll.yourdomain.com`)
3. Update `CLIENT_URL` in Render to match new domain

**Render**:
1. Go to Settings → Custom Domain
2. Add your domain (e.g., `api.yourdomain.com`)
3. Update `VITE_API_URL` in Vercel

### Monitoring

**Render**:
- Check logs regularly: Dashboard → Logs
- Monitor memory/CPU usage
- Free tier: 512MB RAM, 0.1 CPU

**Vercel**:
- Analytics available in dashboard
- Check function logs for errors

### Scaling (Future)

When you outgrow free tier:
- **Render**: Upgrade to $7/month for always-on service
- **Vercel**: Pro plan for more bandwidth
- **MongoDB Atlas**: M10 tier for production workload

---

## Environment Variables Summary

### Server (.env)
```env
PORT=10000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/polling?retryWrites=true&w=majority
NODE_ENV=production
CLIENT_URL=https://polling-app-vineet.vercel.app
```

### Client (.env)
```env
VITE_API_URL=https://polling-app-backend.onrender.com/api
VITE_SOCKET_URL=https://polling-app-backend.onrender.com
```

---

## Security Checklist

✅ `.env` files in `.gitignore` (not pushed to GitHub)  
✅ MongoDB Atlas IP whitelist configured  
✅ CORS restricted to specific frontend URL  
✅ Trust proxy enabled for accurate IP tracking  
✅ Input validation on all API endpoints  
✅ Atomic database operations to prevent race conditions  

---

## Deployment Complete! 🎉

Your app is now live:
- **Frontend**: https://polling-app-vineet.vercel.app
- **Backend**: https://polling-app-backend.onrender.com
- **Database**: MongoDB Atlas

Share your poll app with the world! 🚀

---

## Need Help?

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas**: https://docs.atlas.mongodb.com

---

**Last Updated**: February 2026
