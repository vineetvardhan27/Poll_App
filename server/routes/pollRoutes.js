import express from 'express';
import Poll from '../models/Poll.js';

const router = express.Router();

// POST /api/polls - Create a new poll
router.post('/polls', async (req, res) => {
  try {
    const { question, options, createdBy } = req.body;

    // Validation
    if (!question || !options || !Array.isArray(options)) {
      return res.status(400).json({
        success: false,
        message: 'Question and options array are required'
      });
    }

    if (options.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Poll must have at least 2 options'
      });
    }

    if (options.length > 10) {
      return res.status(400).json({
        success: false,
        message: 'Poll cannot have more than 10 options'
      });
    }

    // Format options
    const formattedOptions = options.map(opt => ({
      text: typeof opt === 'string' ? opt : opt.text,
      votes: 0
    }));

    // Create poll
    const poll = new Poll({
      question,
      options: formattedOptions,
      createdBy: createdBy || 'Anonymous',
      votedIPs: [],
      votedBrowsers: [],
      totalVotes: 0
    });

    await poll.save();

    res.status(201).json({
      success: true,
      message: 'Poll created successfully',
      poll: {
        id: poll._id,
        question: poll.question,
        options: poll.options,
        totalVotes: poll.totalVotes,
        createdAt: poll.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating poll:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create poll',
      error: error.message
    });
  }
});

// GET /api/polls/:id - Fetch a specific poll
router.get('/polls/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const poll = await Poll.findById(id);

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    // Get client IP for checking if already voted
    const clientIP = req.headers['x-forwarded-for'] || 
                     req.connection.remoteAddress || 
                     req.socket.remoteAddress;

    const hasVoted = poll.hasVotedByIP(clientIP);

    res.json({
      success: true,
      poll: {
        id: poll._id,
        question: poll.question,
        options: poll.options,
        totalVotes: poll.totalVotes,
        results: poll.results,
        createdAt: poll.createdAt,
        hasVoted
      }
    });

  } catch (error) {
    console.error('Error fetching poll:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch poll',
      error: error.message
    });
  }
});

// GET /api/polls - Fetch all polls (optional, for listing)
router.get('/polls', async (req, res) => {
  try {
    const polls = await Poll.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .select('question totalVotes createdAt');

    res.json({
      success: true,
      count: polls.length,
      polls
    });

  } catch (error) {
    console.error('Error fetching polls:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch polls',
      error: error.message
    });
  }
});

export default router;
