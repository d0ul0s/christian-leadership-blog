import { useState } from 'react';
import { AlertTriangle, Lock } from 'lucide-react';

const ConfirmModal = ({ title, message, isPassword, onConfirm, onCancel }) => {
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isPassword) {
      onConfirm(password);
    } else {
      onConfirm(true);
    }
  };

  return (
    <div className="confirm-overlay animate-fade-in">
      <div className="confirm-dialog flex-col glass-panel" style={{ padding: '2rem', maxWidth: '400px', width: '90%', textAlign: 'center' }}>
        <div style={{ 
          margin: '0 auto 1.5rem', 
          background: isPassword ? 'rgba(255, 184, 0, 0.1)' : 'rgba(226, 33, 52, 0.1)', 
          color: isPassword ? 'var(--accent-gold)' : '#e22134', 
          width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' 
        }}>
          {isPassword ? <Lock size={24} /> : <AlertTriangle size={28} />}
        </div>
        <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.25rem' }}>{title}</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: isPassword ? '1rem' : '2rem', lineHeight: 1.5 }}>
          {message}
        </p>

        <form onSubmit={handleSubmit}>
          {isPassword && (
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <input 
                type="password" 
                className="form-control" 
                placeholder="Enter admin password..." 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                required
                style={{ textAlign: 'center' }}
              />
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button 
              type="button"
              className="btn-secondary" 
              onClick={onCancel}
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="btn-primary" 
              style={{ 
                flex: 1, 
                backgroundColor: isPassword ? 'var(--accent-gold)' : '#e22134', 
                borderColor: isPassword ? 'var(--accent-gold)' : '#e22134',
                color: isPassword ? '#000' : '#fff'
              }}
            >
              {isPassword ? 'Verify & Update' : 'Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConfirmModal;
