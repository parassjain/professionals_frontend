import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import { resendVerificationEmail } from '../api/endpoints';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { firebaseAuth } from '../firebase';
import { Mail, Lock, Eye, EyeOff, Phone } from 'lucide-react';

export default function Login() {
  const { login, googleLogin, phoneLogin } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('email'); // 'email' | 'phone'
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [emailUnverified, setEmailUnverified] = useState(false);
  const [resendStatus, setResendStatus] = useState(''); // '' | 'sending' | 'sent' | 'error'

  // Phone login state
  const [phoneStep, setPhoneStep] = useState('phone'); // 'phone' | 'otp'
  const [phoneNum, setPhoneNum] = useState('');
  const [otp, setOtp] = useState('');
  const confirmationRef = useRef(null);
  const recaptchaRef = useRef(null);

  useEffect(() => {
    return () => {
      if (recaptchaRef.current) { recaptchaRef.current.clear(); recaptchaRef.current = null; }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setEmailUnverified(false);
    setResendStatus('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.non_field_errors?.[0] || err.response?.data?.detail || '';
      if (msg.toLowerCase().includes('e-mail is not verified') || msg.toLowerCase().includes('email is not verified')) {
        setEmailUnverified(true);
      } else {
        setError(msg || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendStatus('sending');
    try {
      await resendVerificationEmail(form.email);
      setResendStatus('sent');
    } catch {
      setResendStatus('error');
    }
  };

  const handleSendPhoneOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (!recaptchaRef.current) {
        recaptchaRef.current = new RecaptchaVerifier(firebaseAuth, 'login-recaptcha-container', { size: 'invisible' });
      }
      const result = await signInWithPhoneNumber(firebaseAuth, phoneNum.trim(), recaptchaRef.current);
      confirmationRef.current = result;
      setPhoneStep('otp');
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Check the phone number and try again.');
      if (recaptchaRef.current) { recaptchaRef.current.clear(); recaptchaRef.current = null; }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPhoneOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const credential = await confirmationRef.current.confirm(otp.trim());
      const idToken = await credential.user.getIdToken();
      await phoneLogin(idToken);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async (response) => {
      setError('');
      setLoading(true);
      try {
        await googleLogin(response.code);
        navigate('/');
      } catch {
        setError('Google login failed. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => setError('Google login was cancelled.'),
  });

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Welcome Back</h1>
        <p className="text-muted">Sign in to your account</p>

        <button className="btn btn-google" onClick={handleGoogleLogin} disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Continue with Google
        </button>

        <div className="divider"><span>or</span></div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, marginBottom: '1.25rem', borderBottom: '1px solid var(--border)' }}>
          <button
            type="button"
            onClick={() => { setTab('email'); setError(''); }}
            style={{
              flex: 1, padding: '0.6rem', background: 'none', border: 'none', cursor: 'pointer',
              fontWeight: tab === 'email' ? 600 : 400,
              color: tab === 'email' ? 'var(--primary)' : 'var(--gray-500)',
              borderBottom: tab === 'email' ? '2px solid var(--primary)' : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            <Mail size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Email
          </button>
          <button
            type="button"
            onClick={() => { setTab('phone'); setError(''); setPhoneStep('phone'); setOtp(''); }}
            style={{
              flex: 1, padding: '0.6rem', background: 'none', border: 'none', cursor: 'pointer',
              fontWeight: tab === 'phone' ? 600 : 400,
              color: tab === 'phone' ? 'var(--primary)' : 'var(--gray-500)',
              borderBottom: tab === 'phone' ? '2px solid var(--primary)' : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            <Phone size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Phone
          </button>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

        {tab === 'email' ? (
          <>
            {emailUnverified && (
              <div className="alert alert-error" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1rem' }}>
                <span>Your email is not verified. Please check your inbox or resend the verification email.</span>
                {resendStatus === 'sent' ? (
                  <span style={{ color: '#16a34a', fontWeight: 500 }}>✓ Verification email sent — check your inbox.</span>
                ) : resendStatus === 'error' ? (
                  <span style={{ color: '#dc2626' }}>Failed to resend. Try again later.</span>
                ) : (
                  <button type="button" className="btn btn-sm btn-outline" onClick={handleResend} disabled={resendStatus === 'sending'} style={{ alignSelf: 'flex-start' }}>
                    {resendStatus === 'sending' ? 'Sending...' : 'Resend verification email'}
                  </button>
                )}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label><Mail size={16} /> Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="you@example.com" />
              </div>
              <div className="form-group">
                <label><Lock size={16} /> Password</label>
                <div className="input-with-icon">
                  <input type={showPw ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required placeholder="Your password" />
                  <button type="button" className="icon-btn" onClick={() => setShowPw(!showPw)}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </>
        ) : (
          <>
            {phoneStep === 'phone' ? (
              <form onSubmit={handleSendPhoneOTP}>
                <div className="form-group">
                  <label><Phone size={16} /> Phone number</label>
                  <input type="tel" value={phoneNum} onChange={(e) => setPhoneNum(e.target.value)} required placeholder="+91 98765 43210" disabled={loading} autoFocus />
                  <p className="text-muted text-sm" style={{ marginTop: 4 }}>Include country code, e.g. +91 for India.</p>
                </div>
                <div id="login-recaptcha-container" />
                <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                  {loading ? 'Sending…' : 'Send OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyPhoneOTP}>
                <p className="text-muted" style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
                  OTP sent to <strong>{phoneNum}</strong>.{' '}
                  <button type="button" className="btn-link" onClick={() => { setPhoneStep('phone'); setOtp(''); setError(''); }}>Change</button>
                </p>
                <div className="form-group">
                  <label>Enter OTP</label>
                  <input type="text" inputMode="numeric" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} placeholder="6-digit code" disabled={loading} autoFocus />
                </div>
                <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                  {loading ? 'Verifying…' : 'Verify & Sign In'}
                </button>
              </form>
            )}
          </>
        )}

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
