// Browser fingerprinting utility
// Generates a unique identifier based on browser characteristics

export const generateFingerprint = () => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Canvas fingerprinting
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#f60';
  ctx.fillRect(125, 1, 62, 20);
  ctx.fillStyle = '#069';
  ctx.fillText('Browser Fingerprint', 2, 15);
  ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
  ctx.fillText('Browser Fingerprint', 4, 17);
  
  const canvasData = canvas.toDataURL();
  
  // Collect browser information
  const browserInfo = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
    deviceMemory: navigator.deviceMemory || 0,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    colorDepth: window.screen.colorDepth,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    canvas: canvasData,
    plugins: Array.from(navigator.plugins || []).map(p => p.name).join(','),
    webgl: getWebGLFingerprint(),
  };
  
  // Create hash from browser info
  const fingerprint = simpleHash(JSON.stringify(browserInfo));
  
  return fingerprint;
};

// Get WebGL fingerprint
function getWebGLFingerprint() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) return 'no-webgl';
    
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      return `${vendor}~${renderer}`;
    }
    
    return 'webgl-available';
  } catch (e) {
    return 'webgl-error';
  }
}

// Simple hash function
function simpleHash(str) {
  let hash = 0;
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return 'fp_' + Math.abs(hash).toString(36);
}

// Store fingerprint in localStorage for consistency
export const getStoredFingerprint = () => {
  let fingerprint = localStorage.getItem('browserFingerprint');
  
  if (!fingerprint) {
    fingerprint = generateFingerprint();
    localStorage.setItem('browserFingerprint', fingerprint);
  }
  
  return fingerprint;
};

// Check if user has voted on a poll (localStorage check)
// Uses key format: voted_<pollId> = true
export const hasVotedLocally = (pollId) => {
  const votedKey = `voted_${pollId}`;
  return localStorage.getItem(votedKey) === 'true';
};

// Mark poll as voted locally (Fairness Mechanism #1)
// Saves: voted_<pollId> = true
export const markVotedLocally = (pollId) => {
  const votedKey = `voted_${pollId}`;
  localStorage.setItem(votedKey, 'true');
};

// Clear local vote record (for testing)
export const clearLocalVote = (pollId) => {
  const votedKey = `voted_${pollId}`;
  localStorage.removeItem(votedKey);
};

export default {
  generateFingerprint,
  getStoredFingerprint,
  hasVotedLocally,
  markVotedLocally,
  clearLocalVote,
};
