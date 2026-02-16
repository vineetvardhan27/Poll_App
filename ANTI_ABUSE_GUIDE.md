# Anti-Abuse Implementation Guide

## 🛡️ Fairness Mechanisms - Complete Implementation

This document explains how the two anti-abuse mechanisms are implemented to prevent repeat/fraudulent voting.

---

## Mechanism #1: IP Address Tracking

### How It Works:
Every vote is tracked by the client's IP address. Once an IP votes on a poll, it cannot vote again on the same poll.

### Implementation Location:
- **Model**: `server/models/Poll.js` - Lines 59-62
- **Vote Handler**: `server/server.js` - Lines 105-112
- **Data Storage**: `votedIPs` array in Poll schema

### Code Flow:

**1. Extract Client IP** (`server.js` lines 81-82)
```javascript
const clientIP = socket.handshake.headers['x-forwarded-for'] || 
                 socket.handshake.address;
```

**2. Check if IP Already Voted** (`server.js` lines 105-112)
```javascript
if (poll.hasVotedByIP(clientIP)) {
  socket.emit('voteError', { 
    message: 'You have already voted in this poll',
    reason: 'ip_already_voted'
  });
  return;
}
```

**3. hasVotedByIP Method** (`Poll.js` lines 59-62)
```javascript
pollSchema.methods.hasVotedByIP = function(ipAddress) {
  return this.votedIPs.includes(ipAddress);
};
```

**4. Record IP After Successful Vote** (`Poll.js` line 87)
```javascript
this.votedIPs.push(ipAddress);
```

### What It Prevents:
✅ Multiple votes from the same device on the same network  
✅ Simple automated voting scripts from a single IP  
✅ Users trying to vote multiple times without changing network  

### Limitations:
❌ Users can bypass by switching networks (WiFi → Mobile Data)  
❌ Users behind corporate NAT may share the same public IP  
❌ VPN users can change IPs easily  

---

## Mechanism #2: Browser Fingerprinting

### How It Works:
Each browser generates a unique fingerprint based on browser characteristics. Even if the IP changes, the same browser cannot vote twice.

### Implementation Location:
- **Model**: `server/models/Poll.js` - Lines 65-67
- **Vote Handler**: `server/server.js` - Lines 114-119
- **Data Storage**: `votedBrowsers` array in Poll schema

### Code Flow:

**1. Receive Browser Fingerprint** (`server.js` line 77)
```javascript
const { pollId, optionIndex, browserFingerprint } = data;
```

**2. Check if Browser Already Voted** (`server.js` lines 114-119)
```javascript
if (browserFingerprint && poll.hasVotedByBrowser(browserFingerprint)) {
  socket.emit('voteError', { 
    message: 'You have already voted in this poll',
    reason: 'browser_already_voted'
  });
  return;
}
```

**3. hasVotedByBrowser Method** (`Poll.js` lines 65-67)
```javascript
pollSchema.methods.hasVotedByBrowser = function(fingerprint) {
  return this.votedBrowsers.includes(fingerprint);
};
```

**4. Record Browser Fingerprint** (`Poll.js` lines 89-91)
```javascript
if (browserFingerprint) {
  this.votedBrowsers.push(browserFingerprint);
}
```

### What It Prevents:
✅ Same browser voting multiple times (even with different IPs)  
✅ Users switching networks but using the same browser  
✅ Mobile users switching between WiFi and cellular data  

### Limitations:
❌ Users can bypass by using different browsers  
❌ Incognito/Private mode may generate different fingerprints  
❌ Browser fingerprinting can be detected and spoofed by advanced users  

---

## Combined Defense Strategy

### Why Two Mechanisms?
Using **both** IP tracking and browser fingerprinting creates overlapping protection:

| Scenario | IP Check | Browser Check | Result |
|----------|----------|---------------|---------|
| Same device, same network | ✅ Blocks | ✅ Blocks | **BLOCKED** |
| Same device, different network | ✅ Allows | ✅ Blocks | **BLOCKED** |
| Different device, same network | ✅ Blocks | ✅ Allows | **BLOCKED** |
| Different device, different network | ✅ Allows | ✅ Allows | ALLOWED |

