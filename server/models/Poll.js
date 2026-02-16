import mongoose from 'mongoose';

const pollSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Poll question is required'],
    trim: true,
    minlength: [3, 'Question must be at least 3 characters long'],
    maxlength: [500, 'Question cannot exceed 500 characters']
  },
  options: [{
    text: {
      type: String,
      required: [true, 'Option text is required'],
      trim: true,
      minlength: [1, 'Option must be at least 1 character'],
      maxlength: [200, 'Option cannot exceed 200 characters']
    },
    votes: {
      type: Number,
      default: 0,
      min: 0
    }
  }],
  votedIPs: [{
    type: String,
    trim: true
  }],
  votedBrowsers: [{
    type: String,
    trim: true
  }],
  createdBy: {
    type: String,
    default: 'Anonymous'
  },
  totalVotes: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Validation: Ensure at least 2 options
pollSchema.path('options').validate(function(options) {
  return options && options.length >= 2;
}, 'Poll must have at least 2 options');

// Validation: Ensure no more than 10 options
pollSchema.path('options').validate(function(options) {
  return options && options.length <= 10;
}, 'Poll cannot have more than 10 options');

// Method to check if an IP has already voted
pollSchema.methods.hasVotedByIP = function(ipAddress) {
  return this.votedIPs.includes(ipAddress);
};

// Method to check if a browser fingerprint has already voted
pollSchema.methods.hasVotedByBrowser = function(fingerprint) {
  return this.votedBrowsers.includes(fingerprint);
};

// Method to record a vote
pollSchema.methods.recordVote = function(optionIndex, ipAddress, browserFingerprint) {
  if (optionIndex < 0 || optionIndex >= this.options.length) {
    throw new Error('Invalid option index');
  }

  // Check if already voted
  if (this.hasVotedByIP(ipAddress)) {
    throw new Error('This IP address has already voted');
  }

  if (browserFingerprint && this.hasVotedByBrowser(browserFingerprint)) {
    throw new Error('This browser has already voted');
  }

  // Use atomic MongoDB operations to prevent race conditions
  // $inc ensures that concurrent votes don't overwrite each other
  const updateOps = {
    $inc: {
      [`options.${optionIndex}.votes`]: 1,
      totalVotes: 1
    },
    $push: {
      votedIPs: ipAddress
    }
  };

  if (browserFingerprint) {
    updateOps.$push.votedBrowsers = browserFingerprint;
  }

  return this.constructor.findByIdAndUpdate(
    this._id,
    updateOps,
    { new: true, runValidators: true }
  );
};

// Virtual for getting vote percentages
pollSchema.virtual('results').get(function() {
  return this.options.map(option => ({
    text: option.text,
    votes: option.votes,
    percentage: this.totalVotes > 0 
      ? ((option.votes / this.totalVotes) * 100).toFixed(2) 
      : 0
  }));
});

// Index for faster lookups
pollSchema.index({ createdAt: -1 });

const Poll = mongoose.model('Poll', pollSchema);

export default Poll;
