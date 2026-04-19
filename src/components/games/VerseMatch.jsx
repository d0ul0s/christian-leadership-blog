import { useState, useEffect } from 'react';
import './Games.css';

const verseData = [
  { id: 1, text: "For even the Son of Man came not to be served but to serve, and to give his life as a ransom for many.", ref: "Mark 10:45" },
  { id: 2, text: "Do nothing from selfish ambition or conceit, but in humility count others more significant than yourselves.", ref: "Philippians 2:3" },
  { id: 3, text: "But whoever would be great among you must be your servant.", ref: "Matthew 20:26" },
  { id: 4, text: "He must increase, but I must decrease.", ref: "John 3:30" },
  { id: 5, text: "And let us not grow weary of doing good, for in due season we will reap, if we do not give up.", ref: "Galatians 6:9" }
];

const VerseMatch = () => {
  const [texts, setTexts] = useState([]);
  const [refs, setRefs] = useState([]);
  const [selectedText, setSelectedText] = useState(null);
  const [selectedRef, setSelectedRef] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [mistakes, setMistakes] = useState(0);

  // Initialize and shuffle
  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);
    setTexts(shuffleArray(verseData.map(v => ({ id: v.id, content: v.text }))));
    setRefs(shuffleArray(verseData.map(v => ({ id: v.id, content: v.ref }))));
    setMatchedPairs([]);
    setMistakes(0);
    setSelectedText(null);
    setSelectedRef(null);
  };

  useEffect(() => {
    if (selectedText && selectedRef) {
      if (selectedText.id === selectedRef.id) {
        // Match found
        setMatchedPairs(prev => [...prev, selectedText.id]);
        setSelectedText(null);
        setSelectedRef(null);
      } else {
        // Mismatch
        setMistakes(m => m + 1);
        setTimeout(() => {
          setSelectedText(null);
          setSelectedRef(null);
        }, 1000); // 1 second delay to show mistake
      }
    }
  }, [selectedText, selectedRef]);

  const isMatched = (id) => matchedPairs.includes(id);

  if (matchedPairs.length === verseData.length) {
    return (
      <div className="game-card result-card">
        <h3>Perfect Match!</h3>
        <p className="result-message">You successfully matched all the verses.</p>
        <div className="score-display">
          <span>Mistakes made: <span className={mistakes === 0 ? "success-text" : "error-text"}>{mistakes}</span></span>
        </div>
        <button className="game-btn primary mt-4" onClick={startNewGame}>Play Again</button>
      </div>
    );
  }

  return (
    <div className="game-card match-card">
      <div className="match-header">
        <p className="match-instructions">Select a verse and its corresponding reference to match them.</p>
        <span className="mistakes-counter">Mistakes: {mistakes}</span>
      </div>

      <div className="match-grid">
        <div className="match-column texts-column">
          <h4 className="column-title">Verses</h4>
          {texts.map((t) => {
            const matched = isMatched(t.id);
            const selected = selectedText?.id === t.id;
            const error = selectedText && selectedRef && selectedText.id === t.id && selectedText.id !== selectedRef.id;
            
            let btnClass = "match-item verse-item";
            if (matched) btnClass += " matched";
            else if (error) btnClass += " error";
            else if (selected) btnClass += " selected";

            return (
              <button
                key={t.id}
                className={btnClass}
                onClick={() => !matched && !error && setSelectedText(t)}
                disabled={matched || (selectedText && selectedRef)}
              >
                {t.content}
              </button>
            );
          })}
        </div>

        <div className="match-column refs-column">
          <h4 className="column-title">References</h4>
          {refs.map((r) => {
            const matched = isMatched(r.id);
            const selected = selectedRef?.id === r.id;
            const error = selectedText && selectedRef && selectedRef.id === r.id && selectedText.id !== selectedRef.id;
            
            let btnClass = "match-item ref-item";
            if (matched) btnClass += " matched";
            else if (error) btnClass += " error";
            else if (selected) btnClass += " selected";

            return (
              <button
                key={r.id}
                className={btnClass}
                onClick={() => !matched && !error && setSelectedRef(r)}
                disabled={matched || (selectedText && selectedRef)}
              >
                {r.content}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VerseMatch;
