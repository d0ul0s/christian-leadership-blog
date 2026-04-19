import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import './ArticleCard.css';

const ArticleCard = ({ title, date, readTime, excerpt, image, category, slug }) => {
  return (
    <div className="article-card glass-panel animate-fade-in">
      <div className="card-image-wrapper">
        <div className="category-badge">{category}</div>
        {/* Placeholder gradient if no image */}
        <div className="card-image bg-gradient" style={image ? { backgroundImage: `url(${image})` } : {}}></div>
      </div>
      <div className="card-content">
        <div className="card-meta">
          <span>{date}</span>
          <span className="dot">•</span>
          <span>{readTime} read</span>
        </div>
        <h3 className="card-title">{title}</h3>
        <p className="card-excerpt">{excerpt}</p>
        <Link to={`/${slug}`} className="read-more">
          Read Article <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
};

export default ArticleCard;
