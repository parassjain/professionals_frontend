import { useState, useRef, useEffect } from 'react';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { firebaseAuth } from '../firebase';
import { firebasePhoneVerify } from '../api/endpoints';
import { Phone, X } from 'lucide-react';

export default function PhoneVerifyModal({ onClose, onVerified }) {
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const confirmationRef = useRef(null);
  const recaptchaRef = useRef(null);

  useEffect(() => {
    return () => {
      if (recaptchaRef.current) {
        recaptchaRef.current.clear();
        recaptchaRef.current = null;
      }
    };
  }, []);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^\d{10}$/.test(phone.trim())) { setError('Enter a valid 10-digit mobile number.'); return; }

    setLoading(true);
    try {
      if (!recaptchaRef.current) {
        recaptchaRef.current = new RecaptchaVerifier(firebaseAuth, 'recaptcha-container', { size: 'invisible' });
      }
      const result = await signInWithPhoneNumber(firebaseAuth, `+91${phone.trim()}`, recaptchaRef.current);
      confirmationRef.current = result;
      setStep('otp');
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Check the phone number and try again.');
      if (recaptchaRef.current) {
        recaptchaRef.current.clear();
        recaptchaRef.current = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    if (!otp.trim()) { setError('Enter the OTP.'); return; }

    setLoading(true);
    try {
      const credential = await confirmationRef.current.confirm(otp.trim());
      const idToken = await credential.user.getIdToken();
      await firebasePhoneVerify(idToken);
      onVerified();
    } catch (err) {
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" style={{ maxWidth: 400 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>
            <Phone size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Verify Phone Number
          </h2>
          <button className="btn btn-sm btn-outline" onClick={onClose}><X size={14} /></button>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

        {step === 'phone' ? (
          <form onSubmit={handleSendOTP}>
            <div className="form-group">
              <label className="form-label">Phone number (with country code)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                <span style={{ padding: '0.55rem 0.75rem', background: 'var(--gray-100)', border: '1px solid var(--border)', borderRight: 'none', borderRadius: '6px 0 0 6px', color: 'var(--gray-600)', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>+91</span>
                <input
                  className="form-input"
                  style={{ borderRadius: '0 6px 6px 0' }}
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="98765 43210"
                  disabled={loading}
                  autoFocus
                />
              </div>
            </div>
            <div id="recaptcha-container" />
            <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
              {loading ? 'Sending…' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP}>
            <p className="text-muted" style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
              OTP sent to <strong>+91 {phone}</strong>.{' '}
              <button type="button" className="btn-link" onClick={() => { setStep('phone'); setOtp(''); setError(''); }}>
                Change number
              </button>
            </p>
            <div className="form-group">
              <label className="form-label">Enter OTP</label>
              <input
                className="form-input"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="6-digit code"
                disabled={loading}
                autoFocus
              />
            </div>
            <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
              {loading ? 'Verifying…' : 'Verify'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
