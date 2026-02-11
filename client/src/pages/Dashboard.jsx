import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Edit, Trash2, Users, Clock, CheckCircle, BarChart3 } from 'lucide-react';
import { quizAPI, resultAPI } from '../services/api';

const Dashboard = () => {
  const [myQuizzes, setMyQuizzes] = useState([]);
  const [myResults, setMyResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('created'); // 'created' or 'taken'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [quizzesRes, resultsRes] = await Promise.all([
        quizAPI.myQuizzes(),
        resultAPI.list(),
      ]);
      
      // Handle paginated response - data is in .results property
      const quizzes = Array.isArray(quizzesRes.data) ? quizzesRes.data : (quizzesRes.data?.results || []);
      const results = Array.isArray(resultsRes.data) ? resultsRes.data : (resultsRes.data?.results || []);
      
      setMyQuizzes(quizzes);
      setMyResults(results);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set empty arrays on error
      setMyQuizzes([]);
      setMyResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        await quizAPI.delete(id);
        setMyQuizzes(myQuizzes.filter((quiz) => quiz.id !== id));
      } catch (error) {
        console.error('Error deleting quiz:', error);
        alert('Failed to delete quiz');
      }
    }
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
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">My Dashboard</h1>
        <p className="text-purple-100">Manage your quizzes and view your progress</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => setActiveTab('created')}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            activeTab === 'created'
              ? 'bg-white text-purple-600'
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          My Quizzes ({myQuizzes.length})
        </button>
        <button
          onClick={() => setActiveTab('taken')}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            activeTab === 'taken'
              ? 'bg-white text-purple-600'
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          Quizzes Taken ({myResults.length})
        </button>
      </div>

      {/* Created Quizzes Tab */}
      {activeTab === 'created' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">My Quizzes</h2>
            <Link to="/quiz/create" className="btn-primary flex items-center space-x-2">
              <PlusCircle size={20} />
              <span>Create New Quiz</span>
            </Link>
          </div>

          {myQuizzes.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-600 mb-4">You haven't created any quizzes yet.</p>
              <Link to="/quiz/create" className="btn-primary inline-block">
                Create Your First Quiz
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myQuizzes.map((quiz) => (
                <div key={quiz.id} className="card hover:shadow-xl transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-1">{quiz.title}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          quiz.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : quiz.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {quiz.status.charAt(0).toUpperCase() + quiz.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {quiz.description || 'No description'}
                  </p>

                  <div className="flex items-center text-sm text-gray-500 space-x-4 mb-4">
                    <span className="flex items-center">
                      <CheckCircle size={16} className="mr-1" />
                      {quiz.question_count} questions
                    </span>
                    {quiz.time_limit && (
                      <span className="flex items-center">
                        <Clock size={16} className="mr-1" />
                        {quiz.time_limit}s
                      </span>
                    )}
                  </div>

                  <div className="border-t pt-4 flex justify-between items-center">
                    <span className="text-sm font-mono text-gray-700">Code: {quiz.code}</span>
                    <div className="flex space-x-2">
                      {quiz.status === 'published' && (
                        <Link
                          to={`/quiz/results/${quiz.id}`}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="View Results & Attendees"
                        >
                          <BarChart3 size={18} />
                        </Link>
                      )}
                      <Link
                        to={`/quiz/edit/${quiz.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </Link>
                      <button
                        onClick={() => handleDelete(quiz.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Taken Quizzes Tab */}
      {activeTab === 'taken' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">My Results</h2>
            <Link
              to="/my-results"
              className="btn-primary flex items-center space-x-2"
            >
              <BarChart3 size={20} />
              <span>View Detailed Analytics</span>
            </Link>
          </div>

          {myResults.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-600 mb-4">You haven't taken any quizzes yet.</p>
              <Link to="/quiz/join" className="btn-primary inline-block">
                Join a Quiz
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {myResults.map((result) => (
                <div key={result.id} className="card hover:shadow-xl transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {result.quiz.title}
                      </h3>
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <span>
                          Score: <strong className="text-gray-800">{result.score}/{result.total_questions}</strong>
                        </span>
                        <span>
                          Percentage: <strong className="text-gray-800">{result.percentage}%</strong>
                        </span>
                        {result.time_taken && (
                          <span>
                            Time: <strong className="text-gray-800">{Math.floor(result.time_taken / 60)}m {result.time_taken % 60}s</strong>
                          </span>
                        )}
                        <span className="text-gray-500">
                          {new Date(result.completed_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`text-3xl font-bold ${
                        result.percentage >= 80
                          ? 'text-green-600'
                          : result.percentage >= 60
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }`}
                    >
                      {result.percentage}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
