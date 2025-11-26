import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/HandRecognition.css";
import BackButton from "./BackButton";

import {
  generateUniformHandByType,
  cardToImage,
} from "../utils/handRecognitionLogic";

// Same style as HoleCardQuiz: easy/medium/hard
const DIFFICULTY_SETTINGS = {
  easy: { questions: 10, timePerQuestion: 10 },
  medium: { questions: 6, timePerQuestion: 6 },
  hard: { questions: 3, timePerQuestion: 3 },
};

const HAND_TYPES = [
  "High Card",
  "One Pair",
  "Two Pair",
  "Three of a Kind",
  "Straight",
  "Flush",
  "Full House",
  "Four of a Kind",
  "Straight Flush",
  "Royal Flush",
];

function HandRecognition() {
  const navigate = useNavigate();

  // difficulty & quiz meta
  const [difficulty, setDifficulty] = useState(null);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [timePerQuestion, setTimePerQuestion] = useState(0);

  // game state
  const [cards, setCards] = useState([]);
  const [bestHandName, setBestHandName] = useState("");
  const [selectedGuess, setSelectedGuess] = useState("");
  const [score, setScore] = useState(0);
  const [question, setQuestion] = useState(1);
  const [timeLeft, setTimeLeft] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [roundActive, setRoundActive] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  // Deal a new hand for a question
  const dealNewHand = () => {
    const { cards: hand, bestHandName } = generateUniformHandByType();

    setCards(hand);
    setBestHandName(bestHandName);
    setSelectedGuess("");
    setFeedback("");
    setTimeLeft(timePerQuestion);
    setRoundActive(true);
  };

  // When difficulty is chosen, initialise quiz
  useEffect(() => {
    if (!difficulty) return;

    const settings = DIFFICULTY_SETTINGS[difficulty];
    setTotalQuestions(settings.questions);
    setTimePerQuestion(settings.timePerQuestion);
    setScore(0);
    setQuestion(1);
    setQuizFinished(false);
    // Start first round AFTER timePerQuestion is set
  }, [difficulty]);

  // Start a hand whenever question number changes (and difficulty is chosen)
  useEffect(() => {
    if (!difficulty) return;
    if (quizFinished) return;

    dealNewHand();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question, difficulty]);

  // Timer effect
  useEffect(() => {
    if (!roundActive) return;
    if (timeLeft <= 0) {
      handleSubmit(""); // treat as timeout
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, roundActive]);

  const boardCards = useMemo(() => cards.slice(0, 5), [cards]);
  const playerCards = useMemo(() => cards.slice(5, 7), [cards]);

  const handleSubmit = (guessFromTimeoutOrButton) => {
    if (!roundActive) return;

    const finalGuess = guessFromTimeoutOrButton || selectedGuess;
    let newScore = score;

    if (finalGuess && finalGuess === bestHandName) {
      newScore += 1;
      setFeedback("Correct!");
    } else if (!finalGuess) {
      setFeedback(`Time's up! Correct answer: ${bestHandName}`);
    } else {
      setFeedback(`Incorrect. Correct answer: ${bestHandName}`);
    }

    setScore(newScore);
    setRoundActive(false);

    setTimeout(() => {
      if (question < totalQuestions) {
        setQuestion((q) => q + 1);
      } else {
        setQuizFinished(true);
        setFeedback(`Finished! Final score: ${newScore}/${totalQuestions}`);
      }
    }, 1500);
  };

  const renderCard = (card) => {
    const file = cardToImage(card);
    return (
      <img
        key={card}
        src={`/cards/${file}.png`}
        alt={card}
        className="card"
      />
    );
  };

  const handleBackToCards = () => {
    navigate("/cards");
  };

  // ====== RENDER ======

  // 1) Difficulty selection screen (same idea as HoleCardQuiz)
  if (!difficulty) {
    return (
      <div className="container">

        <BackButton to="/cards" />


        <h1>Poker Hand Recognition</h1>
        <p>Select a difficulty to start:</p>

        <div className="hr-difficulty-row">
          <button onClick={() => setDifficulty("easy")}>Easy</button>
          <button onClick={() => setDifficulty("medium")}>Medium</button>
          <button onClick={() => setDifficulty("hard")}>Hard</button>
        </div>
      </div>
    );
  }

  // 2) Main quiz screen
  return (
    <div className="container">
      <button className="back-button" onClick={handleBackToCards}>
        Back to Cards Menu
      </button>

      <h1>Poker Hand Recognition</h1>

      <div id="counter">
        Difficulty: <strong>{difficulty}</strong> · Question {question}/
        {totalQuestions} · Score: {score}
      </div>

      {!quizFinished && (
        <>
          <div id="timer">Time Left: {timeLeft}s</div>

          <div className="cards-row">{boardCards.map(renderCard)}</div>
          <div className="cards-row">{playerCards.map(renderCard)}</div>

          <div className="guess-section">
            <select
              value={selectedGuess}
              onChange={(e) => setSelectedGuess(e.target.value)}
            >
              <option value="">Choose hand type...</option>
              {HAND_TYPES.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>

            <button
              onClick={() => handleSubmit(selectedGuess)}
              disabled={!roundActive}
            >
              Submit
            </button>
          </div>

          {feedback && <div className="feedback">{feedback}</div>}
        </>
      )}

      {quizFinished && (
        <div className="feedback">
          {feedback}
          <div style={{ marginTop: "1rem" }}>
            <button onClick={() => setDifficulty(null)}>
              Choose difficulty again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default HandRecognition;
