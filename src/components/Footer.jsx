import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <h3>Contact Hub</h3>
            <p>Find trusted professionals for any service you need.</p>
          </div>
          <div>
            <h4>Quick Links</h4>
            <Link to="/professionals">Find Professionals</Link>
            <Link to="/jobs">Browse Jobs</Link>
            <Link to="/categories">Categories</Link>
          </div>
          <div>
            <h4>Account</h4>
            <Link to="/login">Login</Link>
            <Link to="/register">Sign Up</Link>
            <Link to="/profile">My Profile</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Contact Hub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
