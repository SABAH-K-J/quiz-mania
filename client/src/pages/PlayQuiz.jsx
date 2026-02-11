import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle } from 'lucide-react';
import { quizAPI, resultAPI } from '../services/api';
import useAuthStore from '../store/authStore';

const PlayQuiz = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    fetchQuiz();
  }, [code]);

  useEffect(() => {
    if (quiz?.time_limit && timeRemaining === null) {
      setTimeRemaining(quiz.time_limit);
    }

    if (timeRemaining !== null && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0) {
      handleSubmit();
    }
  }, [timeRemaining, quiz]);

  const fetchQuiz = async () => {
    try {
      const response = await quizAPI.getByCode(code);
      setQuiz(response.data);
    } catch (error) {
      console.error('Error fetching quiz:', error);
      alert('Quiz not found or not published');
      navigate('/quiz/join');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId, optionId) => {
    const question = quiz.questions[currentQuestion];
    
    if (question.question_type === 'multi_select') {
      // For multi-select, toggle the option
      const currentAnswers = answers[questionId] || [];
      const newAnswers = currentAnswers.includes(optionId)
        ? currentAnswers.filter((id) => id !== optionId)
        : [...currentAnswers, optionId];
      setAnswers({ ...answers, [questionId]: newAnswers });
    } else {
      // For single choice
      setAnswers({ ...answers, [questionId]: [optionId] });
    }
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    
    // Filter out questions that haven't been answered
    const answeredQuestions = Object.entries(answers)
      .filter(([_, selectedOptions]) => selectedOptions && selectedOptions.length > 0)
      .map(([questionId, selectedOptions]) => ({
        question_id: parseInt(questionId),
        selected_option_ids: selectedOptions,
      }));
    
    if (answeredQuestions.length === 0) {
      alert('Please answer at least one question before submitting!');
      return;
    }
    
    const submission = {
      quiz_code: code,
      answers: answeredQuestions,
      time_taken: timeTaken,
    };

    console.log('Submitting quiz:', submission); // Debug log

    try {
      const response = await resultAPI.submit(submission);
      console.log('Submission response:', response.data);
      alert(`Quiz submitted successfully! Your score: ${response.data.score}/${response.data.total_questions}`);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting quiz:', error);
      console.error('Error response:', error.response?.data);
      alert(error.response?.data?.error || error.response?.data?.detail || 'Failed to submit quiz');
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

  if (!quiz) {
    return null;
  }

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="card mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{quiz.title}</h1>
              <p className="text-gray-600">
                Question {currentQuestion + 1} of {quiz.questions.length}
              </p>
            </div>
            {timeRemaining !== null && (
              <div className="flex items-center space-x-2 text-lg font-semibold">
                <Clock size={24} className={timeRemaining < 60 ? 'text-red-600' : 'text-gray-600'} />
                <span className={timeRemaining < 60 ? 'text-red-600' : 'text-gray-800'}>
                  {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
                </span>
              </div>
            )}
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4 bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="card">
          <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800 flex-1">
                {question.text}
              </h2>
              <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-semibold ml-4">
                {question.points} {question.points === 1 ? 'point' : 'points'}
              </span>
            </div>
            
            {question.image && (
              <img
                src={question.image}
                alt="Question"
                className="max-w-full h-auto rounded-lg mb-4"
              />
            )}

            <p className="text-sm text-gray-500 mb-4">
              {question.question_type === 'multi_select'
                ? 'Select all that apply'
                : 'Select one answer'}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {question.options.map((option) => {
              const isSelected = answers[question.id]?.includes(option.id);
              
              return (
                <button
                  key={option.id}
                  onClick={() => handleAnswer(question.id, option.id)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    isSelected
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300 bg-white'
                  }`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                        isSelected
                          ? 'border-primary-600 bg-primary-600'
                          : 'border-gray-300'
                      }`}
                    >
                      {isSelected && <CheckCircle size={16} className="text-white" />}
                    </div>
                    <span className="text-gray-800">{option.text}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {currentQuestion < quiz.questions.length - 1 ? (
              <button onClick={handleNext} className="btn-primary">
                Next
              </button>
            ) : (
              <button onClick={handleSubmit} className="btn-primary">
                Submit Quiz
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayQuiz;
