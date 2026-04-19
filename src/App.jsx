import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Register from './pages/Register';
import Login from './pages/Login';
import Articles from './pages/Articles';
import Article from './pages/Article';
import Admin from './pages/Admin';
import Games from './pages/Games';
import Settings from './pages/Settings';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Messenger from './pages/Messenger';
import { ToastProvider } from './context/ToastContext';
import { ConfirmProvider } from './context/ConfirmContext';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    // Read from localStorage on initial load
    const animSpeed = localStorage.getItem('animationSpeed') || 'slow';
    document.body.setAttribute('data-animation', animSpeed);
  }, []);

  return (
    <ToastProvider>
      <ConfirmProvider>
        <BrowserRouter>
          <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/login" element={<Login />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/article/:id" element={<Article />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/games" element={<Games />} />
            <Route path="/messenger" element={<Messenger />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
      </ConfirmProvider>
    </ToastProvider>
  );
}

export default App;
