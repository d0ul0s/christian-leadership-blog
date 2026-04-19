import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Key } from 'lucide-react';
import SEO from '../components/SEO';

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [userId, setUserId] = useState(location.state?.userId || '');
  const [email, setEmail] = useState(location.state?.email || '');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (!userId) {
      setMessage({ type: 'error', text: 'Missing user ID. Please try logging in to resend code.' });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, code })
      });
      const data = await response.json();
      
      if (response.ok) {
        login({ _id: data._id, fullName: data.fullName, email: data.email, isAdmin: data.isAdmin, profilePicture: data.profilePicture });
        navigate('/');
      } else {
        setMessage({ type: 'error', text: data.message || 'Verification failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Server error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!userId) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/resend-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await response.json();
      if (response.ok) {
        setMessage({ type: 'success', text: 'New code sent! Check your email (or terminal console).' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to resend code' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Server error' });
    }
  };

  return (
    <div className="register-page animate-fade-in">
      <SEO title="Verify Email" description="Verify your email address." />
      <div className="container register-container">
        <div className="glass-panel" style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
          <h1 className="hero-title text-gradient" style={{ fontSize: '2rem' }}>Verify Email</h1>
          <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
            We sent a 6-digit code to {email || 'your email address'}.
          </p>
          
          {message && (
            <div className={`form-message ${message.type === 'success' ? 'success' : 'error'}`} style={{ marginBottom: '1rem', padding: '1rem', borderRadius: '8px', backgroundColor: message.type === 'success' ? 'rgba(30, 215, 96, 0.1)' : 'rgba(226, 33, 52, 0.1)', color: message.type === 'success' ? '#1ed760' : '#e22134', fontWeight: 'bold' }}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-group input-with-icon">
              <div className="input-icon-wrapper">
                <Key size={18} className="input-icon" />
                <input 
                  type="text" 
                  value={code} 
                  onChange={(e) => setCode(e.target.value)} 
                  className="form-control has-icon" 
                  placeholder="Enter 6-digit code" 
                  required 
                  maxLength="6"
                  style={{ textAlign: 'center', letterSpacing: '2px', fontSize: '1.2rem' }}
                />
              </div>
            </div>
            <button type="submit" className="btn-primary" disabled={isLoading} style={{ width: '100%', marginTop: '1rem' }}>
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>
          
          <div style={{ marginTop: '1.5rem' }}>
            <button onClick={handleResend} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', textDecoration: 'underline', cursor: 'pointer' }}>
              Didn't receive a code? Resend
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
