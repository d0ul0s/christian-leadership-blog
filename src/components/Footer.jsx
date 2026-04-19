import { Link } from 'react-router-dom';
import { Mail, Info } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-brand">
          <Link to="/" className="nav-logo" style={{ justifyContent: 'center' }}>
            <span className="logo-text">Nathan<span className="text-light">Blog</span></span>
          </Link>
          <p className="footer-mission" style={{ margin: '1rem auto' }}>
            Exploring ideas, one post at a time.
          </p>
          <p className="copyright" style={{ marginTop: '2rem', textAlign: 'center' }}>
            &copy; {new Date().getFullYear()} Nathan Blog. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
