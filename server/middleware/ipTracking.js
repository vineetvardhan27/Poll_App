// Middleware to extract and attach client IP to request
export const getClientIP = (req, res, next) => {
  // Check various headers for the real IP (useful when behind proxies/load balancers)
  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || 
             req.headers['x-real-ip'] ||
             req.connection.remoteAddress || 
             req.socket.remoteAddress ||
             req.ip;

  req.clientIP = ip;
  next();
};

// Simple in-memory rate limiter for voting
const voteAttempts = new Map();

export const rateLimitVotes = (req, res, next) => {
  const ip = req.clientIP || req.ip;
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxAttempts = 10; // Max 10 votes per minute per IP

  if (!voteAttempts.has(ip)) {
    voteAttempts.set(ip, []);
  }

  const attempts = voteAttempts.get(ip);
  
  // Filter out old attempts outside the time window
  const recentAttempts = attempts.filter(timestamp => now - timestamp < windowMs);
  
  if (recentAttempts.length >= maxAttempts) {
    return res.status(429).json({
      success: false,
      message: 'Too many voting attempts. Please try again later.',
      retryAfter: Math.ceil((recentAttempts[0] + windowMs - now) / 1000)
    });
  }

  // Record this attempt
  recentAttempts.push(now);
  voteAttempts.set(ip, recentAttempts);

  next();
};

// Clean up old entries periodically (run every 5 minutes)
setInterval(() => {
  const now = Date.now();
  const windowMs = 60 * 1000;
  
  for (const [ip, attempts] of voteAttempts.entries()) {
    const recentAttempts = attempts.filter(timestamp => now - timestamp < windowMs);
    
    if (recentAttempts.length === 0) {
      voteAttempts.delete(ip);
    } else {
      voteAttempts.set(ip, recentAttempts);
    }
  }
}, 5 * 60 * 1000);

export default {
  getClientIP,
  rateLimitVotes
};
