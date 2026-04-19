import SEO from '../components/SEO';

const Privacy = () => {
  return (
    <div className="container animate-fade-in" style={{ paddingTop: '8rem', paddingBottom: '5rem', minHeight: '80vh', maxWidth: '800px' }}>
      <SEO title="Privacy Policy" description="Privacy Policy for Nathan Blog" />
      <h1 className="hero-title text-gradient" style={{ marginBottom: '2rem' }}>Privacy Policy</h1>
      
      <div className="glass-panel" style={{ padding: '2.5rem' }}>
        <p className="text-secondary" style={{ marginBottom: '2rem' }}>Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>1. Information Collection</h2>
        <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
          When you register for an account, I collect basic information such as your name, email address, and an optional profile picture. This allows you to interact with the site, leave comments, and manage your preferences.
        </p>

        <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>2. How Information is Used</h2>
        <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
          Your email address is used purely for account verification, password resets, and potential future notifications regarding content you've interacted with. I do not sell or share your personal information with third parties.
        </p>

        <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>3. Security</h2>
        <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
          I take reasonable steps to protect your personal information from unauthorized access or disclosure. Your passwords are cryptographically hashed before being stored in the database.
        </p>

        <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>4. User Rights</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          You have the right to request the deletion of your account and all associated data at any time. Simply contact me or use the applicable dashboard settings if available.
        </p>
      </div>
    </div>
  );
};

export default Privacy;
