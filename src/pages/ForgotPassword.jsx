import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Key, Lock, Eye, EyeOff } from 'lucide-react';
import SEO from '../components/SEO';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Reset code sent to your email.' });
        setStep(2);
      } else {
        setMessage({ type: 'error', text: data.message || 'Request failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Server error.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return setMessage({ type: 'error', text: 'Passwords do not match' });
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword })
      });
      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Password reset successful! You can now log in.' });
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Reset failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Server error.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page animate-fade-in">
      <SEO title="Forgot Password" description="Reset your password." />
      <div className="container register-container">
        <div className="glass-panel" style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
          <h1 className="hero-title text-gradient" style={{ fontSize: '2rem' }}>Reset Password</h1>

          {message && (
            <div className={`form-message ${message.type === 'success' ? 'success' : 'error'}`} style={{ marginBottom: '1.5rem', padding: '1rem', borderRadius: '8px', backgroundColor: message.type === 'success' ? 'rgba(30, 215, 96, 0.1)' : 'rgba(226, 33, 52, 0.1)', color: message.type === 'success' ? '#1ed760' : '#e22134', fontWeight: 'bold' }}>
              {message.text}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleRequestCode} className="register-form">
              <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                Enter your registered email address to receive a password reset code.
              </p>
              <div className="form-group input-with-icon">
                <div className="input-icon-wrapper">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-control has-icon"
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary" disabled={isLoading} style={{ width: '100%', marginTop: '1rem' }}>
                {isLoading ? 'Sending...' : 'Send Reset Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="register-form">
              <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                Enter the 6-digit code sent to {email} and your new password.
              </p>
              <div className="form-group input-with-icon">
                <div className="input-icon-wrapper">
                  <Key size={18} className="input-icon" />
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="form-control has-icon"
                    placeholder="6-digit reset code"
                    required
                    maxLength="6"
                    style={{ textAlign: 'center', letterSpacing: '2px' }}
                  />
                </div>
              </div>

              <div className="form-group input-with-icon">
                <div className="input-icon-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="form-control has-icon"
                    placeholder="New Password"
                    required
                    minLength="6"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} aria-label="Toggle visibility" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group input-with-icon">
                <div className="input-icon-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-control has-icon"
                    placeholder="Confirm New Password"
                    required
                    minLength="6"
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={isLoading} style={{ width: '100%', marginTop: '1rem' }}>
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          <div style={{ marginTop: '1.5rem' }}>
            <Link to="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'underline' }}>Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
