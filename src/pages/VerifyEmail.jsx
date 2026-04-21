import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { verifyEmail } from '../api/endpoints';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying | success | error

  useEffect(() => {
    const key = searchParams.get('key');
    if (!key) {
      setStatus('error');
      return;
    }
    verifyEmail(key)
      .then(() => {
        setStatus('success');
        setTimeout(() => navigate('/login'), 3000);
      })
      .catch(() => setStatus('error'));
  }, []);// eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        {status === 'verifying' && (
          <>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
            <h1>Verifying...</h1>
            <p className="text-muted">Please wait while we verify your email.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h1>Email Verified!</h1>
            <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
              Your account is now active. Redirecting to login...
            </p>
            <Link to="/login" className="btn btn-primary">Sign In Now</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
            <h1>Verification Failed</h1>
            <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
              This link is invalid or has already been used.
            </p>
            <Link to="/register" className="btn btn-outline">Register Again</Link>
          </>
        )}
      </div>
    </div>
  );
}
