import { useState, useEffect } from 'react';
import './Games.css';

const words = [
  { word: 'HUMILITY', hint: 'Not thinking less of yourself, but thinking of yourself less.' },
  { word: 'SERVANT', hint: 'The core identity of Christ-like leadership.' },
  { word: 'INTEGRITY', hint: 'Doing the right thing even when no one is watching.' },
  { word: 'SHEPHERD', hint: 'A biblical metaphor for a leader who guides and protects.' },
  { word: 'WISDOM', hint: 'Applying knowledge with godly perspective.' },
];

const WordScramble = () => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [scrambledWord, setScrambledWord] = useState('');
  const [userGuess, setUserGuess] = useState('');
  const [message, setMessage] = useState('');
  const [score, setScore] = useState(0);

  const scrambleString = (str) => {
    const array = str.split('');
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    // Make sure it doesn't accidentally return the same word
    if (array.join('') === str && str.length > 2) {
      return scrambleString(str);
    }
    return array.join('');
  };

  const loadWord = (index) => {
    const wordObj = words[index];
    setScrambledWord(scrambleString(wordObj.word));
    setUserGuess('');
    setMessage('');
  };

  useEffect(() => {
    loadWord(currentWordIndex);
  }, [currentWordIndex]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const currentWord = words[currentWordIndex].word;
    
    if (userGuess.toUpperCase() === currentWord) {
      setScore(score + 10);
      setMessage('Correct! Great job.');
      setTimeout(() => {
        if (currentWordIndex < words.length - 1) {
          setCurrentWordIndex(currentWordIndex + 1);
        } else {
          setMessage(`Game Over! Final Score: ${score + 10}`);
        }
      }, 1500);
    } else {
      setMessage('Incorrect. Try again!');
    }
  };

  const handleSkip = () => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    } else {
      setMessage(`Game Over! Final Score: ${score}`);
    }
  };

  const restartGame = () => {
    setCurrentWordIndex(0);
    setScore(0);
    loadWord(0);
  };

  const isGameOver = currentWordIndex >= words.length - 1 && message.includes('Game Over');
  const currentObj = words[currentWordIndex];

  if (isGameOver) {
    return (
      <div className="game-card result-card">
        <h3>Word Scramble Complete!</h3>
        <div className="score-display">
          <span className="score-number">{score}</span> points
        </div>
        <button className="game-btn primary" onClick={restartGame}>Play Again</button>
      </div>
    );
  }

  return (
    <div className="game-card scramble-card">
      <div className="scramble-header">
        <span className="score-badge">Score: {score}</span>
      </div>
      
      <div className="scramble-display">
        {scrambledWord.split('').map((char, i) => (
          <span key={i} className="scramble-letter">{char}</span>
        ))}
      </div>

      <div className="hint-box">
        <p className="hint-text"><strong>Hint:</strong> {currentObj.hint}</p>
      </div>

      <form onSubmit={handleSubmit} className="scramble-form">
        <input
          type="text"
          value={userGuess}
          onChange={(e) => setUserGuess(e.target.value)}
          placeholder="Unscramble the word..."
          className="scramble-input"
          autoComplete="off"
        />
        <div className="scramble-actions">
          <button type="submit" className="game-btn primary">Submit</button>
          <button type="button" onClick={handleSkip} className="game-btn secondary">Skip</button>
        </div>
      </form>

      {message && (
        <div className={`scramble-message ${message.includes('Correct') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default WordScramble;
