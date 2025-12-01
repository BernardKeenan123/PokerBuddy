import { useEffect, useState } from "react";
import "../styles/RFI.css";
import BackButton from "./BackButton";

// Same mapping as original RFI.js
const POSITIONS = {
  UTG: 7,
  "UTG+1": 8,
  "UTG+2": 9.5,
  MP: 11,
  Lojack: 13,
  Hijack: 18,
  CO: 27,
  BTN: 48,
  SB: 36,
};

const RANKED_HANDS = [
  "AA", "KK", "QQ", "JJ", "TT", "99", "88", "AKs", "AQs", "AJs", "ATs", "KQs", "KJs", "QJs", "JTs",
  "T9s", "98s", "87s", "76s", "65s", "54s", "AKo", "AQo", "AJo", "KQo", "A9s", "A8s", "A7s", "KTs",
  "QTs", "J9s", "T8s", "97s", "86s", "75s", "KJo", "QJo", "JTo", "T9o", "98o", "87o", "76o", "65o",
  "A6s", "A5s", "K9s", "Q9s", "J8s", "T7s", "96s", "85s", "KTo", "QTo", "J9o", "T8o", "97o", "86o",
  "75o", "64o", "A4s", "A3s", "K8s", "Q8s", "J7s", "T6s", "95s", "74s", "54o", "A2s", "K7s", "Q7s",
  "J6s", "T5s", "94s", "84s", "74o", "63o", "K6s", "Q6s", "J5s", "T4s", "93s", "83s", "72o", "K5s",
  "Q5s", "J4s", "T3s", "92s", "82s", "K4s", "Q4s", "J3s", "T2s", "K3s", "Q3s", "J2s", "K2s", "Q2s",
];

const HAND_GRID = [
  ["AA", "AKo", "AQo", "AJo", "ATo", "A9o", "A8o", "A7o", "A6o", "A5o", "A4o", "A3o", "A2o"],
  ["AKs", "KK", "KQo", "KJo", "KTo", "K9o", "K8o", "K7o", "K6o", "K5o", "K4o", "K3o", "K2o"],
  ["AQs", "KQs", "QQ", "QJo", "QTo", "Q9o", "Q8o", "Q7o", "Q6o", "Q5o", "Q4o", "Q3o", "Q2o"],
  ["AJs", "KJs", "QJs", "JJ", "JTo", "J9o", "J8o", "J7o", "J6o", "J5o", "J4o", "J3o", "J2o"],
  ["ATs", "KTs", "QTs", "JTs", "TT", "T9o", "T8o", "T7o", "T6o", "T5o", "T4o", "T3o", "T2o"],
  ["A9s", "K9s", "Q9s", "J9s", "T9s", "99", "98o", "97o", "96o", "95o", "94o", "93o", "92o"],
  ["A8s", "K8s", "Q8s", "J8s", "T8s", "98s", "88", "87o", "86o", "85o", "84o", "83o", "82o"],
  ["A7s", "K7s", "Q7s", "J7s", "T7s", "97s", "87s", "77", "76o", "75o", "74o", "73o", "72o"],
  ["A6s", "K6s", "Q6s", "J6s", "T6s", "96s", "86s", "76s", "66", "65o", "64o", "63o", "62o"],
  ["A5s", "K5s", "Q5s", "J5s", "T5s", "95s", "85s", "75s", "65s", "55", "54o", "53o", "52o"],
  ["A4s", "K4s", "Q4s", "J4s", "T4s", "94s", "84s", "74s", "64s", "54s", "44", "43o", "42o"],
  ["A3s", "K3s", "Q3s", "J3s", "T3s", "93s", "83s", "73s", "63s", "53s", "43s", "33", "32o"],
  ["A2s", "K2s", "Q2s", "J2s", "T2s", "92s", "82s", "72s", "62s", "52s", "42s", "32s", "22"],
];

const POSITION_LIST = Object.keys(POSITIONS);
const MAX_QUESTIONS = 10;

const DIFFICULTY_POOLS = {
  easy: ["CO", "BTN", "SB"],
  medium: ["MP", "Lojack", "Hijack", "CO", "BTN", "SB"],
  hard: POSITION_LIST,
};

