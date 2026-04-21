import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import { Mail, Lock, User, Phone, MapPin, Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password1: '', password2: '', first_name: '', last_name: '', phone: '', city: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const [emailSent, setEmailSent] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      await register(form);
      setRegisteredEmail(form.email);
      setEmailSent(true);
    } catch (err) {
      const data = err.response?.data || {};
      if (typeof data === 'object') setErrors(data);
      else setErrors({ general: 'Registration failed.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async (response) => {
      setErrors({});
      setLoading(true);
      try {
        await googleLogin(response.code);
        navigate('/');
      } catch {
        setErrors({ general: 'Google login failed.' });
      } finally {
        setLoading(false);
      }
    },
    onError: () => setErrors({ general: 'Google login was cancelled.' }),
  });

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  if (emailSent) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
          <h1>Check your email</h1>
          <p className="text-muted" style={{ marginBottom: '0.5rem' }}>
            We sent a verification link to
          </p>
          <p style={{ fontWeight: 600, marginBottom: '1.5rem' }}>{registeredEmail}</p>
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>
            Click the link in the email to activate your account. Check your spam folder if you don't see it.
          </p>
          <p className="auth-footer" style={{ marginTop: '2rem' }}>
            Already verified? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create Account</h1>
        <p className="text-muted">Join Contact Hub today</p>

        {errors.general && <div className="alert alert-error">{errors.general}</div>}
        {errors.non_field_errors && <div className="alert alert-error">{errors.non_field_errors[0]}</div>}

        <button className="btn btn-google" onClick={handleGoogleLogin} disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Continue with Google
        </button>

        <div className="divider"><span>or</span></div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label><User size={16} /> First Name *</label>
              <input type="text" value={form.first_name} onChange={set('first_name')} required placeholder="John" />
              {errors.first_name && <span className="field-error">{errors.first_name}</span>}
            </div>
            <div className="form-group">
              <label><User size={16} /> Last Name *</label>
              <input type="text" value={form.last_name} onChange={set('last_name')} required placeholder="Doe" />
              {errors.last_name && <span className="field-error">{errors.last_name}</span>}
            </div>
          </div>
          <div className="form-group">
            <label><Mail size={16} /> Email *</label>
            <input type="email" value={form.email} onChange={set('email')} required placeholder="you@example.com" />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label><Phone size={16} /> Phone</label>
              <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+1 234 567 890" />
            </div>
            <div className="form-group">
              <label><MapPin size={16} /> City</label>
              <input type="text" value={form.city} onChange={set('city')} placeholder="New York" />
            </div>
          </div>
          <div className="form-group">
            <label><Lock size={16} /> Password *</label>
            <div className="input-with-icon">
              <input type={showPw ? 'text' : 'password'} value={form.password1} onChange={set('password1')} required placeholder="Min 8 characters" />
              <button type="button" className="icon-btn" onClick={() => setShowPw(!showPw)}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password1 && <span className="field-error">{errors.password1}</span>}
          </div>
          <div className="form-group">
            <label><Lock size={16} /> Confirm Password *</label>
            <input type="password" value={form.password2} onChange={set('password2')} required placeholder="Repeat password" />
            {errors.password2 && <span className="field-error">{errors.password2}</span>}
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
