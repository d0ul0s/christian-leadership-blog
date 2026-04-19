import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ArticleCard from '../components/ArticleCard';
import { ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';
import './Home.css';

const Home = () => {
  const [latestArticles, setLatestArticles] = useState([]);

  useEffect(() => {
    const fetchLatestArticles = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/articles`);
        const data = await res.json();
        if (res.ok && data.length > 0) {
          const formattedArticles = data.slice(0, 3).map(article => ({
            id: article._id || article.articleId,
            title: article.title,
            date: new Date(article.createdAt).toLocaleDateString(),
            readTime: article.readTime,
            category: article.category,
            excerpt: article.excerpt,
            slug: `article/${article.articleId}`,
            image: article.coverImage
          }));
          setLatestArticles(formattedArticles);
        }
      } catch (err) {
        console.error("Failed to load latest articles", err);
      }
    };
    
    fetchLatestArticles();
  }, []);

  return (
    <div className="home animate-fade-in">
      <SEO title="Home" />
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="container hero-content">
          <span className="hero-eyebrow delay-100">Welcome to my digital garden</span>
          <h1 className="hero-title delay-200">
            Nathan <span className="text-gradient">Blog</span>
          </h1>
          <p className="hero-subtitle delay-300">
            A personal space where I share my thoughts, experiences, and whatever is on my mind.
          </p>
          <div className="hero-actions delay-300">
            <Link to={latestArticles.length > 0 ? `/${latestArticles[0].slug}` : '/articles'} className="btn-primary">Read Latest Post</Link>
            <Link to="/about" className="btn-secondary">About Me</Link>
          </div>
        </div>
      </section>

      {/* Philosophy Banner */}
      <section className="philosophy-banner">
        <div className="container">
          <h2 className="philosophy-quote">
            "I don't know what the future may hold, but I know who holds the future."
          </h2>
        </div>
      </section>

      {/* Featured Articles Section */}
      <section className="featured-section container">
        <div className="section-header">
          <h2>Recent Entries</h2>
          <Link to="/articles" className="view-all">View Archive <ArrowRight size={18} /></Link>
        </div>
        
        <div className="articles-grid">
          {latestArticles.length > 0 ? (
            latestArticles.map((article, index) => (
              <ArticleCard key={article.id || index} {...article} />
            ))
          ) : (
            <div className="placeholder-card flex-center glass-panel">
              <span className="text-secondary">No entries published yet</span>
            </div>
          )}
          
          {/* Placeholder cards to show the grid design */}
          {latestArticles.length > 0 && latestArticles.length < 3 && (
            Array.from({ length: 3 - latestArticles.length }).map((_, i) => (
              <div key={`placeholder-${i}`} className="placeholder-card flex-center glass-panel hide-mobile">
                <span className="text-secondary">Coming Soon</span>
              </div>
            ))
          )}
          {latestArticles.length === 0 && (
            <>
              <div className="placeholder-card flex-center glass-panel hide-mobile">
                <span className="text-secondary">Coming Soon</span>
              </div>
              <div className="placeholder-card flex-center glass-panel hide-mobile">
                <span className="text-secondary">Coming Soon</span>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
