import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { submitFeedback } from '../api/endpoints';
import { MessageCircle, X, Send } from 'lucide-react';

function LinkedInIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

export default function Footer() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', feedback_type: 'feedback', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const openModal = () => {
    if (user) {
      setForm({ name: `${user.first_name} ${user.last_name}`.trim(), email: user.email, feedback_type: 'feedback', subject: '', message: '' });
    } else {
      setForm({ name: '', email: '', feedback_type: 'feedback', subject: '', message: '' });
    }
    setSuccess(false);
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      await submitFeedback(form);
      setSuccess(true);
      setTimeout(() => setShowModal(false), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="footer-brand">Contact Hub</div>
              <p className="footer-desc">Find trusted professionals for any service you need. Connect with verified experts in your area.</p>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <a
                  href="http://linkedin.com/company/contact-hub"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Contact Hub on LinkedIn"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'inherit', opacity: 0.75 }}
                >
                  <LinkedInIcon size={18} /> LinkedIn
                </a>
              </div>
            </div>
            <div>
              <h4>Quick Links</h4>
              <Link to="/professionals">Find Professionals</Link>
              <Link to="/jobs">Browse Jobs</Link>
              <Link to="/categories">Categories</Link>
              <Link to="/faq">FAQ</Link>
            </div>
            <div>
              <h4>Account</h4>
              <Link to="/login">Login</Link>
              <Link to="/register">Sign Up</Link>
              <Link to="/profile">My Profile</Link>
              <Link to="/about">About Us</Link>
            </div>
            <div>
              <h4>Legal</h4>
              <Link to="/legal">Legal Overview</Link>
              <Link to="/terms">Terms &amp; Conditions</Link>
              <Link to="/privacy">Privacy Policy</Link>
            </div>
            <div>
              <h4>Support</h4>
              <button onClick={openModal} className="btn-link" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit', font: 'inherit' }}>
                <MessageCircle size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                Contact & Feedback
              </button>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} Contact Hub. All rights reserved.</p>
            <p style={{ marginTop: '0.25rem', fontSize: '0.8rem', opacity: 0.6 }}>
              <Link to="/terms" style={{ color: 'inherit' }}>Terms</Link>
              {' · '}
              <Link to="/privacy" style={{ color: 'inherit' }}>Privacy</Link>
              {' · '}
              <Link to="/legal" style={{ color: 'inherit' }}>Legal</Link>
            </p>
          </div>
        </div>
      </footer>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Contact Us / Feedback</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            {success ? (
              <div className="modal-body" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <Send size={48} color="#22c55e" style={{ marginBottom: 16 }} />
                <h3>Thank you!</h3>
                <p className="text-muted">We've received your feedback and will get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="modal-body">
                {error && <div className="alert alert-error">{error}</div>}
                <div className="form-row">
                  <div className="form-group">
                    <label>Name *</label>
                    <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Type</label>
                    <select value={form.feedback_type} onChange={(e) => setForm({ ...form, feedback_type: e.target.value })}>
                      <option value="feedback">Feedback</option>
                      <option value="bug">Bug Report</option>
                      <option value="feature">Feature Request</option>
                      <option value="complaint">Complaint</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Subject *</label>
                    <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Message *</label>
                  <textarea rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required placeholder="Tell us what's on your mind..." />
                </div>
                <button type="submit" className="btn btn-primary" disabled={sending}>
                  {sending ? 'Sending...' : 'Submit'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
