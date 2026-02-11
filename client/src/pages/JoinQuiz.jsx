import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, AlertCircle } from 'lucide-react';

const JoinQuiz = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (code.trim().length !== 8) {
      setError('Quiz code must be 8 characters');
      return;
    }

    navigate(`/quiz/play/${code.toUpperCase()}`);
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <div className="card">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Join a Quiz</h1>
            <p className="text-gray-600">Enter the 8-character quiz code to start</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
              <AlertCircle size={20} className="mr-2" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Quiz Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setError('');
                }}
                className="input-field text-center text-2xl font-mono tracking-widest uppercase"
                placeholder="ABCD1234"
                maxLength="8"
                required
              />
            </div>

            <button type="submit" className="w-full btn-primary flex items-center justify-center space-x-2">
              <Search size={20} />
              <span>Join Quiz</span>
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Don't have a code? Ask your quiz host or browse available quizzes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinQuiz;
