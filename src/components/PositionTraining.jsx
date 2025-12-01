import { useEffect, useRef, useState } from "react";
import "../styles/PositionTraining.css";
import BackButton from "./BackButton";

const ALL_POSITIONS_MAP = {
  2: ["Small Blind", "Big Blind"],
  3: ["Button", "Small Blind", "Big Blind"],
  4: ["Button", "Small Blind", "Big Blind", "Under the Gun"],
  5: ["Button", "Small Blind", "Big Blind", "Under the Gun", "Cutoff"],
  6: ["Button", "Small Blind", "Big Blind", "Under the Gun", "Hijack", "Cutoff"],
  7: [
    "Button",
    "Small Blind",
    "Big Blind",
    "Under the Gun",
    "Middle Player",
    "Hijack",
    "Cutoff",
  ],
  8: [
    "Button",
    "Small Blind",
    "Big Blind",
    "Under the Gun",
    "UTG +1",
    "Middle Player",
    "Hijack",
    "Cutoff",
  ],
  9: [
    "Button",
    "Small Blind",
    "Big Blind",
    "Under the Gun",
    "UTG +1",
    "UTG +2",
    "Middle Player",
    "Hijack",
    "Cutoff",
  ],
  10: [
    "Button",
    "Small Blind",
    "Big Blind",
    "Under the Gun",
    "UTG +1",
    "UTG +2",
    "Middle Player",
    "Middle Player 2",
    "Hijack",
    "Cutoff",
  ],
};

const DIFFICULTY_LEVELS = {
  easy: 10,
  medium: 7,
  hard: 4,
};

const TOTAL_QUESTIONS = 10;