### The recordVote Method

The complete vote recording logic in `Poll.js` (lines 70-93):

```javascript
pollSchema.methods.recordVote = function(optionIndex, ipAddress, browserFingerprint) {
  // Validate option exists
  if (optionIndex < 0 || optionIndex >= this.options.length) {
    throw new Error('Invalid option index');
  }

  // Double-check IP (defensive programming)
  if (this.hasVotedByIP(ipAddress)) {
    throw new Error('This IP address has already voted');
  }

  // Double-check browser fingerprint
  if (browserFingerprint && this.hasVotedByBrowser(browserFingerprint)) {
    throw new Error('This browser has already voted');
  }

  // ✅ All checks passed - record the vote
  this.options[optionIndex].votes += 1;  // Increment option votes
  this.totalVotes += 1;                   // Increment total votes
  this.votedIPs.push(ipAddress);          // Store IP
  
  if (browserFingerprint) {
    this.votedBrowsers.push(browserFingerprint);  // Store fingerprint
  }

  return this.save();  // Persist to MongoDB
};
```

---

## Bonus: Rate Limiting (Mechanism #3)

Additionally implemented in `server/middleware/ipTracking.js`:

**What it does:**
- Limits to 10 vote attempts per minute per IP
- Prevents rapid automated voting scripts
- Returns HTTP 429 (Too Many Requests) when exceeded

**Implementation:**
```javascript
const windowMs = 60 * 1000;    // 1 minute window
const maxAttempts = 10;        // Max 10 votes per minute
```

---

## Testing the Anti-Abuse Logic

### Test Case 1: Duplicate Vote from Same IP
```javascript
// First vote - should succeed
socket.emit('vote', { 
  pollId: '123', 
  optionIndex: 0,
  browserFingerprint: 'abc123'
});
// ✅ voteSuccess emitted

// Second vote from same IP - should fail
socket.emit('vote', { 
  pollId: '123', 
  optionIndex: 1,
  browserFingerprint: 'abc123'
});
// ❌ voteError: "You have already voted in this poll"
```

### Test Case 2: Different Browser, Same IP
```javascript
// Vote from Chrome
socket.emit('vote', { 
  pollId: '123', 
  optionIndex: 0,
  browserFingerprint: 'chrome-fingerprint'
});
// ✅ voteSuccess

// Vote from Firefox (same IP, different fingerprint)
socket.emit('vote', { 
  pollId: '123', 
  optionIndex: 1,
  browserFingerprint: 'firefox-fingerprint'
});
// ❌ voteError: "This IP address has already voted"
```

---

## Data Structure in MongoDB

Example of a poll document after 3 votes:

```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9",
  "question": "What's your favorite color?",
  "options": [
    { "text": "Red", "votes": 2 },
    { "text": "Blue", "votes": 1 },
    { "text": "Green", "votes": 0 }
  ],
  "votedIPs": [
    "192.168.1.100",
    "203.45.67.89",
    "10.0.0.5"
  ],
  "votedBrowsers": [
    "fp_abc123def456",
    "fp_xyz789ghi012",
    "fp_mno345pqr678"
  ],
  "totalVotes": 3,
  "createdAt": "2026-02-17T10:30:00.000Z",
  "updatedAt": "2026-02-17T10:35:00.000Z"
}
```

---

## Summary

✅ **IP Tracking**: Prevents same network from voting twice  
✅ **Browser Fingerprinting**: Prevents same browser from voting twice  
✅ **Rate Limiting**: Prevents rapid automated voting  
✅ **Dual Validation**: Both in Socket handler AND model method  
✅ **Error Handling**: Clear error messages with reason codes  
✅ **Database Persistence**: All votes tracked permanently  

**Implementation Status: COMPLETE** ✓

All anti-abuse mechanisms are fully implemented and ready for testing!
