import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pollAPI } from '../services/api';
import socketService from '../services/socket';
import { getStoredFingerprint, hasVotedLocally, markVotedLocally } from '../utils/fingerprint';
import { copyToClipboard, generatePollLink, calculatePercentage } from '../utils/helpers';

function PollView() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [voting, setVoting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [voteMessage, setVoteMessage] = useState('');

  useEffect(() => {
    loadPoll();
    
    // Connect socket
    socketService.connect();
    
    // Join poll room named after poll ID
    socketService.joinPoll(id);

    // Listen for real-time 'update' events from socket
    const handleUpdate = (data) => {
      if (data.pollId === id) {
        // Update state in real-time
        setPoll(prev => ({
          ...prev,
          options: data.options,
          totalVotes: data.totalVotes,
          results: data.results,
        }));
      }
    };

    const handleVoteSuccess = (data) => {
      setVoting(false);
      setHasVoted(true);
      // Fairness Mechanism #1: Save voted_<pollId> = true in localStorage
      markVotedLocally(id);
      setVoteMessage('Vote recorded successfully!');
      setTimeout(() => setVoteMessage(''), 3000);
    };

    const handleVoteError = (data) => {
      setVoting(false);
      setError(data.message);
      setTimeout(() => setError(''), 5000);
    };

    // Listen for 'update' events
    socketService.onUpdate(handleUpdate);
    socketService.onVoteSuccess(handleVoteSuccess);
    socketService.onVoteError(handleVoteError);

    // Cleanup
    return () => {
      socketService.leavePoll(id);
      socketService.off('update', handleUpdate);
      socketService.off('voteSuccess', handleVoteSuccess);
      socketService.off('voteError', handleVoteError);
    };
  }, [id]);

  const loadPoll = async () => {
    try {
      const response = await pollAPI.getPoll(id);
      
      if (response.success) {
        setPoll(response.poll);
        setHasVoted(response.poll.hasVoted || hasVotedLocally(id));
      }
    } catch (err) {
      setError(err.message || 'Failed to load poll');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (selectedOption === null || hasVoted || voting) return;

    setVoting(true);
    setError('');

    try {
      const fingerprint = getStoredFingerprint();
      socketService.vote(id, selectedOption, fingerprint);
    } catch (err) {
      setError(err.message || 'Failed to submit vote');
      setVoting(false);
    }
  };

  const handleCopyLink = async () => {
    const link = generatePollLink(id);
    const success = await copyToClipboard(link);
    
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-slate-400 text-xl">Loading poll...</div>
      </div>
    );
  }

  if (error && !poll) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full text-center border border-slate-700">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-6 py-3 rounded-xl font-medium transition-all"
          >
            Create New Poll
          </button>
        </div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full text-center border border-slate-700">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Poll Not Found</h2>
          <button 
            onClick={() => navigate('/')}
            className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-6 py-3 rounded-xl font-medium transition-all"
          >
            Create New Poll
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-slate-800 rounded-3xl shadow-2xl p-8 md:p-12 border border-slate-700">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4 leading-tight">
              {poll.question}
            </h1>
            <div className="inline-block bg-slate-700 px-4 py-2 rounded-full text-slate-300 font-medium">
              {poll.totalVotes} {poll.totalVotes === 1 ? 'vote' : 'votes'}
            </div>
          </div>

          {/* Success Message */}
          {voteMessage && (
            <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded-xl text-center mb-6">
              {voteMessage}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-xl text-center mb-6">
              {error}
            </div>
          )}

          {/* Options */}
          <div className="space-y-4 mb-6">
            {poll.options.map((option, index) => {
              const percentage = calculatePercentage(option.votes, poll.totalVotes);
              const isSelected = selectedOption === index;
              const isWinning = hasVoted && option.votes === Math.max(...poll.options.map(o => o.votes)) && poll.totalVotes > 0;

              return (
                <div
                  key={index}
                  onClick={() => !hasVoted && setSelectedOption(index)}
                  className={`
                    relative overflow-hidden bg-slate-900 border-2 rounded-xl p-5 transition-all cursor-pointer
                    ${isSelected ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-600'}
                    ${hasVoted ? 'cursor-default' : 'hover:border-indigo-500 hover:translate-x-1'}
                    ${isWinning ? 'border-green-500' : ''}
                  `}
                >
                  {/* Progress Bar Background */}
                  {hasVoted && (
                    <div 
                      className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/10 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  )}

                  {/* Option Content */}
                  <div className="relative z-10 flex justify-between items-center">
                    <div className="flex items-center gap-4 flex-1">
                      {!hasVoted && (
                        <input
                          type="radio"
                          name="poll-option"
                          checked={isSelected}
                          onChange={() => setSelectedOption(index)}
                          className="w-5 h-5 accent-indigo-500 cursor-pointer"
                        />
                      )}
                      <span className="text-slate-100 font-medium text-lg">
                        {option.text}
                      </span>
                    </div>
                    
                    {hasVoted && (
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-indigo-400">
                          {percentage}%
                        </span>
                        <span className="text-slate-500">
                          ({option.votes})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Vote Button */}
          {!hasVoted && (
            <button
              onClick={handleVote}
              disabled={selectedOption === null || voting}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg mb-6"
            >
              {voting ? 'Submitting...' : 'Submit Vote'}
            </button>
          )}

          {/* Voted Indicator */}
          {hasVoted && (
            <div className="bg-green-500/10 border-2 border-green-500 text-green-500 px-6 py-4 rounded-xl text-center font-semibold text-lg mb-6">
              <span className="text-2xl mr-2">✓</span>
              You've already voted
            </div>
          )}

          {/* Share Section */}
          <div className="bg-slate-900 rounded-xl p-6 mb-6 border border-slate-700">
            <h3 className="text-slate-200 font-semibold text-lg mb-3">
              Share this poll
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={generatePollLink(id)}
                readOnly
                className="flex-1 bg-slate-800 border-2 border-slate-600 text-slate-200 px-4 py-3 rounded-lg text-sm"
              />
              <button 
                onClick={handleCopyLink}
                className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-all whitespace-nowrap"
              >
                {copied ? '✓ Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>

          {/* Real-time Indicator */}
          <div className="flex items-center justify-center gap-2 text-slate-400 mb-6">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span>Results update in real-time</span>
          </div>

          {/* Create New Poll Button */}
          <button 
            onClick={() => navigate('/')}
            className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium py-3 px-6 rounded-xl transition-all"
          >
            Create New Poll
          </button>
        </div>
      </div>
    </div>
  );
}

export default PollView;
