// Utility function to generate a short unique ID for poll URLs
export const generatePollId = () => {
  return Math.random().toString(36).substring(2, 9);
};

// Utility function to validate poll data
export const validatePollData = (question, options) => {
  const errors = [];

  if (!question || typeof question !== 'string') {
    errors.push('Question must be a non-empty string');
  } else if (question.trim().length < 3) {
    errors.push('Question must be at least 3 characters long');
  } else if (question.length > 500) {
    errors.push('Question cannot exceed 500 characters');
  }

  if (!Array.isArray(options)) {
    errors.push('Options must be an array');
  } else if (options.length < 2) {
    errors.push('Poll must have at least 2 options');
  } else if (options.length > 10) {
    errors.push('Poll cannot have more than 10 options');
  } else {
    options.forEach((option, index) => {
      const optionText = typeof option === 'string' ? option : option.text;
      if (!optionText || optionText.trim().length === 0) {
        errors.push(`Option ${index + 1} cannot be empty`);
      } else if (optionText.length > 200) {
        errors.push(`Option ${index + 1} cannot exceed 200 characters`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Format poll data for client response
export const formatPollResponse = (poll, includeVotedData = false) => {
  const response = {
    id: poll._id,
    question: poll.question,
    options: poll.options,
    totalVotes: poll.totalVotes,
    results: poll.results,
    createdAt: poll.createdAt,
    updatedAt: poll.updatedAt
  };

  if (includeVotedData) {
    response.votedCount = poll.votedIPs.length;
  }

  return response;
};

// Calculate vote statistics
export const calculateStats = (poll) => {
  const totalVotes = poll.totalVotes || 0;
  
  const stats = {
    totalVotes,
    options: poll.options.map(option => ({
      text: option.text,
      votes: option.votes,
      percentage: totalVotes > 0 ? ((option.votes / totalVotes) * 100).toFixed(2) : '0.00'
    })),
    leader: null
  };

  if (totalVotes > 0) {
    const maxVotes = Math.max(...poll.options.map(opt => opt.votes));
    stats.leader = poll.options.find(opt => opt.votes === maxVotes);
  }

  return stats;
};

export default {
  generatePollId,
  validatePollData,
  formatPollResponse,
  calculateStats
};
