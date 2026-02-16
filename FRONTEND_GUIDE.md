# Frontend Implementation Guide

## 📁 Project Structure

```
client/src/
├── pages/
│   ├── CreatePoll.jsx          # Poll creation page
│   ├── CreatePoll.css          # Poll creation styles
│   ├── PollView.jsx            # Poll viewing & voting page
│   └── PollView.css            # Poll view styles
├── services/
│   ├── api.js                  # Axios API service
│   └── socket.js               # Socket.IO service
├── utils/
│   ├── fingerprint.js          # Browser fingerprinting
│   └── helpers.js              # Utility functions
├── App.jsx                     # Main app with routes
├── App.css                     # App styles
├── main.jsx                    # React entry point
└── index.css                   # Global styles
```

---

## 🎨 Pages & Components

### 1. CreatePoll Page

**File:** `pages/CreatePoll.jsx`

**Features:**
- Dynamic option management (2-10 options)
- Real-time validation
- Character count tracking
- Error handling
- Loading states

**Key Functions:**
```javascript
handleAddOption()      // Add new option (max 10)
handleRemoveOption()   // Remove option (min 2)
handleOptionChange()   // Update option text
handleSubmit()         // Create poll and navigate
```

**Validation:**
- Question: 3-500 characters
- Options: 2-10 options, 1-200 characters each
- Client-side + server-side validation

---

### 2. PollView Page

**File:** `pages/PollView.jsx`

**Features:**
- Real-time vote updates via Socket.IO
- Browser fingerprinting
- LocalStorage vote tracking
- Progress bars with percentages
- Share link with copy functionality
- Winner highlighting

**Socket.IO Integration:**
```javascript
// Connect and join poll room
socketService.connect()
socketService.joinPoll(pollId)

// Listen for updates
socketService.onPollUpdate(handlePollUpdate)
socketService.onVoteSuccess(handleVoteSuccess)
socketService.onVoteError(handleVoteError)

// Submit vote
socketService.vote(pollId, optionIndex, fingerprint)
```

**Anti-Abuse:**
1. LocalStorage check: `hasVotedLocally(pollId)`
2. Browser fingerprint sent with vote
3. Server validates IP + fingerprint

---

## 🔌 Services

### API Service (`services/api.js`)

Axios-based HTTP client for REST API calls.

**Methods:**
```javascript
pollAPI.createPoll(pollData)    // POST /api/polls
pollAPI.getPoll(pollId)         // GET /api/polls/:id
pollAPI.getAllPolls()           // GET /api/polls
```

**Features:**
- Automatic error handling
- Request/response interceptors
- Configurable base URL via env vars

---

### Socket Service (`services/socket.js`)

Singleton Socket.IO client for real-time updates.

**Methods:**
```javascript
socketService.connect()                     // Initialize connection
socketService.disconnect()                  // Close connection
socketService.joinPoll(pollId)              // Join poll room
socketService.leavePoll(pollId)             // Leave poll room
socketService.vote(pollId, index, fp)       // Submit vote
socketService.onPollUpdate(callback)        // Listen for updates
socketService.onVoteSuccess(callback)       // Vote success handler
socketService.onVoteError(callback)         // Vote error handler
```

**Auto-reconnection:**
- 5 retry attempts
- 1 second delay between retries
- WebSocket + polling fallback

---

## 🛠️ Utilities

### Browser Fingerprinting (`utils/fingerprint.js`)

Generates unique browser identifier combining:
- User agent
- Screen resolution
- Color depth
- Timezone
- Canvas fingerprint
- WebGL renderer
- Hardware info

**Functions:**
```javascript
generateFingerprint()         // Generate new fingerprint
getStoredFingerprint()        // Get/create persistent fingerprint
hasVotedLocally(pollId)       // Check localStorage
markVotedLocally(pollId)      // Mark as voted
clearLocalVote(pollId)        // Clear vote (testing)
```

**Storage:**
Fingerprint stored in `localStorage` as `browserFingerprint` for consistency across page reloads.

---

### Helper Functions (`utils/helpers.js`)

**Available helpers:**
```javascript
formatDate(dateString)                // Format timestamps
copyToClipboard(text)                 // Copy with fallback
generatePollLink(pollId)              // Create shareable URL
validateQuestion(question)            // Validate question
validateOptions(options)              // Validate options array
calculatePercentage(votes, total)     // Calculate %
```

---

## 🎨 Styling

### Design System

**Color Palette (CSS Variables):**
```css
--primary-color: #6366f1        /* Indigo */
--secondary-color: #8b5cf6      /* Purple */
--success-color: #10b981        /* Green */
--error-color: #ef4444          /* Red */
--background: #0f172a           /* Dark blue */
--surface: #1e293b              /* Card background */
--text-primary: #f1f5f9         /* White */
--text-secondary: #cbd5e1       /* Gray */
```

**Key Features:**
- Dark theme
- Gradient buttons
- Glass morphism cards
- Smooth transitions
- Responsive design
- Pulse animations for real-time indicator

