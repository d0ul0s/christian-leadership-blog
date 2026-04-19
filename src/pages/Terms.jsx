import SEO from '../components/SEO';

const Terms = () => {
  return (
    <div className="container animate-fade-in" style={{ paddingTop: '8rem', paddingBottom: '5rem', minHeight: '80vh', maxWidth: '800px' }}>
      <SEO title="Terms of Service" description="Terms of Service for Nathan Blog" />
      <h1 className="hero-title text-gradient" style={{ marginBottom: '2rem' }}>Terms of Service</h1>
      
      <div className="glass-panel" style={{ padding: '2.5rem' }}>
        <p className="text-secondary" style={{ marginBottom: '2rem' }}>Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>1. Acceptance of Terms</h2>
        <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
          By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.
        </p>

        <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>2. User Content</h2>
        <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
          Any comments or content you post on this blog must be respectful. I reserve the right to remove any content that is deemed inappropriate, spam, or abusive.
        </p>

        <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>3. Intellectual Property</h2>
        <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
          The original essays, thoughts, and writings published on this blog are the intellectual property of the author (Nathan). Do not republish them without permission.
        </p>

        <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>4. Modifications</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          I reserve the right to modify these terms from time to time at my sole discretion. Your continued use of the site following any changes means that you accept the new terms.
        </p>
      </div>
    </div>
  );
};

export default Terms;
