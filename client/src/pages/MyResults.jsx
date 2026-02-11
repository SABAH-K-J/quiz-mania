import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Clock, Calendar, TrendingUp, Award, Target } from 'lucide-react';
import { resultAPI } from '../services/api';

const MyResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await resultAPI.list();
      // Handle paginated response - data is in .results property
      const resultsData = Array.isArray(response.data) ? response.data : (response.data?.results || []);
      setResults(resultsData);
    } catch (error) {
      console.error('Error fetching results:', error);
      setResults([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...new Set(results.map((r) => r.quiz.category))];

  const filteredResults = filterCategory === 'all'
    ? results
    : results.filter((r) => r.quiz.category === filterCategory);

  const stats = {
    totalQuizzes: results.length,
    averageScore: results.length > 0
      ? (results.reduce((sum, r) => sum + r.percentage, 0) / results.length).toFixed(1)
      : 0,
    bestScore: results.length > 0 ? Math.max(...results.map((r) => r.percentage)) : 0,
    totalPoints: results.reduce((sum, r) => sum + r.score, 0),
    perfectScores: results.filter((r) => r.percentage === 100).length,
  };

  const getGradeEmoji = (percentage) => {
    if (percentage >= 90) return '🏆';
    if (percentage >= 80) return '🌟';
    if (percentage >= 70) return '👍';
    if (percentage >= 60) return '✅';
    return '📚';
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">My Results</h1>
          <p className="text-purple-100">Track your performance and progress</p>
        </div>

        {results.length === 0 ? (
          <div className="card text-center py-16">
            <Trophy size={64} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Results Yet</h2>
            <p className="text-gray-600 mb-6">Start taking quizzes to see your results here!</p>
            <Link to="/quiz/join" className="btn-primary inline-block">
              Join a Quiz
            </Link>
          </div>
        ) : (
          <>
            {/* Statistics Overview */}
            <div className="grid md:grid-cols-5 gap-4 mb-8">
              <div className="card text-center">
                <div className="flex justify-center mb-2">
                  <Target size={28} className="text-primary-600" />
                </div>
                <div className="text-2xl font-bold text-gray-800">{stats.totalQuizzes}</div>
                <div className="text-sm text-gray-600">Quizzes Taken</div>
              </div>

              <div className="card text-center">
                <div className="flex justify-center mb-2">
                  <TrendingUp size={28} className="text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-800">{stats.averageScore}%</div>
                <div className="text-sm text-gray-600">Average Score</div>
              </div>

              <div className="card text-center">
                <div className="flex justify-center mb-2">
                  <Trophy size={28} className="text-yellow-600" />
                </div>
                <div className="text-2xl font-bold text-gray-800">{stats.bestScore}%</div>
                <div className="text-sm text-gray-600">Best Score</div>
              </div>

              <div className="card text-center">
                <div className="flex justify-center mb-2">
                  <Award size={28} className="text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-800">{stats.perfectScores}</div>
                <div className="text-sm text-gray-600">Perfect Scores</div>
              </div>

              <div className="card text-center">
                <div className="flex justify-center mb-2">
                  <span className="text-2xl">🎯</span>
                </div>
                <div className="text-2xl font-bold text-gray-800">{stats.totalPoints}</div>
                <div className="text-sm text-gray-600">Total Points</div>
              </div>
            </div>

            {/* Filter */}
            <div className="card mb-6">
              <div className="flex items-center space-x-4">
                <span className="text-gray-700 font-semibold">Filter by Category:</span>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setFilterCategory(category)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                        filterCategory === category
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results List */}
            <div className="space-y-4">
              {filteredResults.map((result) => {
                const percentageColor =
                  result.percentage >= 80
                    ? 'text-green-600'
                    : result.percentage >= 60
                    ? 'text-yellow-600'
                    : 'text-red-600';

                return (
                  <div key={result.id} className="card hover:shadow-xl transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-3xl">{getGradeEmoji(result.percentage)}</span>
                          <div>
                            <h3 className="text-xl font-bold text-gray-800">{result.quiz.title}</h3>
                            <span className="text-sm text-gray-500">
                              {result.quiz.category.charAt(0).toUpperCase() + result.quiz.category.slice(1)}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          <div className="flex items-center space-x-2 text-gray-700">
                            <Trophy size={18} className="text-gray-500" />
                            <div>
                              <div className="text-sm text-gray-600">Score</div>
                              <div className="font-semibold">
                                {result.score}/{result.total_questions}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 text-gray-700">
                            <Target size={18} className="text-gray-500" />
                            <div>
                              <div className="text-sm text-gray-600">Accuracy</div>
                              <div className={`font-semibold ${percentageColor}`}>
                                {result.percentage}%
                              </div>
                            </div>
                          </div>

                          {result.time_taken && (
                            <div className="flex items-center space-x-2 text-gray-700">
                              <Clock size={18} className="text-gray-500" />
                              <div>
                                <div className="text-sm text-gray-600">Time</div>
                                <div className="font-semibold">
                                  {Math.floor(result.time_taken / 60)}m {result.time_taken % 60}s
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center space-x-2 text-gray-700">
                            <Calendar size={18} className="text-gray-500" />
                            <div>
                              <div className="text-sm text-gray-600">Completed</div>
                              <div className="font-semibold text-sm">
                                {new Date(result.completed_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-right ml-4">
                        <div className={`text-4xl font-bold ${percentageColor}`}>
                          {result.percentage}%
                        </div>
                        {result.percentage === 100 && (
                          <div className="text-xs text-green-600 font-semibold mt-1">PERFECT!</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Performance Chart - Simple visual representation */}
            <div className="card mt-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Performance</h2>
              <div className="flex items-end space-x-2 h-48">
                {filteredResults.slice(0, 10).reverse().map((result, index) => {
                  const height = result.percentage;
                  const color =
                    result.percentage >= 80
                      ? 'bg-green-500'
                      : result.percentage >= 60
                      ? 'bg-yellow-500'
                      : 'bg-red-500';

                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="w-full relative" style={{ height: `${height}%` }}>
                        <div
                          className={`${color} w-full absolute bottom-0 rounded-t-lg transition-all hover:opacity-80 cursor-pointer`}
                          style={{ height: '100%' }}
                          title={`${result.quiz.title}: ${result.percentage}%`}
                        />
                      </div>
                      <div className="text-xs text-gray-600 mt-2 text-center">
                        {result.percentage}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyResults;
