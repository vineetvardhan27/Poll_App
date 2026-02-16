// Format date/time
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Copy to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    // Fallback method
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  }
};

// Generate shareable poll link
export const generatePollLink = (pollId) => {
  return `${window.location.origin}/poll/${pollId}`;
};

// Validate poll question
export const validateQuestion = (question) => {
  if (!question || question.trim().length === 0) {
    return 'Question is required';
  }
  if (question.trim().length < 3) {
    return 'Question must be at least 3 characters';
  }
  if (question.length > 500) {
    return 'Question cannot exceed 500 characters';
  }
  return null;
};

// Validate poll options
export const validateOptions = (options) => {
  if (!options || options.length < 2) {
    return 'At least 2 options are required';
  }
  if (options.length > 10) {
    return 'Cannot have more than 10 options';
  }
  
  for (let i = 0; i < options.length; i++) {
    const option = options[i].trim();
    if (!option) {
      return `Option ${i + 1} cannot be empty`;
    }
    if (option.length > 200) {
      return `Option ${i + 1} cannot exceed 200 characters`;
    }
  }
  
  return null;
};

// Calculate percentage
export const calculatePercentage = (votes, total) => {
  if (total === 0) return 0;
  return ((votes / total) * 100).toFixed(1);
};

export default {
  formatDate,
  copyToClipboard,
  generatePollLink,
  validateQuestion,
  validateOptions,
  calculatePercentage,
};
