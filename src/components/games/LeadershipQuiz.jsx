import { useState } from 'react';
import './Games.css';

const LeadershipQuiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const questions = [
    {
      question: "Your team is facing a tight deadline and morale is low. As a servant leader, what is your first step?",
      options: [
        "Demand longer hours to ensure the project is finished on time.",
        "Listen to their concerns, offer support, and work alongside them.",
        "Remind them of the consequences of failure.",
        "Delegate your tasks so you can focus on reporting to upper management."
      ],
      answer: 1,
      explanation: "Servant leadership prioritizes the needs of the team, offering support and sharing the burden."
    },
    {
      question: "A team member makes a significant mistake that impacts the project. How do you respond?",
      options: [
        "Publicly reprimand them to set an example for others.",
        "Quietly fix the mistake yourself to save time.",
        "Address the issue privately, focusing on learning and growth.",
        "Remove them from the project immediately."
      ],
      answer: 2,
      explanation: "A servant leader focuses on growth and redemption, addressing issues with grace and a focus on improvement."
    },
    {
      question: "When setting goals for your organization, a servant leader primarily considers:",
      options: [
        "Maximum profit and market dominance.",
        "Personal recognition and career advancement.",
        "The well-being and development of the team and community.",
        "Beating the competition at all costs."
      ],
      answer: 2,
      explanation: "The core of servant leadership is seeking the highest good of those being led and the broader community."
    }
  ];

  const handleAnswer = (index) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
    setIsAnswered(true);

    if (index === questions[currentQuestion].answer) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setShowResult(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
    setIsAnswered(false);
  };

  if (showResult) {
    return (
      <div className="game-card result-card">
        <h3>Quiz Completed!</h3>
        <div className="score-display">
          <span className="score-number">{score}</span> / {questions.length}
        </div>
        <p className="result-message">
          {score === questions.length ? "Excellent! You have a strong grasp of servant leadership principles." : 
           score > 0 ? "Good effort! Keep learning and growing as a servant leader." : 
           "Keep studying the principles of servant leadership."}
        </p>
        <button className="game-btn primary" onClick={restartQuiz}>Try Again</button>
      </div>
    );
  }

  const q = questions[currentQuestion];

  return (
    <div className="game-card quiz-card">
      <div className="quiz-header">
        <span className="question-counter">Question {currentQuestion + 1} of {questions.length}</span>
        <span className="current-score">Score: {score}</span>
      </div>
      <h3 className="question-text">{q.question}</h3>
      
      <div className="options-container">
        {q.options.map((option, index) => {
          let optionClass = "option-btn";
          if (isAnswered) {
            if (index === q.answer) optionClass += " correct";
            else if (index === selectedAnswer) optionClass += " incorrect";
          }
          return (
            <button
              key={index}
              className={optionClass}
              onClick={() => handleAnswer(index)}
              disabled={isAnswered}
            >
              {option}
            </button>
          );
        })}
      </div>

      {isAnswered && (
        <div className="explanation-box">
          <p><strong>{selectedAnswer === q.answer ? "Correct!" : "Not quite."}</strong> {q.explanation}</p>
          <button className="game-btn primary" onClick={nextQuestion}>
            {currentQuestion < questions.length - 1 ? "Next Question" : "See Results"}
          </button>
        </div>
      )}
    </div>
  );
};

export default LeadershipQuiz;
