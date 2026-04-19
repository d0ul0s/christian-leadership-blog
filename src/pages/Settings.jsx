import { useState, useEffect } from 'react';
import { User, Lock, Mail, Image as ImageIcon, Eye, EyeOff, Trash2, Upload, Monitor, Feather, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useConfirm } from '../context/ConfirmContext';
import { useToast } from '../context/ToastContext';
import SEO from '../components/SEO';

const Settings = () => {
  const { currentUser, login, logout } = useAuth();
  const { confirm } = useConfirm();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const [animSpeed, setAnimSpeed] = useState(localStorage.getItem('animationSpeed') || 'slow');
  const handleAnimChange = (e) => {
    const val = e.target.value;
    setAnimSpeed(val);
    localStorage.setItem('animationSpeed', val);
    document.body.setAttribute('data-animation', val);
    showToast("Animation preference applied!", "success");
  };

  const [infoData, setInfoData] = useState({ fullName: '', email: '' });
  const [infoMessage, setInfoMessage] = useState(null);
  const [isInfoLoading, setIsInfoLoading] = useState(false);

  const [passData, setPassData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [passMessage, setPassMessage] = useState(null);
  const [isPassLoading, setIsPassLoading] = useState(false);

  const [profilePic, setProfilePic] = useState(null);
  const [picMessage, setPicMessage] = useState(null);
  const [isPicLoading, setIsPicLoading] = useState(false);

  // Author profile (admin only)
  const [authorData, setAuthorData] = useState({ authorName: '', authorBio: '', authorAvatar: '' });
  const [authorMessage, setAuthorMessage] = useState(null);
  const [isAuthorLoading, setIsAuthorLoading] = useState(false);

  // Account deletion
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setInfoData({ fullName: currentUser.fullName || '', email: currentUser.email || '' });
      setAuthorData({
        authorName: currentUser.authorName || '',
        authorBio: currentUser.authorBio || '',
        authorAvatar: currentUser.authorAvatar || ''
      });
    }
  }, [currentUser]);

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    setIsInfoLoading(true);
    setInfoMessage(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/profile/${currentUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: infoData.fullName, email: infoData.email })
      });
      const data = await response.json();
      if (response.ok) {
        login({ ...currentUser, fullName: data.fullName, email: data.email });
        setInfoMessage({ type: 'success', text: 'Profile info updated!' });
      } else {
        setInfoMessage({ type: 'error', text: data.message || 'Update failed' });
      }
    } catch (err) {
      setInfoMessage({ type: 'error', text: 'Server error. Is the backend running?' });
    } finally {
      setIsInfoLoading(false);
    }
  };

  const handlePassSubmit = async (e) => {
    e.preventDefault();
    setPassMessage(null);
    if (passData.newPassword !== passData.confirmPassword) {
      return setPassMessage({ type: 'error', text: 'New passwords do not match' });
    }
    setIsPassLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/profile/${currentUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          currentPassword: passData.currentPassword, 
          newPassword: passData.newPassword 
        })
      });
      const data = await response.json();
      if (response.ok) {
        setPassMessage({ type: 'success', text: 'Password updated successfully!' });
        setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPassMessage({ type: 'error', text: data.message || 'Password update failed' });
      }
    } catch (err) {
      setPassMessage({ type: 'error', text: 'Server error. Is the backend running?' });
    } finally {
      setIsPassLoading(false);
    }
  };

  const handlePicSubmit = async (e) => {
    e.preventDefault();
    if (!profilePic) return setPicMessage({ type: 'error', text: 'Please select an image first.' });
    
    setIsPicLoading(true);
    setPicMessage(null);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('image', profilePic);
      
      const uploadRes = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
        method: 'POST',
        body: formDataUpload
      });
      const uploadData = await uploadRes.json();
      
      if (!uploadRes.ok) {
        throw new Error(uploadData.message || 'Image upload failed');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/profile/${currentUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profilePicture: uploadData.url })
      });
      const data = await response.json();
      
      if (response.ok) {
        login({ ...currentUser, profilePicture: data.profilePicture });
        setPicMessage({ type: 'success', text: 'Profile picture updated!' });
        setProfilePic(null);
        document.getElementById('profilePicture').value = '';
      } else {
        throw new Error(data.message || 'Failed to update profile picture');
      }
    } catch (err) {
      setPicMessage({ type: 'error', text: err.message || 'Server error.' });
    } finally {
      setIsPicLoading(false);
    }
  };

  const handlePicRemove = async () => {
    if (!currentUser.profilePicture) return;
    const isConfirmed = await confirm("Are you sure you want to remove your profile picture?");
    if (!isConfirmed) return;
    
    setIsPicLoading(true);
    setPicMessage(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/profile/${currentUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ removeProfilePicture: true })
      });
      const data = await response.json();
      if (response.ok) {
        login({ ...currentUser, profilePicture: '' });
        setPicMessage({ type: 'success', text: 'Profile picture removed!' });
        setProfilePic(null);
        if (document.getElementById('profilePicture')) document.getElementById('profilePicture').value = '';
      } else {
        throw new Error(data.message || 'Failed to remove picture');
      }
    } catch (err) {
      setPicMessage({ type: 'error', text: err.message || 'Server error.' });
    } finally {
      setIsPicLoading(false);
    }
  };

  const handleAuthorSubmit = async (e) => {
    e.preventDefault();
    setIsAuthorLoading(true);
    setAuthorMessage(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/author-profile/${currentUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authorData)
      });
      const data = await res.json();
      if (res.ok) {
        login({ ...currentUser, authorName: data.authorName, authorBio: data.authorBio, authorAvatar: data.authorAvatar });
        setAuthorMessage({ type: 'success', text: 'Author profile updated!' });
      } else {
        setAuthorMessage({ type: 'error', text: data.message || 'Update failed' });
      }
    } catch (err) {
      setAuthorMessage({ type: 'error', text: 'Server error.' });
    } finally {
      setIsAuthorLoading(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    const confirmed = await confirm('This is permanent. Your comments will be anonymized. Are you absolutely sure you want to delete your account?');
    if (!confirmed) return;
    setIsDeleteLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/me/account`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser._id, password: deletePassword })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Account deleted. Goodbye.', 'success');
        logout();
        navigate('/');
      } else {
        showToast(data.message || 'Deletion failed.', 'error');
      }
    } catch (err) {
      showToast('Server error.', 'error');
    } finally {
      setIsDeleteLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <h2>Please log in to view settings.</h2>
      </div>
    );
  }

  const getAvatarUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const baseUrl = (import.meta.env.VITE_API_URL || '').endsWith('/') 
      ? import.meta.env.VITE_API_URL.slice(0, -1) 
      : import.meta.env.VITE_API_URL;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
  };

  return (
    <div className="animate-fade-in" style={{ padding: '4rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
      <SEO title="Settings" description="Update your user profile and settings" />
      
      <h1 className="hero-title text-gradient" style={{ fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'center' }}>Account Settings</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Appearance Preferences Section */}
        <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
             <Monitor size={20} className="text-gradient" /> Appearance Settings
          </h2>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="animSpeed">Interface Animation Speed</label>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Control how fast page transitions and pop-in effects occur.
            </p>
            <select 
              id="animSpeed" 
              value={animSpeed} 
              onChange={handleAnimChange} 
              className="form-control" 
              style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', cursor: 'pointer' }}
            >
              <option value="slow">Slow & Elegant (0.8s Default)</option>
              <option value="fast">Lightning Fast (0.2s Snappy)</option>
              <option value="none">Disabled (Instant)</option>
            </select>
          </div>
        </div>

        {/* Profile Picture Section */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Profile Picture</h2>
          
          {picMessage && (
            <div className={`form-message ${picMessage.type === 'success' ? 'success' : 'error'}`} style={{ marginBottom: '1.5rem', padding: '1rem', borderRadius: '8px', backgroundColor: picMessage.type === 'success' ? 'rgba(30, 215, 96, 0.1)' : 'rgba(226, 33, 52, 0.1)', color: picMessage.type === 'success' ? '#1ed760' : '#e22134', fontWeight: 'bold' }}>
              {picMessage.text}
            </div>
          )}
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            {currentUser.profilePicture ? (
              <img 
                src={getAvatarUrl(currentUser.profilePicture)} 
                alt="Profile" 
                onError={(e) => { e.target.onerror = null; e.target.src = "https://ui-avatars.com/api/?name=" + currentUser.fullName + "&background=random";}}
                style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--accent-gold)' }} 
              />
            ) : (
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)' }}>
                <User size={50} style={{ color: 'var(--text-secondary)' }} />
              </div>
            )}
            
            <form onSubmit={handlePicSubmit} style={{ flex: 1, minWidth: '250px' }}>
              <div className="form-group input-with-icon" style={{ marginBottom: '1rem' }}>
                <div className="input-icon-wrapper">
                  <ImageIcon size={18} className="input-icon" />
                  <input 
                    type="file" 
                    id="profilePicture" 
                    accept="image/*"
                    onChange={(e) => setProfilePic(e.target.files[0])} 
                    className="form-control" 
                    style={{ padding: '0.6rem 0.6rem 0.6rem 2.8rem' }}
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn-primary" disabled={isPicLoading || !profilePic} style={{ flex: 1, padding: '0.6rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                  <Upload size={18} /> {isPicLoading ? 'Uploading...' : 'Upload New'}
                </button>
                {currentUser.profilePicture && (
                  <button type="button" onClick={handlePicRemove} disabled={isPicLoading} style={{ flex: 1, padding: '0.6rem', background: 'rgba(226, 33, 52, 0.1)', color: '#e22134', border: '1px solid rgba(226, 33, 52, 0.2)', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s' }}>
                    <Trash2 size={18} /> Remove
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Profile Information Section */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Personal Information</h2>
          
          {infoMessage && (
            <div className={`form-message ${infoMessage.type === 'success' ? 'success' : 'error'}`} style={{ marginBottom: '1.5rem', padding: '1rem', borderRadius: '8px', backgroundColor: infoMessage.type === 'success' ? 'rgba(30, 215, 96, 0.1)' : 'rgba(226, 33, 52, 0.1)', color: infoMessage.type === 'success' ? '#1ed760' : '#e22134', fontWeight: 'bold' }}>
              {infoMessage.text}
            </div>
          )}
          
          <form onSubmit={handleInfoSubmit} className="register-form">
            <div className="form-group input-with-icon">
              <label htmlFor="fullName">Full Name</label>
              <div className="input-icon-wrapper">
                <User size={18} className="input-icon" />
                <input type="text" id="fullName" value={infoData.fullName} onChange={(e) => setInfoData({...infoData, fullName: e.target.value})} className="form-control has-icon" required />
              </div>
            </div>
            
            <div className="form-group input-with-icon" style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="email">Email Address</label>
              <div className="input-icon-wrapper">
                <Mail size={18} className="input-icon" />
                <input type="email" id="email" value={infoData.email} onChange={(e) => setInfoData({...infoData, email: e.target.value})} className="form-control has-icon" required />
              </div>
            </div>
            
            <button type="submit" className="btn-primary" disabled={isInfoLoading}>
              {isInfoLoading ? 'Saving...' : 'Save Personal Info'}
            </button>
          </form>
        </div>

        {/* Change Password Section */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Change Password</h2>
          
          {passMessage && (
            <div className={`form-message ${passMessage.type === 'success' ? 'success' : 'error'}`} style={{ marginBottom: '1.5rem', padding: '1rem', borderRadius: '8px', backgroundColor: passMessage.type === 'success' ? 'rgba(30, 215, 96, 0.1)' : 'rgba(226, 33, 52, 0.1)', color: passMessage.type === 'success' ? '#1ed760' : '#e22134', fontWeight: 'bold' }}>
              {passMessage.text}
            </div>
          )}
          
          <form onSubmit={handlePassSubmit} className="register-form">
            <div className="form-group input-with-icon">
              <label htmlFor="currentPassword">Current Password</label>
              <div className="input-icon-wrapper">
                <Lock size={18} className="input-icon" />
                <input type={showPass ? 'text' : 'password'} id="currentPassword" value={passData.currentPassword} onChange={(e) => setPassData({...passData, currentPassword: e.target.value})} className="form-control has-icon" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPass(!showPass)} aria-label="Toggle password visibility" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <div className="form-group input-with-icon">
              <label htmlFor="newPassword">New Password</label>
              <div className="input-icon-wrapper">
                <Lock size={18} className="input-icon" />
                <input type={showPass ? 'text' : 'password'} id="newPassword" value={passData.newPassword} onChange={(e) => setPassData({...passData, newPassword: e.target.value})} className="form-control has-icon" placeholder="••••••••" required minLength="6" />
              </div>
            </div>

            <div className="form-group input-with-icon" style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <div className="input-icon-wrapper">
                <Lock size={18} className="input-icon" />
                <input type={showPass ? 'text' : 'password'} id="confirmPassword" value={passData.confirmPassword} onChange={(e) => setPassData({...passData, confirmPassword: e.target.value})} className="form-control has-icon" placeholder="••••••••" required minLength="6" />
              </div>
            </div>
            
            <button type="submit" className="btn-primary" disabled={isPassLoading}>
              {isPassLoading ? 'Updating Password...' : 'Change Password'}
            </button>
          </form>
        </div>

        {/* Author Profile Section (Admin Only) */}
        {currentUser.isAdmin && (
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Feather size={20} style={{ color: 'var(--accent-gold)' }} /> Author Profile
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>This information appears on articles you create. It is independent from your account name.</p>
            {authorMessage && (
              <div style={{ marginBottom: '1.5rem', padding: '1rem', borderRadius: '8px', backgroundColor: authorMessage.type === 'success' ? 'rgba(30, 215, 96, 0.1)' : 'rgba(226, 33, 52, 0.1)', color: authorMessage.type === 'success' ? '#1ed760' : '#e22134', fontWeight: 'bold' }}>
                {authorMessage.text}
              </div>
            )}
            <form onSubmit={handleAuthorSubmit} className="register-form">
              <div className="form-group">
                <label htmlFor="authorName">Display Name</label>
                <input type="text" id="authorName" value={authorData.authorName} onChange={(e) => setAuthorData({...authorData, authorName: e.target.value})} className="form-control" placeholder="e.g. Nathan" />
              </div>
              <div className="form-group">
                <label htmlFor="authorBio">Author Bio</label>
                <textarea id="authorBio" value={authorData.authorBio} onChange={(e) => setAuthorData({...authorData, authorBio: e.target.value})} className="form-control" placeholder="A short bio that appears below your articles..." rows="4" style={{ resize: 'vertical' }} />
              </div>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="authorAvatar">Avatar Image URL</label>
                <input type="url" id="authorAvatar" value={authorData.authorAvatar} onChange={(e) => setAuthorData({...authorData, authorAvatar: e.target.value})} className="form-control" placeholder="https://..." />
              </div>
              <button type="submit" className="btn-primary" disabled={isAuthorLoading}>
                {isAuthorLoading ? 'Saving...' : 'Save Author Profile'}
              </button>
            </form>
          </div>
        )}

        {/* Danger Zone — Account Deletion */}
        <div className="glass-panel" style={{ padding: '2rem', border: '1px solid rgba(226, 33, 52, 0.3)' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#e22134', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={20} /> Danger Zone
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Deleting your account is permanent and cannot be undone. Your comments will be anonymized.
          </p>
          <form onSubmit={handleDeleteAccount}>
            <div className="form-group input-with-icon" style={{ marginBottom: '1rem' }}>
              <label htmlFor="deletePassword">Confirm your password to delete</label>
              <div className="input-icon-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  id="deletePassword"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="form-control has-icon"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isDeleteLoading || !deletePassword}
              style={{ background: 'rgba(226, 33, 52, 0.1)', color: '#e22134', border: '1px solid rgba(226, 33, 52, 0.3)', borderRadius: '8px', padding: '0.75rem 1.5rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
            >
              <Trash2 size={18} /> {isDeleteLoading ? 'Deleting...' : 'Delete My Account'}
            </button>
          </form>
        </div>
        
      </div>
    </div>
  );
};

export default Settings;
