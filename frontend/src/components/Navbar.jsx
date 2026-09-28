import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-900">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/dashboard" className="text-lg font-semibold text-white">
          Task Manager
        </Link>

        {user ? (
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-gray-300 sm:inline">Hi, {user.name}</span>
            <button
              className="btn btn-sm border border-gray-500 text-gray-100 hover:bg-gray-800"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Link to="/login" className="btn btn-sm border border-gray-500 text-gray-100 hover:bg-gray-800">
              Login
            </Link>
            <Link to="/register" className="btn btn-sm btn-primary">
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