function RFI() {
  const [difficulty, setDifficulty] = useState(null); // "easy" | "medium" | "hard"
  const [currentPosition, setCurrentPosition] = useState(null);
  const [lastPosition, setLastPosition] = useState(null);
  const [highlightedHands, setHighlightedHands] = useState(new Set());
  const [showCorrect, setShowCorrect] = useState(false);
  const [question, setQuestion] = useState(1);
  const [result, setResult] = useState("");
  const [gameOver, setGameOver] = useState(false);

  // Pick a new random position (respecting difficulty & no back-to-back repeats)
  const setupNewQuestion = (difficultyLevel) => {
    const pool = DIFFICULTY_POOLS[difficultyLevel] || POSITION_LIST;

    let pos;
    if (pool.length === 1) {
      pos = pool[0];
    } else {
      do {
        pos = pool[Math.floor(Math.random() * pool.length)];
      } while (pos === lastPosition);
    }

    setCurrentPosition(pos);
    setLastPosition(pos);

    const rfiPercentage = POSITIONS[pos];
    const handsToHighlight = Math.floor(
      (rfiPercentage / 100) * RANKED_HANDS.length
    );
    const topHands = RANKED_HANDS.slice(0, handsToHighlight);
    setHighlightedHands(new Set(topHands));
    setShowCorrect(false);
    setResult("");
  };

  // When difficulty chosen, start from question 1
  useEffect(() => {
    if (!difficulty) return;
    setQuestion(1);
    setGameOver(false);
    setResult("");
    setupNewQuestion(difficulty);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty]);

  const handleGuess = (position) => {
    if (gameOver || !currentPosition || !difficulty) return;

    if (position === currentPosition) {
      setResult(`Correct! The position was ${position}.`);
    } else {
      setResult(`Wrong! The correct position was ${currentPosition}.`);
    }

    setShowCorrect(true);

    if (question < MAX_QUESTIONS) {
      setTimeout(() => {
        setQuestion((q) => q + 1);
        setupNewQuestion(difficulty);
      }, 1500);
    } else {
      setGameOver(true);
    }
  };

  const handleRestart = () => {
    // keep same difficulty, just restart the quiz
    setQuestion(1);
    setGameOver(false);
    setResult("");
    setShowCorrect(false);
    setupNewQuestion(difficulty);
  };

  // Difficulty selection screen
  if (!difficulty) {
    return (
      <div className="rfi-page">
        <BackButton to="/position" label="Back to Position Menu" />
        <div className="rfi-container">
          <h1>Poker RFI Training</h1>
          <p>Select a difficulty:</p>
          <div className="rfi-difficulty-row">
            <button onClick={() => setDifficulty("easy")}>Easy</button>
            <button onClick={() => setDifficulty("medium")}>Medium</button>
            <button onClick={() => setDifficulty("hard")}>Hard</button>
          </div>
          <p className="rfi-note">
            Easy: CO / BTN / SB only. Medium: Adds MP, Lojack, Hijack. Hard: All positions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rfi-page">
      <BackButton to="/position" label="Back to Position Menu" />

      <div className="rfi-container">
        <h1>Poker RFI Training</h1>

        <p className="rfi-meta">
          Difficulty: <strong>{difficulty}</strong> · Question{" "}
          {question}/{MAX_QUESTIONS}
        </p>

              {/* Hand grid */}
              <div className="rfi-hand-grid">
                  {HAND_GRID.flat().map((hand) => {
                      const isInRange = highlightedHands.has(hand);
                      let cellClass = "hand-cell";

                      if (isInRange) {
                          cellClass += " highlight";

                          if (showCorrect) {
                              if (result.startsWith("Correct")) {
                                  cellClass += " correct-answer";   // GREEN
                              } else {
                                  cellClass += " wrong-answer";     // RED
                              }
                          }
                      }

                      return (
                          <div key={hand} className={cellClass}>
                              {hand}
                          </div>
                      );
                  })}
              </div>


        {/* Result */}
        <div className="rfi-result">{result}</div>

        {/* Position buttons */}
        {!gameOver && (
          <div className="rfi-position-buttons">
            {DIFFICULTY_POOLS[difficulty].map((pos) => (
              <button
                key={pos}
                className="position-btn"
                onClick={() => handleGuess(pos)}
              >
                {pos}
              </button>
            ))}
          </div>
        )}

        {gameOver && (
          <div className="rfi-gameover">
            <p>You&apos;ve completed {MAX_QUESTIONS} questions.</p>
            <button className="rfi-restart-btn" onClick={handleRestart}>
              Play again
            </button>
            <button
              className="rfi-restart-btn rfi-change-diff"
              onClick={() => setDifficulty(null)}
            >
              Choose difficulty
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default RFI;
