import { Link } from 'react-router-dom';
import { PlayCircle, PlusCircle, Trophy } from 'lucide-react';

const Home = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-6xl font-bold text-white mb-6">
          Welcome to Quiz Mania
        </h1>
        <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
          Create engaging quizzes, challenge your friends, and track your progress.
          The ultimate platform for interactive learning and fun competitions.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div className="card text-center hover:shadow-2xl transition-shadow">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary-100 rounded-full">
              <PlusCircle size={48} className="text-primary-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Create Quizzes</h3>
          <p className="text-gray-600 mb-6">
            Design custom quizzes with multiple question types, images, and timers.
            Perfect for teachers, trainers, and content creators.
          </p>
          <Link to="/quiz/create" className="btn-primary inline-block">
            Get Started
          </Link>
        </div>

        <div className="card text-center hover:shadow-2xl transition-shadow">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-green-100 rounded-full">
              <PlayCircle size={48} className="text-green-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Join & Play</h3>
          <p className="text-gray-600 mb-6">
            Enter a quiz code and start playing instantly. Compete with others
            and see how you rank on the leaderboard.
          </p>
          <Link to="/quiz/join" className="btn-primary inline-block">
            Join Quiz
          </Link>
        </div>

        <div className="card text-center hover:shadow-2xl transition-shadow">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-yellow-100 rounded-full">
              <Trophy size={48} className="text-yellow-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Track Progress</h3>
          <p className="text-gray-600 mb-6">
            View detailed analytics, track your performance over time,
            and celebrate your achievements with badges.
          </p>
          <Link to="/my-results" className="btn-primary inline-block">
            View Results
          </Link>
        </div>
      </div>

      <div className="mt-20 text-center">
        <h2 className="text-4xl font-bold text-white mb-6">
          Why Choose Quiz Mania?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mt-10">
          {[
            { icon: '⚡', title: 'Lightning Fast', desc: 'Real-time quiz experience' },
            { icon: '🎨', title: 'Customizable', desc: 'Design your perfect quiz' },
            { icon: '📊', title: 'Analytics', desc: 'Detailed performance insights' },
            { icon: '🔒', title: 'Secure', desc: 'Your data is protected' },
          ].map((feature, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-white">
              <div className="text-4xl mb-3">{feature.icon}</div>
              <h4 className="text-xl font-bold mb-2">{feature.title}</h4>
              <p className="text-purple-100">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