function PositionTraining() {
  const [difficulty, setDifficulty] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [score, setScore] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [questionActive, setQuestionActive] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [quizFinished, setQuizFinished] = useState(false);

  const [numPlayers, setNumPlayers] = useState(6);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [dealerIndex, setDealerIndex] = useState(0);
  const [availablePositions, setAvailablePositions] = useState([]);
  const [correctPosition, setCorrectPosition] = useState("");

  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [selectedGuess, setSelectedGuess] = useState(null);

  const timerRef = useRef(null);

  const resetQuizState = () => {
    setCurrentQuestion(1);
    setScore(0);
    setTotalTime(0);
    setTimeLeft(null);
    setFeedback("");
    setQuizFinished(false);
    setQuestionActive(false);
    setSelectedGuess(null);
  };

  const pickNewQuestion = (chosenDifficulty) => {
    const nPlayers = Math.floor(Math.random() * 8) + 2; // 2–10
    const positions = ALL_POSITIONS_MAP[nPlayers];

    const heroIndex = Math.floor(Math.random() * nPlayers);
    const btnIndex = Math.floor(Math.random() * nPlayers);

    const correctPos =
      positions[(heroIndex - btnIndex + nPlayers) % nPlayers];

    setNumPlayers(nPlayers);
    setPlayerIndex(heroIndex);
    setDealerIndex(btnIndex);
    setAvailablePositions(positions);
    setCorrectPosition(correctPos);

    const seconds = DIFFICULTY_LEVELS[chosenDifficulty];
    setTimeLeft(seconds);
    setQuestionStartTime(Date.now());
    setQuestionActive(true);
    setSelectedGuess(null);
    setFeedback("");
  };

  useEffect(() => {
    if (!difficulty) return;
    resetQuizState();
    pickNewQuestion(difficulty);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty]);

  useEffect(() => {
    if (!questionActive || timeLeft == null) return;
    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }

    timerRef.current = setTimeout(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, questionActive]);

  const handleGuessClick = (guess) => {
    if (!questionActive) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    setQuestionActive(false);
    setSelectedGuess(guess);

    const now = Date.now();
    if (questionStartTime) {
      const elapsedSeconds = (now - questionStartTime) / 1000;
      setTotalTime((prev) => prev + elapsedSeconds);
    }

    if (guess === correctPosition) {
      setScore((s) => s + 1);
      setFeedback("Correct!");
    } else {
      setFeedback(`Incorrect. Correct seat: ${correctPosition}`);
    }

    setTimeout(() => {
      goToNextQuestion();
    }, 1500);
  };

  const handleTimeout = () => {
    setQuestionActive(false);
    if (timerRef.current) clearTimeout(timerRef.current);

    const now = Date.now();
    if (questionStartTime) {
      const elapsedSeconds = (now - questionStartTime) / 1000;
      setTotalTime((prev) => prev + elapsedSeconds);
    }

    setFeedback(`Time's up! Correct seat: ${correctPosition}`);

    setTimeout(() => {
      goToNextQuestion();
    }, 1500);
  };

  const goToNextQuestion = () => {
    if (currentQuestion < TOTAL_QUESTIONS) {
      setCurrentQuestion((q) => q + 1);
      pickNewQuestion(difficulty);
    } else {
      setQuizFinished(true);
      setQuestionActive(false);
      setTimeLeft(null);
    }
  };

  const avgTime =
    TOTAL_QUESTIONS > 0 ? (totalTime / TOTAL_QUESTIONS).toFixed(2) : "0.00";

  const getPlayerStyle = (index) => {
    const total = numPlayers || 2;
    const angleDeg = (index * 360) / total;
    const angleRad = (angleDeg * Math.PI) / 180;

    const radiusX = 180;
    const radiusY = 100;
    const centerX = 200;
    const centerY = 120;

    const x = centerX + radiusX * Math.cos(angleRad);
    const y = centerY + radiusY * Math.sin(angleRad);

    return {
      left: `${x}px`,
      top: `${y}px`,
    };
  };

  if (!difficulty) {
    return (
      <div className="pt-page">
        <BackButton to="/position" label="Back to Position Menu" />
        <div className="pt-container">
          <h1>Seat Names Training</h1>
          <p>Select a difficulty:</p>
          <div className="pt-difficulty-row">
            <button onClick={() => setDifficulty("easy")}>Easy</button>
            <button onClick={() => setDifficulty("medium")}>Medium</button>
            <button onClick={() => setDifficulty("hard")}>Hard</button>
          </div>
          <p className="pt-note">
            You&apos;ll see random tables (2–10 players). A seat is highlighted;
            your job is to identify its name relative to the Button.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-page">
      <BackButton to="/position" label="Back to Position Menu" />
      <div className="pt-container">
        <h1>Seat Names Training</h1>

        <p className="pt-meta">
          Difficulty: <strong>{difficulty}</strong> · Question{" "}
          {currentQuestion}/{TOTAL_QUESTIONS} · Score: {score}
        </p>

        {!quizFinished && (
          <>
            <div className="pt-table">
              <div className="pt-table-inner">
                <div className="pt-table-felt" />
                {Array.from({ length: numPlayers }).map((_, i) => {
                  const isHero = i === playerIndex;
                  const isDealer = i === dealerIndex;

                  return (
                    <div
                      key={i}
                      className={`pt-player ${
                        isHero ? "hero" : ""
                      } ${isDealer ? "dealer" : ""}`}
                      style={getPlayerStyle(i)}
                    >
                      <div className="pt-player-chip">
                        {isDealer ? "BTN" : i + 1}
                      </div>
                      {isHero && (
                        <div className="pt-hero-indicator">You</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="pt-timer">
              Time left: {timeLeft != null ? timeLeft : "-"}s
            </p>
            {feedback && <p className="pt-feedback">{feedback}</p>}

            <div className="pt-guess-buttons">
              {availablePositions.map((pos) => {
                let className = "pt-guess-button";
                if (!questionActive) {
                  if (pos === correctPosition) className += " correct";
                  else if (pos === selectedGuess) className += " incorrect";
                }

                return (
                  <button
                    key={pos}
                    className={className}
                    onClick={() => handleGuessClick(pos)}
                    disabled={!questionActive}
                  >
                    {pos}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {quizFinished && (
          <div className="pt-results">
            <p>
              Quiz over! You scored {score} / {TOTAL_QUESTIONS}.
            </p>
            <p>Average time per question: {avgTime} seconds.</p>
            <button
              className="pt-guess-button pt-finish-button"
              onClick={() => setDifficulty(null)}
            >
              Choose difficulty again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PositionTraining;
