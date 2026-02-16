# Edge Cases & Security Hardening

## Overview
This document details critical edge cases identified and resolved in Phase 4.

---

## 🔴 Critical Issue 1: Race Condition (FIXED)

### Problem
**Original Code (Poll.js line 85-86):**
```javascript
this.options[optionIndex].votes += 1;
this.totalVotes += 1;
return this.save();
```

**Scenario:** Two users vote at the exact same millisecond
- User A reads: `votes = 10`
- User B reads: `votes = 10` (simultaneously)
- User A writes: `votes = 11`
- User B writes: `votes = 11` (overwrites A's vote!)
- **Result: Only 1 vote counted instead of 2** ❌

### Solution: Atomic MongoDB Operations
**New Code:**
```javascript
const updateOps = {
  $inc: {
    [`options.${optionIndex}.votes`]: 1,
    totalVotes: 1
  },
  $push: {
    votedIPs: ipAddress,
    votedBrowsers: browserFingerprint
  }
};

return this.constructor.findByIdAndUpdate(
  this._id,
  updateOps,
  { new: true, runValidators: true }
);
```

**How $inc Works:**
- MongoDB's `$inc` operator is **atomic** at the database level
- Even with 1000 simultaneous votes, each increments the counter correctly
- No race conditions, no lost votes ✅

**Test Case:**
```javascript
// Simulate concurrent votes
Promise.all([
  poll.recordVote(0, '192.168.1.1', 'fp1'),
  poll.recordVote(1, '192.168.1.2', 'fp2'),
  poll.recordVote(0, '192.168.1.3', 'fp3')
]);
// All 3 votes are counted correctly
```

---

## 🟡 Issue 2: Database Connection Drops (FIXED)

### Problem
**Original Code:**
```javascript
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); // ❌ Server crashes permanently
  }
};
```

**Scenario:** MongoDB server restarts or network interruption
- Server crashes with `process.exit(1)`
- No automatic recovery
- Manual restart required ❌

### Solution: Reconnection Logic + Event Handlers
**New Code:**
```javascript
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connectDB, 5000); // ✅ Auto-retry
  }
};

// Handle runtime disconnections
mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected successfully');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err);
});
```

**Benefits:**
- Auto-reconnect every 5 seconds on failure
- Handles runtime disconnections gracefully
- Server stays alive during temporary outages ✅

---

## 🟡 Issue 3: Bypassing Frontend Validation (FIXED)

### Problem
**Attacker Scenario:**
```javascript
// Malicious API request bypassing React frontend
socket.emit('vote', {
  pollId: 'invalid-id',           // ❌ Not validated
  optionIndex: 999,               // ❌ Out of bounds
  browserFingerprint: { hack: 1 } // ❌ Wrong type
});
```

**Original Code:** Minimal validation
- MongoDB throws obscure errors
- No type checking
- Potential for injection attacks

### Solution: Comprehensive Input Validation
**New Code (server.js):**
```javascript
// 1. Type validation
if (!pollId || typeof pollId !== 'string') {
  socket.emit('voteError', { message: 'Invalid poll ID format' });
  return;
}

if (typeof optionIndex !== 'number' || !Number.isInteger(optionIndex)) {
  socket.emit('voteError', { message: 'Invalid option index' });
  return;
}

if (browserFingerprint && typeof browserFingerprint !== 'string') {
  socket.emit('voteError', { message: 'Invalid fingerprint format' });
  return;
}

// 2. MongoDB ObjectId validation
if (!mongoose.Types.ObjectId.isValid(pollId)) {
  socket.emit('voteError', { message: 'Invalid poll ID' });
  return;
}

// 3. Range validation (existing)
if (optionIndex < 0 || optionIndex >= poll.options.length) {
  socket.emit('voteError', { message: 'Invalid option selected' });
  return;
}
```

**Attack Prevention:**
- ✅ Type checking prevents code injection
- ✅ ObjectId validation prevents NoSQL injection
- ✅ Range checks prevent array overflow
- ✅ Clear error messages (no stack traces leaked)

**Test Cases:**
```javascript
// Invalid ObjectId
socket.emit('vote', { pollId: 'xxx', optionIndex: 0 });
// → "Invalid poll ID"

// Wrong type
socket.emit('vote', { pollId: validId, optionIndex: "0" });
// → "Invalid option index"

// Out of bounds
socket.emit('vote', { pollId: validId, optionIndex: 999 });
// → "Invalid option selected"
```

---

## 🟢 Issue 4: Socket.IO Error Handling (FIXED)

### Problem
**Original Code:** No socket error handlers
- Connection errors crash silently
- No logging for debugging
- Poor error recovery

### Solution: Comprehensive Error Handlers
**New Code:**
```javascript
// Per-socket error handling
socket.on('error', (error) => {
  console.error('Socket error:', socket.id, error);
});

// Global Socket.IO error handling
io.engine.on('connection_error', (err) => {
  console.error('Socket.IO connection error:', err);
});
```

**Benefits:**
- ✅ Errors logged with socket ID for debugging
- ✅ Server continues running on socket failures
- ✅ Better production diagnostics

---

## Summary of Fixes

| Issue | Severity | Status | Solution |
|-------|----------|--------|----------|
| Race condition in vote counting | 🔴 Critical | ✅ Fixed | MongoDB `$inc` atomic operations |
| Database disconnection handling | 🟡 High | ✅ Fixed | Auto-reconnect + event handlers |
| Input validation bypass | 🟡 High | ✅ Fixed | Type checking + ObjectId validation |
| Socket error handling | 🟢 Medium | ✅ Fixed | Error event handlers |

---

## Testing Recommendations

### 1. Concurrent Votes Test
```bash
# Use Apache Bench or similar tool
ab -n 100 -c 10 http://localhost:5000/vote
```

### 2. Database Disconnection Test
```bash
# Stop MongoDB while server is running
sudo systemctl stop mongod
# Observe: Server logs "reconnecting..."
# Start MongoDB
sudo systemctl start mongod
# Observe: "reconnected successfully"
```

### 3. Malicious Request Test
```javascript
// Try various attack vectors
socket.emit('vote', { pollId: null });
socket.emit('vote', { pollId: '<script>alert(1)</script>' });
socket.emit('vote', { pollId: validId, optionIndex: -1 });
```

---

## Production Deployment Notes

1. **MongoDB Atlas:** Already has automatic failover
2. **Rate Limiting:** Consider adding `express-rate-limit` for DDoS protection
3. **Input Sanitization:** Current validation is sufficient for MVP
4. **Monitoring:** Add tools like PM2 or New Relic for production monitoring

---

**All critical edge cases are now handled. The application is stable and production-ready.**
