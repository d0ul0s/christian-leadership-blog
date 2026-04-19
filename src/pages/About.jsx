import { PenTool, Compass, Coffee } from 'lucide-react';
import SEO from '../components/SEO';
import './About.css';

const About = () => {
  return (
    <div className="about-page animate-fade-in">
      <SEO title="About Me" description="Learn more about this personal blog." />
      <div className="container">
        <div className="about-header">
          <h1 className="hero-title text-gradient delay-100">About</h1>
          <p className="hero-subtitle delay-200">
            Welcome to my personal diary. A space for thoughts, reflections, and exploring ideas.
          </p>
        </div>

        <div className="about-grid delay-300">
          <div className="about-content glass-panel">
            <h2>The Journey</h2>
            <p>
              I started this blog as a blank canvas—a digital garden where I can document my thoughts, lessons learned, and the various things I'm exploring. 
            </p>
            <p>
              By the way, "Nathan" is just my pen name! I prefer to keep a degree of separation between my personal online writing and my daily life. It gives me the freedom to write authentically and candidly about whatever comes to mind, without worrying about expectations.
            </p>
            <p>
              I don't know exactly what this blog will become, but I invite you to read along as the journey unfolds.
            </p>
          </div>
          
          <div className="about-image-wrapper">
            <div className="about-image" style={{backgroundImage: "url('https://images.unsplash.com/photo-1544411047-c45ba8a92084?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80')"}}></div>
          </div>
        </div>

        <div className="core-values">
          <h2 className="text-center">What to Expect</h2>
          <div className="values-grid">
            <div className="value-card glass-panel delay-100">
               <div className="icon-wrapper"><PenTool size={28} /></div>
              <h3>Candid Writing</h3>
              <p>Honest thoughts and reflections recorded as they come, serving as a personal time capsule.</p>
            </div>
            
            <div className="value-card glass-panel delay-200">
              <div className="icon-wrapper"><Compass size={28} /></div>
              <h3>Exploration</h3>
              <p>Following curiosity wherever it leads, whether that's technology, philosophy, or everyday life.</p>
            </div>
            
            <div className="value-card glass-panel delay-300">
              <div className="icon-wrapper"><Coffee size={28} /></div>
              <h3>A Quiet Corner</h3>
              <p>A peaceful space away from the noise of traditional social media, focused on long-form expression.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
