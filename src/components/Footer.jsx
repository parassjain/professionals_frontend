import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { submitFeedback } from '../api/endpoints';
import { MessageCircle, X, Send } from 'lucide-react';

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
              <h3>Contact Hub</h3>
              <p>Find trusted professionals for any service you need.</p>
            </div>
            <div>
              <h4>Quick Links</h4>
              <Link to="/professionals">Find Professionals</Link>
              <Link to="/jobs">Browse Work</Link>
              <Link to="/categories">Categories</Link>
            </div>
            <div>
              <h4>Account</h4>
              <Link to="/login">Login</Link>
              <Link to="/register">Sign Up</Link>
              <Link to="/profile">My Profile</Link>
            </div>
            <div>
              <h4>Contact & Feedback</h4>
              <button onClick={openModal} className="btn-link" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit', font: 'inherit' }}>
                <MessageCircle size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                Contact Us / Feedback
              </button>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} Contact Hub. All rights reserved.</p>
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