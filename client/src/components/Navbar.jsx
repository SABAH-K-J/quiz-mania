import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, Home, PlusCircle, ListChecks, BarChart3 } from 'lucide-react';
import useAuthStore from '../store/authStore';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-white">
              🎯 Quiz Mania
            </div>
          </Link>

          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className="text-white hover:text-purple-200 transition-colors flex items-center space-x-1"
            >
              <Home size={18} />
              <span>Home</span>
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-white hover:text-purple-200 transition-colors flex items-center space-x-1"
                >
                  <ListChecks size={18} />
                  <span>Dashboard</span>
                </Link>

                <Link
                  to="/quiz/create"
                  className="text-white hover:text-purple-200 transition-colors flex items-center space-x-1"
                >
                  <PlusCircle size={18} />
                  <span>Create Quiz</span>
                </Link>

                <Link
                  to="/my-results"
                  className="text-white hover:text-purple-200 transition-colors flex items-center space-x-1"
                >
                  <BarChart3 size={18} />
                  <span>My Results</span>
                </Link>

                <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-white/30">
                  <div className="flex items-center space-x-2 text-white">
                    <User size={18} />
                    <span className="text-sm">{user?.username}</span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 px-4 py-2 bg-red-500/80 hover:bg-red-600 text-white rounded-lg transition-colors"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="px-4 py-2 text-white hover:text-purple-200 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-semibold"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
