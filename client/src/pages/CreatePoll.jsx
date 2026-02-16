import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pollAPI } from '../services/api';
import { validateQuestion, validateOptions } from '../utils/helpers';

function CreatePoll() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);

  const handleAddOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate question
    const questionError = validateQuestion(question);
    if (questionError) {
      setError(questionError);
      return;
    }

    // Validate options
    const optionsError = validateOptions(options);
    if (optionsError) {
      setError(optionsError);
      return;
    }

    // Create poll
    setLoading(true);
    try {
      const response = await pollAPI.createPoll({
        question: question.trim(),
        options: options.map(opt => opt.trim()),
        createdBy: 'Anonymous',
      });

      if (response.success) {
        // Generate shareable link
        const link = `${window.location.origin}/poll/${response.poll.id}`;
        setGeneratedLink(link);
        setShowSuccessModal(true);
      }
    } catch (err) {
      setError(err.message || 'Failed to create poll');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToPoll = () => {
    const pollId = generatedLink.split('/').pop();
    navigate(`/poll/${pollId}`);
  };

  const handleCreateAnother = () => {
    setShowSuccessModal(false);
    setQuestion('');
    setOptions(['', '']);
    setGeneratedLink('');
    setCopied(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-slate-800 rounded-3xl shadow-2xl p-8 md:p-12 border border-slate-700">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-3">
              Create a New Poll
            </h1>
            <p className="text-slate-400 text-lg">
              Ask a question and get instant feedback
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-xl text-center">
                {error}
              </div>
            )}

            {/* Question Input */}
            <div>
              <label htmlFor="question" className="block text-slate-200 font-semibold mb-2 text-lg">
                Your Question
              </label>
              <input
                type="text"
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g., What's your favorite programming language?"
                maxLength={500}
                disabled={loading}
                className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-600 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <div className="text-right mt-1 text-sm text-slate-500">
                {question.length}/500
              </div>
            </div>

            {/* Options */}
            <div>
              <label className="block text-slate-200 font-semibold mb-3 text-lg">
                Options
              </label>
              <div className="space-y-3">
                {options.map((option, index) => (
                  <div key={index} className="flex gap-3">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      maxLength={200}
                      disabled={loading}
                      className="flex-1 px-4 py-3 bg-slate-900 border-2 border-slate-600 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-50"
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(index)}
                        disabled={loading}
                        className="w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              {options.length < 10 && (
                <button
                  type="button"
                  onClick={handleAddOption}
                  disabled={loading}
                  className="w-full mt-3 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 border-2 border-dashed border-slate-600 hover:border-indigo-500 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  + Add Option
                </button>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg"
            >
              {loading ? 'Creating Poll...' : 'Create Poll'}
            </button>
          </form>

          {/* Info Box */}
          <div className="mt-8 bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-6">
            <h3 className="text-indigo-400 font-semibold mb-3 text-lg">
              How it works:
            </h3>
            <ol className="space-y-2 text-slate-400">
              <li className="flex items-start">
                <span className="text-indigo-400 font-bold mr-3">1.</span>
                Create your poll with a question and options
              </li>
              <li className="flex items-start">
                <span className="text-indigo-400 font-bold mr-3">2.</span>
                Share the generated link with others
              </li>
              <li className="flex items-start">
                <span className="text-indigo-400 font-bold mr-3">3.</span>
                Watch results update in real-time
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl max-w-lg w-full p-8 border border-slate-700 shadow-2xl">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-center text-slate-100 mb-3">
              Poll Created Successfully!
            </h2>
            <p className="text-slate-400 text-center mb-6">
              Share this link with others to start collecting votes
            </p>

            {/* Generated Link */}
            <div className="bg-slate-900 rounded-xl p-4 mb-6 border border-slate-700">
              <label className="block text-slate-400 text-sm mb-2">
                Your Poll Link:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={generatedLink}
                  readOnly
                  className="flex-1 bg-slate-800 text-slate-200 px-3 py-2 rounded-lg border border-slate-600 text-sm"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-all"
                >
                  {copied ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleGoToPoll}
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-3 px-6 rounded-xl transition-all"
              >
                View Poll
              </button>
              <button
                onClick={handleCreateAnother}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium py-3 px-6 rounded-xl transition-all"
              >
                Create Another
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreatePoll;
