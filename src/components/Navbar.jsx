import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, User, LogOut, Briefcase, Search } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">ProConnect</Link>

        <button className="mobile-menu-btn" onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`navbar-links ${open ? 'open' : ''}`}>
          <Link to="/professionals" onClick={() => setOpen(false)}>
            <Search size={16} /> Find Professionals
          </Link>
          <Link to="/jobs" onClick={() => setOpen(false)}>
            <Briefcase size={16} /> Jobs
          </Link>
          <Link to="/categories" onClick={() => setOpen(false)}>
            Categories
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/profile" onClick={() => setOpen(false)}>
                <User size={16} /> {user?.first_name || 'Profile'}
              </Link>
              {!user?.is_professional && (
                <Link to="/become-professional" className="btn btn-sm btn-primary" onClick={() => setOpen(false)}>
                  Become a Pro
                </Link>
              )}
              <button className="btn btn-sm btn-outline" onClick={handleLogout}>
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-sm btn-outline" onClick={() => setOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="btn btn-sm btn-primary" onClick={() => setOpen(false)}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
