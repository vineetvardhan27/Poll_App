import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  // Initialize socket connection
  connect() {
    if (this.socket && this.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      this.connected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return this.socket;
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  // Join a poll room
  joinPoll(pollId) {
    if (this.socket && this.connected) {
      this.socket.emit('joinPoll', pollId);
      console.log(`Joined poll room: ${pollId}`);
    }
  }

  // Leave a poll room
  leavePoll(pollId) {
    if (this.socket && this.connected) {
      this.socket.emit('leavePoll', pollId);
      console.log(`Left poll room: ${pollId}`);
    }
  }

  // Submit a vote
  vote(pollId, optionIndex, browserFingerprint) {
    if (this.socket && this.connected) {
      this.socket.emit('vote', {
        pollId,
        optionIndex,
        browserFingerprint,
      });
    } else {
      console.error('Socket not connected');
      throw new Error('Socket connection not established');
    }
  }

  // Listen for poll updates (uses 'update' event)
  onUpdate(callback) {
    if (this.socket) {
      this.socket.on('update', callback);
    }
  }

  // Listen for vote success
  onVoteSuccess(callback) {
    if (this.socket) {
      this.socket.on('voteSuccess', callback);
    }
  }

  // Listen for vote errors
  onVoteError(callback) {
    if (this.socket) {
      this.socket.on('voteError', callback);
    }
  }

  // Remove event listeners
  off(eventName, callback) {
    if (this.socket) {
      this.socket.off(eventName, callback);
    }
  }

  // Get socket instance
  getSocket() {
    return this.socket;
  }

  // Check if connected
  isConnected() {
    return this.connected;
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;