---

## 🔄 Real-Time Flow

### Vote Submission Flow:

```
1. User selects option
   ↓
2. Click "Submit Vote"
   ↓
3. Generate browser fingerprint
   ↓
4. Emit 'vote' event via Socket.IO
   {pollId, optionIndex, browserFingerprint}
   ↓
5. Server validates:
   - Poll exists
   - Option is valid
   - IP hasn't voted
   - Browser hasn't voted
   ↓
6. Server records vote in MongoDB
   ↓
7. Server emits 'pollUpdate' to ALL clients in room
   ↓
8. All clients update UI instantly
   ↓
9. Voter receives 'voteSuccess' confirmation
   ↓
10. Store vote in localStorage
```

### Real-Time Updates:

When ANY user votes:
1. Server broadcasts `pollUpdate` event
2. All connected clients receive update
3. React state updates automatically
4. UI re-renders with new percentages
5. Progress bars animate to new values

**No page refresh needed!** ✨

---

## 🌐 Environment Variables

**File:** `client/.env`

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

**For production:**
```env
VITE_API_URL=https://your-api.com/api
VITE_SOCKET_URL=https://your-api.com
```

---

## 📱 Responsive Design

### Breakpoints:

**Mobile:** < 768px
- Single column layout
- Full-width buttons
- Stacked share link inputs
- Smaller font sizes

**Desktop:** ≥ 768px
- Centered cards (max-width: 700-800px)
- Inline share link with button
- Larger typography

---

## 🧪 Testing Locally

### Test Real-Time Updates:

1. Open poll in two browser windows/tabs
2. Vote in one window
3. Watch the other window update instantly!

### Test Anti-Abuse:

1. Vote once → Success ✅
2. Try voting again → Error: "You have already voted" ❌
3. Open incognito mode → Also blocked (IP tracking) ❌
4. Clear localStorage → Still blocked (IP + server-side tracking) ❌

---

## 🚀 Performance Optimizations

1. **Socket Connection Pooling**
   - Single connection per client
   - Automatic reconnection on disconnect

2. **LocalStorage Caching**
   - Browser fingerprint cached
   - Voted polls tracked locally
   - Reduces redundant computation

3. **Optimized Re-renders**
   - React state updates only on real changes
   - useEffect dependencies properly managed

4. **CSS Transitions**
   - Hardware-accelerated animations
   - 60fps progress bar updates

---

## 🎯 User Experience Features

### ✨ Visual Feedback:

- **Loading states** - "Creating Poll...", "Submitting..."
- **Success messages** - "Vote recorded successfully!"
- **Error messages** - Clear, actionable error text
- **Real-time indicator** - Pulsing dot showing live connection
- **Winner highlighting** - Leading option has green border
- **Progress bars** - Visual vote distribution

### 🔗 Sharing:

- **One-click copy** - Share link copies to clipboard
- **Visual confirmation** - Button changes to "Copied!"
- **Full URL display** - Users see complete shareable link

### ⚡ Real-Time:

- **Instant updates** - No refresh needed
- **Live vote counts** - Updates as votes come in
- **Percentage calculations** - Auto-calculated and displayed
- **Connection status** - Always visible

---

## 🐛 Error Handling

### Network Errors:
```javascript
try {
  await pollAPI.createPoll(data)
} catch (err) {
  setError(err.message)  // Display to user
}
```

### Socket Errors:
```javascript
socketService.onVoteError((data) => {
  setError(data.message)
  // e.g., "You have already voted in this poll"
})
```

### Validation Errors:
- Shown in red error box
- Clear, user-friendly messages
- Auto-dismiss after 5 seconds

---

## 📊 Component State Management

### CreatePoll State:
```javascript
const [question, setQuestion] = useState('')
const [options, setOptions] = useState(['', ''])
const [loading, setLoading] = useState(false)
const [error, setError] = useState('')
```

### PollView State:
```javascript
const [poll, setPoll] = useState(null)
const [loading, setLoading] = useState(true)
const [error, setError] = useState('')
const [hasVoted, setHasVoted] = useState(false)
const [selectedOption, setSelectedOption] = useState(null)
const [voting, setVoting] = useState(false)
const [copied, setCopied] = useState(false)
const [voteMessage, setVoteMessage] = useState('')
```

---

## 🎨 UI Components Breakdown

### CreatePoll Components:
1. **Form Header** - Title and subtitle
2. **Question Input** - With character counter
3. **Option Inputs** - Dynamic list with add/remove
4. **Submit Button** - Gradient with loading state
5. **Info Box** - How it works instructions

### PollView Components:
1. **Poll Header** - Question and vote count
2. **Options List** - Radio buttons or results
3. **Vote Button** - Disabled after voting
4. **Share Section** - Link with copy button
5. **Real-time Indicator** - Pulsing dot
6. **Create New Button** - Navigate to home

---

**Frontend implementation complete!** ✅

Ready for Phase 4: Deployment & Testing
