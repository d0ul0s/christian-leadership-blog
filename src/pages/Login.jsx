import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';
import './Register.css'; // Reusing Register's premium CSS

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        login(data);
        setMessage({ type: 'success', text: 'Login successful! Taking you to the essays...' });
        
        // Redirect to exact destination
        setTimeout(() => {
          navigate('/articles');
        }, 1500);
      } else {
        if (data.requiresVerification) {
          navigate('/verify', { state: { userId: data.userId, email: formData.email } });
        } else {
          setMessage({ type: 'error', text: data.message || 'Login failed' });
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: `Debug Error: ${error.message} - Check terminal for Node crashes, or make sure you successfully stopped and restarted index.js.` });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page animate-fade-in">
      <SEO title="Sign In" description="Log in to your account." />
      <div className="container register-container">
        <div className="register-box glass-panel delay-100">
          <div className="register-header">
            <h1 className="hero-title text-gradient">Welcome Back</h1>
            <p>Sign in to your account to continue reading and discussing.</p>
          </div>
          
          {message && (
            <div className={`form-message ${message.type === 'success' ? 'success' : 'error'}`} style={{ marginBottom: '1rem', padding: '1rem', borderRadius: '8px', backgroundColor: message.type === 'success' ? 'rgba(30, 215, 96, 0.1)' : 'rgba(226, 33, 52, 0.1)', color: message.type === 'success' ? '#1ed760' : '#e22134', textAlign: 'center', fontWeight: 'bold' }}>
              {message.text}
            </div>
          )}
          
          <form className="register-form" onSubmit={handleSubmit}>
            <div className="form-group input-with-icon">
              <label htmlFor="email">Email Address</label>
              <div className="input-icon-wrapper">
                <Mail size={18} className="input-icon" />
                <input type="email" id="email" value={formData.email} onChange={handleChange} className="form-control has-icon" placeholder="name@example.com" required />
              </div>
            </div>
            
            <div className="form-group input-with-icon">
              <label htmlFor="password">Password</label>
              <div className="input-icon-wrapper" style={{ position: 'relative' }}>
                <Lock size={18} className="input-icon" />
                <input type={showPassword ? 'text' : 'password'} id="password" value={formData.password} onChange={handleChange} className="form-control has-icon" placeholder="••••••••" required style={{ paddingRight: '2.8rem' }} />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <button type="submit" className="btn-primary form-submit" disabled={isLoading}>
              {isLoading ? 'Authenticating...' : 'Sign In'}
            </button>
            
            <div className="register-footer">
              <p style={{ marginBottom: '0.5rem' }}><Link to="/forgot-password" className="text-link">Forgot Password?</Link></p>
              <p>Don't have an account? <Link to="/register" className="text-link">Create Account</Link></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
