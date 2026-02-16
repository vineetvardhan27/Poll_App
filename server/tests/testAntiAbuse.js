// Test script for anti-abuse mechanisms
// Run with: node server/tests/testAntiAbuse.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Poll from '../models/Poll.js';

dotenv.config();

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.yellow}ℹ ${msg}${colors.reset}`)
};

async function testAntiAbuse() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    log.success('Connected to MongoDB');

    // Create a test poll
    const testPoll = new Poll({
      question: 'Test Poll - Anti-Abuse Verification',
      options: [
        { text: 'Option A', votes: 0 },
        { text: 'Option B', votes: 0 },
        { text: 'Option C', votes: 0 }
      ],
      votedIPs: [],
      votedBrowsers: [],
      totalVotes: 0
    });

    await testPoll.save();
    log.success(`Test poll created with ID: ${testPoll._id}`);

    // Test 1: First vote should succeed
    log.info('\n--- Test 1: First Vote (Should Succeed) ---');
    try {
      await testPoll.recordVote(0, '192.168.1.100', 'browser-fp-123');
      log.success('First vote recorded successfully');
      log.info(`  Total votes: ${testPoll.totalVotes}`);
      log.info(`  Option A votes: ${testPoll.options[0].votes}`);
      log.info(`  Voted IPs: ${testPoll.votedIPs.join(', ')}`);
    } catch (error) {
      log.error(`First vote failed: ${error.message}`);
    }

    // Test 2: Duplicate IP vote should fail
    log.info('\n--- Test 2: Duplicate IP Vote (Should Fail) ---');
    try {
      await testPoll.recordVote(1, '192.168.1.100', 'different-browser-fp');
      log.error('Duplicate IP vote was allowed (THIS IS BAD!)');
    } catch (error) {
      log.success(`Duplicate IP vote blocked: ${error.message}`);
    }

    // Test 3: Duplicate browser fingerprint should fail
    log.info('\n--- Test 3: Duplicate Browser Fingerprint (Should Fail) ---');
    try {
      await testPoll.recordVote(1, '203.45.67.89', 'browser-fp-123');
      log.error('Duplicate browser vote was allowed (THIS IS BAD!)');
    } catch (error) {
      log.success(`Duplicate browser vote blocked: ${error.message}`);
    }

    // Test 4: New IP and browser should succeed
    log.info('\n--- Test 4: New IP & Browser (Should Succeed) ---');
    try {
      await testPoll.recordVote(1, '10.0.0.5', 'new-browser-fp-456');
      log.success('New vote recorded successfully');
      log.info(`  Total votes: ${testPoll.totalVotes}`);
      log.info(`  Option B votes: ${testPoll.options[1].votes}`);
      log.info(`  Voted IPs: ${testPoll.votedIPs.join(', ')}`);
    } catch (error) {
      log.error(`New vote failed: ${error.message}`);
    }

    // Test 5: Invalid option index
    log.info('\n--- Test 5: Invalid Option Index (Should Fail) ---');
    try {
      await testPoll.recordVote(99, '172.16.0.1', 'another-fp');
      log.error('Invalid option was allowed (THIS IS BAD!)');
    } catch (error) {
      log.success(`Invalid option blocked: ${error.message}`);
    }

    // Test 6: hasVotedByIP method
    log.info('\n--- Test 6: hasVotedByIP Method ---');
    const hasVoted1 = testPoll.hasVotedByIP('192.168.1.100');
    const hasVoted2 = testPoll.hasVotedByIP('8.8.8.8');
    log.info(`IP 192.168.1.100 has voted: ${hasVoted1} (should be true)`);
    log.info(`IP 8.8.8.8 has voted: ${hasVoted2} (should be false)`);
    
    if (hasVoted1 && !hasVoted2) {
      log.success('hasVotedByIP working correctly');
    } else {
      log.error('hasVotedByIP not working correctly');
    }

    // Test 7: hasVotedByBrowser method
    log.info('\n--- Test 7: hasVotedByBrowser Method ---');
    const browserVoted1 = testPoll.hasVotedByBrowser('browser-fp-123');
    const browserVoted2 = testPoll.hasVotedByBrowser('unknown-fp');
    log.info(`Browser 'browser-fp-123' has voted: ${browserVoted1} (should be true)`);
    log.info(`Browser 'unknown-fp' has voted: ${browserVoted2} (should be false)`);
    
    if (browserVoted1 && !browserVoted2) {
      log.success('hasVotedByBrowser working correctly');
    } else {
      log.error('hasVotedByBrowser not working correctly');
    }

    // Final Stats
    log.info('\n--- Final Poll Statistics ---');
    log.info(`Question: ${testPoll.question}`);
    log.info(`Total Votes: ${testPoll.totalVotes}`);
    testPoll.options.forEach((opt, idx) => {
      log.info(`  ${opt.text}: ${opt.votes} votes`);
    });
    log.info(`Total IPs tracked: ${testPoll.votedIPs.length}`);
    log.info(`Total browsers tracked: ${testPoll.votedBrowsers.length}`);

    // Cleanup
    log.info('\n--- Cleanup ---');
    await Poll.findByIdAndDelete(testPoll._id);
    log.success('Test poll deleted');

    log.success('\n✅ All anti-abuse tests completed successfully!');

  } catch (error) {
    log.error(`\nTest failed with error: ${error.message}`);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    log.info('Database connection closed');
    process.exit(0);
  }
}

// Run tests
log.info('Starting anti-abuse mechanism tests...\n');
testAntiAbuse();
