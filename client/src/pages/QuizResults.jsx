import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Trophy, Clock, CheckCircle, XCircle } from 'lucide-react';
import { quizAPI } from '../services/api';

const QuizResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('score'); // 'score', 'date', 'time'

  useEffect(() => {
    fetchResults();
  }, [id]);

  const fetchResults = async () => {
    try {
      const [quizRes, resultsRes] = await Promise.all([
        quizAPI.get(id),
        quizAPI.getResults(id),
      ]);
      
      setQuiz(quizRes.data);
      setResults(resultsRes.data);
    } catch (error) {
      console.error('Error fetching results:', error);
      alert('Failed to load quiz results');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const sortedResults = [...results].sort((a, b) => {
    switch (sortBy) {
      case 'score':
        return b.percentage - a.percentage;
      case 'date':
        return new Date(b.completed_at) - new Date(a.completed_at);
      case 'time':
        return (a.time_taken || 0) - (b.time_taken || 0);
      default:
        return 0;
    }
  });

  const stats = {
    totalAttempts: results.length,
    averageScore: results.length > 0
      ? (results.reduce((sum, r) => sum + r.percentage, 0) / results.length).toFixed(1)
      : 0,
    highestScore: results.length > 0
      ? Math.max(...results.map(r => r.percentage))
      : 0,
    averageTime: results.length > 0 && results.some(r => r.time_taken)
      ? Math.floor(results.reduce((sum, r) => sum + (r.time_taken || 0), 0) / results.filter(r => r.time_taken).length)
      : 0,
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-white hover:text-purple-200 transition-colors mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold text-white mb-2">{quiz?.title}</h1>
          <p className="text-purple-100">Quiz Results & Analytics</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="card text-center">
            <div className="flex justify-center mb-2">
              <Users size={32} className="text-primary-600" />
            </div>
            <div className="text-3xl font-bold text-gray-800">{stats.totalAttempts}</div>
            <div className="text-sm text-gray-600">Total Attempts</div>
          </div>

          <div className="card text-center">
            <div className="flex justify-center mb-2">
              <Trophy size={32} className="text-yellow-600" />
            </div>
            <div className="text-3xl font-bold text-gray-800">{stats.highestScore}%</div>
            <div className="text-sm text-gray-600">Highest Score</div>
          </div>

          <div className="card text-center">
            <div className="flex justify-center mb-2">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-800">{stats.averageScore}%</div>
            <div className="text-sm text-gray-600">Average Score</div>
          </div>

          <div className="card text-center">
            <div className="flex justify-center mb-2">
              <Clock size={32} className="text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-800">
              {stats.averageTime > 0 ? `${Math.floor(stats.averageTime / 60)}:${String(stats.averageTime % 60).padStart(2, '0')}` : 'N/A'}
            </div>
            <div className="text-sm text-gray-600">Avg Time</div>
          </div>
        </div>

        {/* Results Table */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">All Results</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="score">Score (High to Low)</option>
                <option value="date">Date (Recent First)</option>
                <option value="time">Time Taken</option>
              </select>
            </div>
          </div>

          {results.length === 0 ? (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No one has taken this quiz yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Rank</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">User</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Score</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Percentage</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Time Taken</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortedResults.map((result, index) => {
                    const percentageColor =
                      result.percentage >= 80
                        ? 'text-green-600'
                        : result.percentage >= 60
                        ? 'text-yellow-600'
                        : 'text-red-600';

                    return (
                      <tr key={result.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          {sortBy === 'score' && (
                            <div className="flex items-center">
                              {index === 0 && <Trophy size={20} className="text-yellow-500 mr-2" />}
                              {index === 1 && <Trophy size={20} className="text-gray-400 mr-2" />}
                              {index === 2 && <Trophy size={20} className="text-orange-600 mr-2" />}
                              <span className="font-semibold">{index + 1}</span>
                            </div>
                          )}
                          {sortBy !== 'score' && <span className="font-semibold">{index + 1}</span>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-800">{result.user.username}</div>
                          {result.user.first_name && (
                            <div className="text-sm text-gray-500">
                              {result.user.first_name} {result.user.last_name}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-semibold text-gray-800">
                            {result.score}/{result.total_questions}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-2xl font-bold ${percentageColor}`}>
                            {result.percentage}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-gray-700">
                          {result.time_taken
                            ? `${Math.floor(result.time_taken / 60)}m ${result.time_taken % 60}s`
                            : 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-600">
                          {new Date(result.completed_at).toLocaleDateString()}
                          <div className="text-xs text-gray-500">
                            {new Date(result.completed_at).toLocaleTimeString()}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Score Distribution */}
        {results.length > 0 && (
          <div className="card mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Score Distribution</h2>
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: '0-25%', min: 0, max: 25, color: 'bg-red-500' },
                { label: '26-50%', min: 26, max: 50, color: 'bg-orange-500' },
                { label: '51-75%', min: 51, max: 75, color: 'bg-yellow-500' },
                { label: '76-100%', min: 76, max: 100, color: 'bg-green-500' },
              ].map((range) => {
                const count = results.filter(
                  (r) => r.percentage >= range.min && r.percentage <= range.max
                ).length;
                const percentage = ((count / results.length) * 100).toFixed(0);

                return (
                  <div key={range.label} className="text-center">
                    <div className="mb-2">
                      <div className={`${range.color} text-white rounded-lg py-8 font-bold text-2xl`}>
                        {count}
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-gray-700">{range.label}</div>
                    <div className="text-xs text-gray-500">{percentage}% of total</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizResults;
