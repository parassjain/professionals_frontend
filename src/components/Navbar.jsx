import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LogOut, Briefcase, Search, LayoutDashboard, User, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">Contact Hub</Link>

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
              {user?.is_staff && (
                <Link to="/admin" onClick={() => setOpen(false)} className="btn btn-sm" style={{ background: 'var(--gray-800)', color: 'white' }}>
                  <LayoutDashboard size={16} /> Admin
                </Link>
              )}
              <div className="profile-menu" ref={profileRef}>
                <button className="profile-menu-trigger" onClick={() => setProfileOpen(p => !p)}>
                  <div className="avatar avatar-sm">
                    {(user?.avatar || user?.avatar_url)
                      ? <img src={user.avatar || user.avatar_url} alt="" />
                      : <span>{user?.first_name?.[0]}{user?.last_name?.[0]}</span>}
                  </div>
                  {user?.first_name || 'Profile'}
                  <ChevronDown size={14} />
                </button>
                {profileOpen && (
                  <div className="profile-dropdown">
                    <Link to="/profile" onClick={() => { setProfileOpen(false); setOpen(false); }}>
                      <User size={14} /> Profile
                    </Link>
                    <button className="logout-item" onClick={handleLogout}>
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                )}
              </div>
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
