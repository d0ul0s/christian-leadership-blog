import { useState } from 'react';
import LeadershipQuiz from '../components/games/LeadershipQuiz';
import WordScramble from '../components/games/WordScramble';
import VerseMatch from '../components/games/VerseMatch';
import '../components/games/Games.css';
import SEO from '../components/SEO';

const Games = () => {
  const [activeTab, setActiveTab] = useState('quiz');

  return (
    <div className="page-container games-page">
      <SEO title="Interactive Experiences" description="Explore Christian Leadership through interactive browser games." />
      <div className="container">
        <header className="page-header text-center">
          <h1 className="page-title">Interactive <span className="text-primary">Learning</span></h1>
          <p className="page-subtitle">Test your knowledge of servant leadership principles and Scripture through these interactive exercises.</p>
        </header>

        <div className="games-container">
          <div className="games-tabs">
            <button 
              className={`tab-btn ${activeTab === 'quiz' ? 'active' : ''}`}
              onClick={() => setActiveTab('quiz')}
            >
              Leadership Quiz
            </button>
            <button 
              className={`tab-btn ${activeTab === 'scramble' ? 'active' : ''}`}
              onClick={() => setActiveTab('scramble')}
            >
              Word Scramble
            </button>
            <button 
              className={`tab-btn ${activeTab === 'match' ? 'active' : ''}`}
              onClick={() => setActiveTab('match')}
            >
              Verse Match
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'quiz' && <LeadershipQuiz />}
            {activeTab === 'scramble' && <WordScramble />}
            {activeTab === 'match' && <VerseMatch />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Games;
