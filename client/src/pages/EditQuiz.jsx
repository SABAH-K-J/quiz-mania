import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlusCircle, Trash2, Save, ArrowLeft } from 'lucide-react';
import { quizAPI, questionAPI } from '../services/api';

const EditQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    category: 'general',
    time_limit: '',
    show_correct_answers: true,
    allow_retake: true,
  });

  const [questions, setQuestions] = useState([]);
  const [originalQuestions, setOriginalQuestions] = useState([]);

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  const fetchQuiz = async () => {
    try {
      const response = await quizAPI.get(id);
      const quiz = response.data;
      
      setQuizData({
        title: quiz.title,
        description: quiz.description || '',
        category: quiz.category,
        time_limit: quiz.time_limit || '',
        show_correct_answers: quiz.show_correct_answers,
        allow_retake: quiz.allow_retake,
      });

      setQuestions(quiz.questions || []);
      setOriginalQuestions(quiz.questions || []);
    } catch (error) {
      console.error('Error fetching quiz:', error);
      alert('Failed to load quiz');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleQuizChange = (e) => {
    const { name, value, type, checked } = e.target;
    setQuizData({
      ...quizData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex, oIndex, field, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex][field] = value;
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: '',
        question_type: 'multiple_choice',
        points: 1,
        order: questions.length,
        explanation: '',
        options: [
          { text: '', is_correct: false, order: 0 },
          { text: '', is_correct: false, order: 1 },
        ],
      },
    ]);
  };

  const removeQuestion = async (index) => {
    const question = questions[index];
    
    if (question.id) {
      // Existing question - delete from backend
      if (!window.confirm('Are you sure you want to delete this question?')) return;
      
      try {
        await questionAPI.delete(question.id);
        setQuestions(questions.filter((_, i) => i !== index));
      } catch (error) {
        console.error('Error deleting question:', error);
        alert('Failed to delete question');
      }
    } else {
      // New question - just remove from state
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const addOption = (qIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options.push({
      text: '',
      is_correct: false,
      order: newQuestions[qIndex].options.length,
    });
    setQuestions(newQuestions);
  };

  const removeOption = (qIndex, oIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options = newQuestions[qIndex].options.filter((_, i) => i !== oIndex);
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Update quiz basic info
      const quizPayload = {
        ...quizData,
        time_limit: quizData.time_limit ? parseInt(quizData.time_limit) : null,
      };
      
      await quizAPI.update(id, quizPayload);

      // Update questions
      for (const question of questions) {
        if (question.text.trim()) {
          if (question.id) {
            // Update existing question
            await questionAPI.update(question.id, question);
          } else {
            // Create new question
            await questionAPI.create({
              quiz_id: id,
              ...question,
            });
          }
        }
      }

      alert('Quiz updated successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating quiz:', error);
      alert('Failed to update quiz. Please try again.');
    } finally {
      setSaving(false);
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
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-white hover:text-purple-200 transition-colors mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold text-white">Edit Quiz</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Quiz Details */}
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Quiz Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={quizData.title}
                  onChange={handleQuizChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Description</label>
                <textarea
                  name="description"
                  value={quizData.description}
                  onChange={handleQuizChange}
                  className="input-field"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Category</label>
                  <select
                    name="category"
                    value={quizData.category}
                    onChange={handleQuizChange}
                    className="input-field"
                  >
                    <option value="general">General Knowledge</option>
                    <option value="science">Science</option>
                    <option value="math">Mathematics</option>
                    <option value="history">History</option>
                    <option value="geography">Geography</option>
                    <option value="technology">Technology</option>
                    <option value="sports">Sports</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Time Limit (seconds)</label>
                  <input
                    type="number"
                    name="time_limit"
                    value={quizData.time_limit}
                    onChange={handleQuizChange}
                    className="input-field"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="flex space-x-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="show_correct_answers"
                    checked={quizData.show_correct_answers}
                    onChange={handleQuizChange}
                    className="w-4 h-4 text-primary-600"
                  />
                  <span className="text-gray-700">Show correct answers</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="allow_retake"
                    checked={quizData.allow_retake}
                    onChange={handleQuizChange}
                    className="w-4 h-4 text-primary-600"
                  />
                  <span className="text-gray-700">Allow retakes</span>
                </label>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Questions</h2>
              <button
                type="button"
                onClick={addQuestion}
                className="btn-primary flex items-center space-x-2"
              >
                <PlusCircle size={20} />
                <span>Add Question</span>
              </button>
            </div>

            {questions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No questions yet. Add your first question!</p>
            ) : (
              <div className="space-y-6">
                {questions.map((question, qIndex) => (
                  <div key={qIndex} className="border border-gray-200 rounded-lg p-6 relative">
                    <div className="absolute top-4 right-4">
                      <button
                        type="button"
                        onClick={() => removeQuestion(qIndex)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                          Question {qIndex + 1} *
                        </label>
                        <textarea
                          value={question.text}
                          onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
                          className="input-field"
                          rows="2"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-700 font-semibold mb-2">Type</label>
                          <select
                            value={question.question_type}
                            onChange={(e) => handleQuestionChange(qIndex, 'question_type', e.target.value)}
                            className="input-field"
                          >
                            <option value="multiple_choice">Multiple Choice</option>
                            <option value="true_false">True/False</option>
                            <option value="multi_select">Multiple Select</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-gray-700 font-semibold mb-2">Points</label>
                          <input
                            type="number"
                            value={question.points}
                            onChange={(e) => handleQuestionChange(qIndex, 'points', parseInt(e.target.value))}
                            className="input-field"
                            min="1"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-700 font-semibold mb-2">Options</label>
                        <div className="space-y-2">
                          {question.options.map((option, oIndex) => (
                            <div key={oIndex} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={option.is_correct}
                                onChange={(e) => handleOptionChange(qIndex, oIndex, 'is_correct', e.target.checked)}
                                className="w-5 h-5"
                                title="Correct answer"
                              />
                              <input
                                type="text"
                                value={option.text}
                                onChange={(e) => handleOptionChange(qIndex, oIndex, 'text', e.target.value)}
                                className="input-field flex-1"
                                placeholder={`Option ${oIndex + 1}`}
                                required
                              />
                              {question.options.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => removeOption(qIndex, oIndex)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 size={18} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        {question.options.length < 6 && (
                          <button
                            type="button"
                            onClick={() => addOption(qIndex)}
                            className="mt-2 text-primary-600 hover:text-primary-700 text-sm font-semibold"
                          >
                            + Add Option
                          </button>
                        )}
                      </div>

                      <div>
                        <label className="block text-gray-700 font-semibold mb-2">Explanation</label>
                        <textarea
                          value={question.explanation || ''}
                          onChange={(e) => handleQuestionChange(qIndex, 'explanation', e.target.value)}
                          className="input-field"
                          rows="2"
                          placeholder="Optional explanation"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary disabled:opacity-50 flex items-center space-x-2"
            >
              <Save size={20} />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditQuiz;
