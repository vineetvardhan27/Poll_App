# CORS Troubleshooting Guide

## Problem: Network Error / CORS Error

When you see this error in your Vercel frontend:
```
Access to XMLHttpRequest has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present...
```

---

## ✅ Solution (Already Fixed in Code!)

Your backend is now configured to accept requests from multiple origins:
- ✅ `http://localhost:5173` (development)
- ✅ `http://localhost:3000` (alternative dev port)
- ✅ Your Vercel URL (production - set via `CLIENT_URL` env variable)

---

## 📋 What You Need to Do:

### Step 1: Set CLIENT_URL on Render

1. Go to **Render Dashboard** → Your service
2. Click **"Environment"** (left sidebar)
3. Find or add `CLIENT_URL` variable
4. Set the value to your **exact Vercel URL**:
   ```
   https://your-project-name.vercel.app
   ```
   ⚠️ **No trailing slash!**
   ✅ Correct: `https://poll-app.vercel.app`
   ❌ Wrong: `https://poll-app.vercel.app/`

5. Click **"Save Changes"**
6. Wait 30-60 seconds for automatic redeploy

### Step 2: Push Updated Code to GitHub

```bash
cd "C:\Users\VINEET VARDHAN\Desktop\Project\polling-app"
git add .
git commit -m "Fix CORS for production deployment"
git push origin main
```

### Step 3: Manual Redeploy on Render (if needed)

1. Go to your Render service
2. Click **"Manual Deploy"** → **"Deploy latest commit"**
3. Wait for build to complete

---

## 🧪 How to Test:

### 1. Check CORS Headers

Open your browser console (F12) and run:
```javascript
fetch('https://your-backend.onrender.com/api/polls')
  .then(res => console.log('Success!', res))
  .catch(err => console.error('CORS Error:', err))
```

Replace with your actual Render URL.

### 2. Check Network Tab

1. Open your Vercel app
2. Press F12 → **Network** tab
3. Try creating a poll
4. Look for the API request
5. Check **Response Headers** for:
   ```
   access-control-allow-origin: https://your-vercel-url.vercel.app
   ```

---

## ⏰ Free Tier "Cold Start" Issue

### What happens:

When using **Render Free Tier**, your backend goes to sleep after 15 minutes of inactivity.

### Symptoms:

- First request takes 50-60 seconds
- Shows "Network Error" or loading spinner
- Works fine after first request

### Solution:

This is **NORMAL** on free tier. Just:
1. Wait 60 seconds on first load
2. Refresh the page
3. Should work perfectly

### Workaround:

To keep your backend awake, use a service like **UptimeRobot** (free):
1. Go to https://uptimerobot.com
2. Create monitor for your Render URL
3. Set interval to 5 minutes
4. Your backend will never sleep!

---

## 🔍 Verification Checklist

- [ ] `CLIENT_URL` set in Render environment variables
- [ ] Value is exact Vercel URL (no trailing slash)
- [ ] Code pushed to GitHub
- [ ] Render redeployed successfully
- [ ] Browser console shows no CORS errors
- [ ] Can create poll from Vercel frontend
- [ ] Real-time updates working

---

## 🐛 Still Not Working?

### Check 1: Environment Variables

**Render Dashboard** → **Environment**:
```
CLIENT_URL = https://your-exact-vercel-url.vercel.app
```

### Check 2: Vercel Environment Variables

**Vercel Dashboard** → **Settings** → **Environment Variables**:
```
VITE_API_URL = https://your-backend.onrender.com/api
VITE_SOCKET_URL = https://your-backend.onrender.com
```

### Check 3: URLs Match Exactly

- CLIENT_URL on Render = Your Vercel domain
- VITE_API_URL on Vercel = Your Render domain + `/api`
- VITE_SOCKET_URL on Vercel = Your Render domain (no `/api`)

### Check 4: Redeploy Both

Sometimes you need to redeploy both services:
1. Render: Manual Deploy → Deploy latest commit
2. Vercel: Deployments → Redeploy

---

## 📝 Updated Code Reference

Your `server.js` now has this CORS configuration:

```javascript
// Configure allowed origins (development + production)
const allowedOrigins = [
  "http://localhost:5173",                    // Local development
  "http://localhost:3000",                    // Alternative local port
  process.env.CLIENT_URL                       // Production Vercel URL
].filter(Boolean);

// Socket.IO with CORS
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Express CORS Middleware
app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST"],
  credentials: true
}));
```

This allows requests from:
- ✅ Localhost (development)
- ✅ Your Vercel URL (production via CLIENT_URL env var)

---

## ✅ Final Steps:

1. **Push code to GitHub**:
   ```bash
   git add .
   git commit -m "Fix CORS for production"
   git push origin main
   ```

2. **Set CLIENT_URL on Render** to your Vercel URL

3. **Wait for Render to redeploy** (automatic)

4. **Test your Vercel app**

5. **Wait 60 seconds on first load** (free tier cold start)

---

**Your app should now work perfectly!** 🎉
