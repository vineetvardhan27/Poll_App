import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import pollRoutes from './routes/pollRoutes.js';
import Poll from './models/Poll.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  methods: ["GET", "POST"],
  credentials: true
}));
app.use(express.json());

// Trust proxy for accurate IP addresses (important for deployment)
app.set('trust proxy', true);

// MongoDB Connection with error handling and reconnection
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
    setTimeout(connectDB, 5000);
  }
};

// Handle MongoDB connection events
mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected successfully');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err);
});

connectDB();

// API Routes
app.use('/api', pollRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Polling App API',
    status: 'running',
    endpoints: {
      createPoll: 'POST /api/polls',
      getPoll: 'GET /api/polls/:id',
      getAllPolls: 'GET /api/polls'
    }
  });
});

// Socket.IO connection and real-time voting
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join a poll room
  socket.on('joinPoll', (pollId) => {
    socket.join(pollId);
    console.log(`Socket ${socket.id} joined poll room: ${pollId}`);
  });

  // Leave a poll room
  socket.on('leavePoll', (pollId) => {
    socket.leave(pollId);
    console.log(`Socket ${socket.id} left poll room: ${pollId}`);
  });

  // Handle vote event
  socket.on('vote', async (data) => {
    try {
      const { pollId, optionIndex, browserFingerprint } = data;

      // Validate input data types
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

      // Validate MongoDB ObjectId format
      if (!mongoose.Types.ObjectId.isValid(pollId)) {
        socket.emit('voteError', { message: 'Invalid poll ID' });
        return;
      }

      // Get client IP address
      const clientIP = socket.handshake.headers['x-forwarded-for'] || 
                       socket.handshake.address;

      console.log(`Vote received - Poll: ${pollId}, Option: ${optionIndex}, IP: ${clientIP}`);

      // Find the poll
      const poll = await Poll.findById(pollId);

      if (!poll) {
        socket.emit('voteError', { 
          message: 'Poll not found' 
        });
        return;
      }

      // Validate option index
      if (optionIndex < 0 || optionIndex >= poll.options.length) {
        socket.emit('voteError', { 
          message: 'Invalid option selected' 
        });
        return;
      }

      // Check if already voted by IP
      if (poll.hasVotedByIP(clientIP)) {
        socket.emit('voteError', { 
          message: 'You have already voted in this poll',
          reason: 'ip_already_voted'
        });
        return;
      }

      // Check if already voted by browser fingerprint
      if (browserFingerprint && poll.hasVotedByBrowser(browserFingerprint)) {
        socket.emit('voteError', { 
          message: 'You have already voted in this poll',
          reason: 'browser_already_voted'
        });
        return;
      }

      // Record the vote
      await poll.recordVote(optionIndex, clientIP, browserFingerprint);

      console.log(`Vote recorded successfully for poll ${pollId}`);

      // Emit 'update' event to all clients in the poll room
      io.to(pollId).emit('update', {
        pollId: poll._id,
        options: poll.options,
        totalVotes: poll.totalVotes,
        results: poll.results
      });

      // Send success confirmation to the voter
      socket.emit('voteSuccess', {
        message: 'Vote recorded successfully',
        poll: {
          id: poll._id,
          options: poll.options,
          totalVotes: poll.totalVotes,
          results: poll.results
        }
      });

    } catch (error) {
      console.error('Error processing vote:', error);
      socket.emit('voteError', { 
        message: error.message || 'Failed to record vote'
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });

  socket.on('error', (error) => {
    console.error('Socket error:', socket.id, error);
  });
});

// Handle Socket.IO errors
io.engine.on('connection_error', (err) => {
  console.error('Socket.IO connection error:', err);
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO enabled for real-time updates`);
});
