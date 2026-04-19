import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Palette, Check, User, Home, BookOpen, Gamepad2, Info, Mail, LayoutDashboard, LogIn, UserPlus, LogOut, Settings as SettingsIcon, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme, themes } = useTheme();
  const { currentUser, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  const getAvatarUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    
    // Safety check for VITE_API_URL trailing slash
    const baseUrl = import.meta.env.VITE_API_URL.endsWith('/') 
      ? import.meta.env.VITE_API_URL.slice(0, -1) 
      : import.meta.env.VITE_API_URL;
      
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (currentUser) {
      const fetchUnread = async () => {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/conversations/unread-count`, {
            headers: { 'x-user-id': currentUser._id }
          });
          if (res.ok) {
            const data = await res.json();
            setUnreadCount(data.count);
          }
        } catch (err) { console.error(err); }
      };
      fetchUnread();
      const interval = setInterval(fetchUnread, 15000); // Polling every 15s
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const baseNavLinks = [
    { name: 'Home', path: '/', icon: <Home size={22} /> },
    { name: 'Essays', path: '/articles', icon: <BookOpen size={22} /> },
    { name: 'Games', path: '/games', icon: <Gamepad2 size={22} /> },
    { name: 'About', path: '/about', icon: <Info size={22} /> },
    { name: 'Contact', path: '/contact', icon: <Mail size={22} /> },
    { name: 'Messenger', path: '/messenger', icon: <MessageSquare size={22} /> },
  ];

  const navLinks = currentUser?.isAdmin 
    ? [...baseNavLinks, { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={22} /> }]
    : baseNavLinks;

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container nav-container">
        <Link to="/" className="nav-logo" style={{ flex: 1 }}>
          <span className="logo-text">Nathan<span className="text-light">Blog</span></span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="nav-links desktop-nav">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path}
              className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
              title={link.name}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.4rem', position: 'relative' }}
            >
              {link.icon}
              {link.name === 'Messenger' && unreadCount > 0 && (
                <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#e22134', color: '#fff', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold', border: '2px solid var(--bg-primary)' }}>
                  {unreadCount}
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* Desktop Auth */}
        <div className="nav-auth desktop-nav">
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ position: 'relative' }}>
                <button onClick={() => setIsThemeOpen(!isThemeOpen)} className="theme-toggle" aria-label="Select theme" style={{ display: 'flex', alignItems: 'center', padding: '0.4rem', borderRadius: '50%', background: 'var(--bg-card)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', cursor: 'pointer', transition: 'var(--transition-smooth)' }}>
                  <Palette size={20} />
                </button>
                {isThemeOpen && (
                  <div className="glass-panel animate-dropdown" style={{ position: 'absolute', top: '100%', right: 0, marginTop: '0.8rem', padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: '220px', zIndex: 100 }}>
                    {themes.map(t => (
                      <button key={t.id} onClick={() => { setTheme(t.id); setIsThemeOpen(false); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.75rem', background: theme === t.id ? 'var(--bg-secondary)' : 'transparent', border: 'none', borderRadius: '6px', color: 'var(--text-primary)', cursor: 'pointer', textAlign: 'left' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.2rem' }}>
                          <span style={{ fontWeight: theme === t.id ? '600' : '500', fontSize: '0.9rem' }}>{t.name}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t.mode} Mode</span>
                        </div>
                        {theme === t.id && <Check size={16} style={{ color: 'var(--accent-gold)' }} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Link to="/settings" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none', color: 'var(--text-primary)' }} title={`Settings for ${currentUser.fullName}`}>
                {currentUser.profilePicture ? (
                  <img src={getAvatarUrl(currentUser.profilePicture)} alt="Profile" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-gold)' }} />
                ) : (
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)' }}>
                    <SettingsIcon size={18} />
                  </div>
                )}
              </Link>
              <button 
                onClick={handleLogout} 
                className="btn-primary auth-btn" 
                title="Sign Out"
                style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', padding: '0.4rem 0.6rem', display: 'flex', alignItems: 'center' }}
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ position: 'relative' }}>
                <button onClick={() => setIsThemeOpen(!isThemeOpen)} className="theme-toggle" aria-label="Select theme" style={{ display: 'flex', alignItems: 'center', padding: '0.4rem', borderRadius: '50%', background: 'var(--bg-card)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', cursor: 'pointer', transition: 'var(--transition-smooth)' }}>
                  <Palette size={20} />
                </button>
                {isThemeOpen && (
                  <div className="glass-panel animate-dropdown" style={{ position: 'absolute', top: '100%', right: 0, marginTop: '0.8rem', padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: '220px', zIndex: 100 }}>
                    {themes.map(t => (
                      <button key={t.id} onClick={() => { setTheme(t.id); setIsThemeOpen(false); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.75rem', background: theme === t.id ? 'var(--bg-secondary)' : 'transparent', border: 'none', borderRadius: '6px', color: 'var(--text-primary)', cursor: 'pointer', textAlign: 'left' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.2rem' }}>
                          <span style={{ fontWeight: theme === t.id ? '600' : '500', fontSize: '0.9rem' }}>{t.name}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t.mode} Mode</span>
                        </div>
                        {theme === t.id && <Check size={16} style={{ color: 'var(--accent-gold)' }} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Link to="/login" className="nav-link" title="Sign In" style={{ margin: 0, padding: '0.4rem' }}>
                <LogIn size={22} />
              </Link>
              <Link to="/register" className="btn-primary auth-btn" title="Register" style={{ margin: 0, padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center' }}>
                <UserPlus size={20} />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className="mobile-toggle" style={{ position: 'relative' }}>
            <button onClick={() => setIsThemeOpen(!isThemeOpen)} className="theme-toggle" aria-label="Select theme" style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
              <Palette size={24} />
            </button>
            {isThemeOpen && (
              <div className="glass-panel animate-dropdown" style={{ position: 'absolute', top: '100%', right: '-40px', marginTop: '1rem', padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: '220px', zIndex: 100 }}>
                {themes.map(t => (
                  <button key={t.id} onClick={() => { setTheme(t.id); setIsThemeOpen(false); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.75rem', background: theme === t.id ? 'var(--bg-secondary)' : 'transparent', border: 'none', borderRadius: '6px', color: 'var(--text-primary)', cursor: 'pointer', textAlign: 'left' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.2rem' }}>
                      <span style={{ fontWeight: theme === t.id ? '600' : '500', fontSize: '0.9rem' }}>{t.name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t.mode} Mode</span>
                    </div>
                    {theme === t.id && <Check size={16} style={{ color: 'var(--accent-gold)' }} />}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button 
            className="mobile-toggle" 
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle navigation"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <div className={`mobile-nav ${isOpen ? 'open' : ''}`}>
        <div className="mobile-nav-inner">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path}
              className={`nav-link mobile-link ${location.pathname === link.path ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
              onClick={() => setIsOpen(false)}
            >
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                {link.icon}
                {link.name === 'Messenger' && unreadCount > 0 && (
                  <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#e22134', color: '#fff', fontSize: '0.6rem', padding: '1px 5px', borderRadius: '10px', fontWeight: 'bold' }}>
                    {unreadCount}
                  </span>
                )}
              </div>
              <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>{link.name}</span>
            </Link>
          ))}
          {currentUser ? (
            <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column' }}>
              <Link to="/settings" className="nav-link mobile-link" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }} onClick={() => setIsOpen(false)}>
                <SettingsIcon size={22} />
                <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>Settings</span>
              </Link>
              <button 
                onClick={handleLogout} 
                className="nav-link mobile-link" 
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1rem', color: 'var(--text-primary)', border: 'none', background: 'transparent' }}
              >
                <LogOut size={22} />
                <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>Sign Out</span>
              </button>
              
              <div style={{ padding: '1.5rem 1rem', marginTop: '1rem', background: 'rgba(212,175,55,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {currentUser.profilePicture ? (
                  <img src={getAvatarUrl(currentUser.profilePicture)} alt="Profile" style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-gold)' }} />
                ) : (
                  <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)' }}>
                    <User size={24} />
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '1rem' }}>{currentUser.fullName}</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{(currentUser.role || 'User').charAt(0).toUpperCase() + (currentUser.role || 'User').slice(1)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Link to="/login" className="nav-link mobile-link" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1rem' }} onClick={() => setIsOpen(false)}>
                <LogIn size={22} />
                <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>Sign In</span>
              </Link>
              <Link to="/register" className="btn-primary" style={{ marginTop: '0.5rem', width: '100%' }} onClick={() => setIsOpen(false)}>
                <UserPlus size={20} style={{ marginRight: '10px' }} /> Register Account
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
