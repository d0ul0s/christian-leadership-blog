import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, Mail, Image as ImageIcon, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
  const [profilePic, setProfilePic] = useState(null);
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

    let uploadedImageUrl = '';

    try {
      if (profilePic) {
        const formDataUpload = new FormData();
        formDataUpload.append('image', profilePic);
        
        const uploadRes = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
          method: 'POST',
          body: formDataUpload
        });
        
        const uploadData = await uploadRes.json();
        if (uploadRes.ok) {
          uploadedImageUrl = uploadData.url;
        } else {
          setMessage({ type: 'error', text: 'Image upload failed: ' + (uploadData.message || 'Unknown error') });
          setIsLoading(false);
          return;
        }
      }

      const payload = { ...formData, profilePicture: uploadedImageUrl };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        if (data.requiresVerification) {
          navigate('/verify', { state: { userId: data.userId, email: formData.email } });
        } else {
          login({ _id: data._id, fullName: data.fullName, email: data.email, isAdmin: data.isAdmin, profilePicture: data.profilePicture });
          setMessage({ type: 'success', text: 'Registration successful! You are now signed in.' });
          setFormData({ fullName: '', email: '', password: '' });
          setProfilePic(null);
        }
      } else {
        setMessage({ type: 'error', text: data.message || 'Registration failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Server error. Is the backend running on port 5000?' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page animate-fade-in">
      <SEO title="Create Account" description="Join the conversation today." />
      <div className="container register-container">
        <div className="register-box glass-panel delay-100">
          <div className="register-header">
            <h1 className="hero-title text-gradient">Join the Community</h1>
            <p>Create an account to participate in discussions and get updates when I post.</p>
          </div>
          
          {message && (
            <div className={`form-message ${message.type === 'success' ? 'success' : 'error'}`} style={{ marginBottom: '1rem', padding: '1rem', borderRadius: '8px', backgroundColor: message.type === 'success' ? 'rgba(30, 215, 96, 0.1)' : 'rgba(226, 33, 52, 0.1)', color: message.type === 'success' ? '#1ed760' : '#e22134', textAlign: 'center', fontWeight: 'bold' }}>
              {message.text}
            </div>
          )}
          
          <form className="register-form" onSubmit={handleSubmit}>
            <div className="form-group input-with-icon">
              <label htmlFor="fullName">Full Name</label>
              <div className="input-icon-wrapper">
                <User size={18} className="input-icon" />
                <input type="text" id="fullName" value={formData.fullName} onChange={handleChange} className="form-control has-icon" placeholder="Dietrich Bonhoeffer" required />
              </div>
            </div>
            
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

            <div className="form-group input-with-icon">
              <label htmlFor="profilePicture">Profile Picture (Optional)</label>
              <div className="input-icon-wrapper">
                <ImageIcon size={18} className="input-icon" />
                <input 
                  type="file" 
                  id="profilePicture" 
                  accept="image/*"
                  onChange={(e) => setProfilePic(e.target.files[0])} 
                  className="form-control has-icon" 
                  style={{ padding: '0.6rem 0.6rem 0.6rem 2.8rem' }}
                />
              </div>
            </div>
            
            <div className="form-check">
              <input type="checkbox" id="terms" className="checkbox-custom" required />
              <label htmlFor="terms">I agree to the <Link to="/terms" className="text-link" target="_blank">Terms of Service</Link> and <Link to="/privacy" className="text-link" target="_blank">Privacy Policy</Link></label>
            </div>
            
            <button type="submit" className="btn-primary form-submit" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
            
            <div className="register-footer">
              <p>Already have an account? <Link to="/login" className="text-link">Sign In</Link></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
