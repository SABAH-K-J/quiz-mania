import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Trash2, Image as ImageIcon, Save } from 'lucide-react';
import { quizAPI, questionAPI } from '../services/api';

const CreateQuiz = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    category: 'general',
    time_limit: '',
    show_correct_answers: true,
    allow_retake: true,
  });

  const [questions, setQuestions] = useState([
    {
      text: '',
      question_type: 'multiple_choice',
      points: 1,
      order: 0,
      explanation: '',
      options: [
        { text: '', is_correct: false, order: 0 },
        { text: '', is_correct: false, order: 1 },
      ],
    },
  ]);

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

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
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

  const handleSubmit = async (e, publish = false) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create quiz
      const quizPayload = {
        ...quizData,
        status: publish ? 'published' : 'draft',
        time_limit: quizData.time_limit ? parseInt(quizData.time_limit) : null,
      };
      
      const quizResponse = await quizAPI.create(quizPayload);
      const createdQuiz = quizResponse.data;

      // Create questions
      for (const question of questions) {
        if (question.text.trim()) {
          await questionAPI.create({
            quiz_id: createdQuiz.id,
            ...question,
          });
        }
      }

      alert(`Quiz ${publish ? 'published' : 'saved as draft'} successfully!`);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating quiz:', error);
      alert('Failed to create quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Create New Quiz</h1>

        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
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
                  placeholder="Enter quiz title"
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
                  placeholder="Enter quiz description"
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
                  <span className="text-gray-700">Show correct answers after submission</span>
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

            <div className="space-y-6">
              {questions.map((question, qIndex) => (
                <div key={qIndex} className="border border-gray-200 rounded-lg p-6 relative">
                  <div className="absolute top-4 right-4">
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(qIndex)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
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
                        placeholder="Enter your question"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2">Question Type</label>
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
                      <label className="block text-gray-700 font-semibold mb-2">Answer Options</label>
                      <div className="space-y-2">
                        {question.options.map((option, oIndex) => (
                          <div key={oIndex} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={option.is_correct}
                              onChange={(e) => handleOptionChange(qIndex, oIndex, 'is_correct', e.target.checked)}
                              className="w-5 h-5"
                              title="Mark as correct"
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
                      <label className="block text-gray-700 font-semibold mb-2">
                        Explanation (optional)
                      </label>
                      <textarea
                        value={question.explanation}
                        onChange={(e) => handleQuestionChange(qIndex, 'explanation', e.target.value)}
                        className="input-field"
                        rows="2"
                        placeholder="Explain the correct answer"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-secondary disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save as Draft'}
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={loading}
              className="btn-primary disabled:opacity-50 flex items-center space-x-2"
            >
              <Save size={20} />
              <span>{loading ? 'Publishing...' : 'Publish Quiz'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateQuiz;
