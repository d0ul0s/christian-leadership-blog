import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ChevronRight } from 'lucide-react';

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/articles`);
        const data = await res.json();
        if (res.ok) {
          setArticles(data);
        }
      } catch (err) {
        console.error("Failed to fetch articles", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArticles();
  }, []);

  if (isLoading) {
    return (
      <div className="container" style={{ paddingTop: '8rem', textAlign: 'center', minHeight: '60vh' }}>
        <h2 className="text-gradient">Loading the library...</h2>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '8rem', paddingBottom: '5rem', minHeight: '80vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
        <h1 className="hero-title text-gradient" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', margin: 0, paddingBottom: '0.2em' }}>Journal Archive</h1>
        <p className="text-secondary" style={{ fontSize: '1.2rem', maxWidth: '600px', margin: 0, lineHeight: 1.6 }}>
          Explore my collection of essays, thoughts, and personal entries.
        </p>
      </div>

      {articles.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <h3>No articles published yet.</h3>
          <p className="text-secondary">Check back soon for new content!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2.5rem' }}>
          {articles.map((article, i) => (
            <Link to={`/article/${article.articleId}`} key={article._id} className="glass-panel delay-100" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', animationDelay: `${Math.min(i * 100, 500)}ms`, transition: 'transform 0.3s ease, box-shadow 0.3s ease', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
              <div style={{ height: '220px', width: '100%', backgroundImage: `url(${article.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center', borderBottom: '1px solid var(--glass-border)' }}></div>
              <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <div style={{ display: 'flex', gap: '1rem', color: 'var(--accent-gold)', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <span>{article.category}</span>
                </div>
                <h3 style={{ color: 'var(--text-primary)', fontSize: '1.5rem', marginBottom: '1rem', lineHeight: 1.3 }}>{article.title}</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', flexGrow: 1, lineHeight: 1.6 }}>{article.excerpt}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '1.25rem', marginTop: 'auto' }}>
                  <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14}/> {new Date(article.createdAt).toLocaleDateString()}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14}/> {article.readTime}</span>
                  </div>
                  <span style={{ color: 'var(--accent-gold)' }}><ChevronRight size={20} /></span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Articles;
