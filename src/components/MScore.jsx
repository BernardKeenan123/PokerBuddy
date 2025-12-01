import { useEffect, useState } from "react";
import "../styles/ChipsTrainers.css";
import BackButton from "./BackButton";

const roundUpToMultiple = (value, multiple) =>
  Math.ceil(value / multiple) * multiple;

// Blinds: [SB, BB, ante] – ante = 0.25 * SB rounded to nearest 25
const BLINDS = [
  [25, 50, roundUpToMultiple(0.25 * 25, 25)],
  [50, 100, roundUpToMultiple(0.25 * 50, 25)],
  [75, 150, roundUpToMultiple(0.25 * 75, 25)],
  [100, 200, roundUpToMultiple(0.25 * 100, 25)],
  [150, 300, roundUpToMultiple(0.25 * 150, 25)],
  [200, 400, roundUpToMultiple(0.25 * 200, 25)],
  [300, 600, roundUpToMultiple(0.25 * 300, 25)],
  [500, 1000, roundUpToMultiple(0.25 * 500, 25)],
  [700, 1400, roundUpToMultiple(0.25 * 700, 25)],
  [1000, 2000, roundUpToMultiple(0.25 * 1000, 25)],
  [1500, 3000, roundUpToMultiple(0.25 * 1500, 25)],
  [2000, 4000, roundUpToMultiple(0.25 * 2000, 25)],
  [3000, 6000, roundUpToMultiple(0.25 * 3000, 25)],
  [5000, 10000, roundUpToMultiple(0.25 * 5000, 25)],
];

const DIFFICULTY_TIMERS = {
  easy: 25,
  medium: 15,
  hard: 8,
};

const MAX_QUESTIONS = 10;

// Poisson generator (same as original JS)
function poisson(lambda) {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= Math.random();
  } while (p > L);
  return k - 1;
}

// Generate one M-score question
function generateMQuestion() {
  const [SB, BB, ante] = BLINDS[Math.floor(Math.random() * BLINDS.length)];

  const UL = 50;
  const Min_chip = 25;
  const limit = (BB * UL) / Min_chip;

  const lambda = 0.2 * limit;

  let randomNumber = poisson(lambda);
  while (randomNumber >= limit) {
    randomNumber = poisson(lambda);
  }

  const No_players = Math.floor(Math.random() * 8) + 2; // 2–9

  const M_value = BB + SB + No_players * ante;

  let Chip_stack = randomNumber * 25;
  if (Chip_stack < M_value) {
    Chip_stack = M_value;
  }

  const M_score = Math.floor((Chip_stack + M_value - 1) / M_value);

  return {
    SB,
    BB,
    ante,
    No_players,
    Chip_stack,
    M_value,
    M_score,
  };
}

function MScore() {
  const [difficulty, setDifficulty] = useState(null);
  const [question, setQuestion] = useState(1);
  const [correct, setCorrect] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [questionData, setQuestionData] = useState(null);
  const [userGuess, setUserGuess] = useState("");
  const [feedback, setFeedback] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [questionActive, setQuestionActive] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(null);

  // When difficulty selected, start quiz
  useEffect(() => {
    if (!difficulty) return;
    setQuestion(1);
    setCorrect(0);
    setTotalTime(0);
    setGameOver(false);
    startNewQuestion(difficulty);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty]);

  // Timer
  useEffect(() => {
    if (!questionActive || timeLeft == null) return;
    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }

    const id = setTimeout(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, questionActive]);

  const startNewQuestion = (diff) => {
    const data = generateMQuestion();
    setQuestionData(data);
    const seconds = DIFFICULTY_TIMERS[diff];
    setTimeLeft(seconds);
    setQuestionStartTime(Date.now());
    setUserGuess("");
    setFeedback("");
    setQuestionActive(true);
  };

  const finishQuestionTiming = () => {
    if (!questionStartTime) return;
    const now = Date.now();
    const elapsed = (now - questionStartTime) / 1000;
    setTotalTime((prev) => prev + elapsed);
  };

  const goNextOrEnd = () => {
    if (question < MAX_QUESTIONS) {
      setQuestion((q) => q + 1);
      startNewQuestion(difficulty);
    } else {
      setGameOver(true);
      setQuestionActive(false);
      setTimeLeft(null);
    }
  };

  const handleSubmit = () => {
    if (!questionActive || !questionData) return;

    const guessInt = parseInt(userGuess, 10);
    if (Number.isNaN(guessInt)) {
      setFeedback("Please enter a whole number.");
      return;
    }

    setQuestionActive(false);
    finishQuestionTiming();

    if (guessInt === questionData.M_score) {
      setFeedback("Correct! Your guess is right.");
      setCorrect((c) => c + 1);
    } else {
      setFeedback(
        `Wrong! The correct M-score is ${questionData.M_score}.`
      );
    }

    setTimeout(goNextOrEnd, 1500);
  };

  const handleTimeout = () => {
    if (!questionActive || !questionData) return;
    setQuestionActive(false);
    finishQuestionTiming();
    setFeedback(
      `Time's up! The correct M-score was ${questionData.M_score}.`
    );
    setTimeout(goNextOrEnd, 1500);
  };

  const handleRestart = () => {
    setQuestion(1);
    setCorrect(0);
    setTotalTime(0);
    setGameOver(false);
    startNewQuestion(difficulty);
  };

  const avgTime =
    difficulty && question > 1
      ? (totalTime / (question - (gameOver ? 0 : 1))).toFixed(2)
      : "0.00";

  // Difficulty-selection screen
  if (!difficulty) {
    return (
      <div className="chips-trainer-page">
        <BackButton to="/chips" label="Back to Chips Menu" />
        <div className="chips-trainer-container">
          <h1>M-Score Trainer</h1>
          <p>Select a difficulty:</p>
          <div className="ct-difficulty-row">
            <button onClick={() => setDifficulty("easy")}>Easy</button>
            <button onClick={() => setDifficulty("medium")}>Medium</button>
            <button onClick={() => setDifficulty("hard")}>Hard</button>
          </div>
          <p className="ct-note">
            You&apos;ll be given blinds, ante, players and a stack size. Your
            job is to estimate the M-score (stack / cost per round).
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="chips-trainer-page">
      <BackButton to="/chips" label="Back to Chips Menu" />
      <div className="chips-trainer-container">
        <h1>M-Score Trainer</h1>
        <p className="ct-meta">
          Difficulty: <strong>{difficulty}</strong> · Question {question}/
          {MAX_QUESTIONS} · Correct: {correct}
        </p>

        {questionData && !gameOver && (
          <>
            <div className="ct-info-row">
              <div className="ct-info-block">
                <h3>Blinds & Ante</h3>
                <p>SB: {questionData.SB}</p>
                <p>BB: {questionData.BB}</p>
                <p>Ante: {questionData.ante}</p>
              </div>
              <div className="ct-info-block">
                <h3>Table</h3>
                <p>Players: {questionData.No_players}</p>
                <p>Stack: {questionData.Chip_stack}</p>
              </div>
            </div>

            <p className="ct-timer">
              Time left: {timeLeft != null ? timeLeft : "-"}s
            </p>

            <div className="ct-input-row">
              <label htmlFor="m-guess">Your M-score guess:</label>
              <input
                id="m-guess"
                type="number"
                value={userGuess}
                onChange={(e) => setUserGuess(e.target.value)}
                disabled={!questionActive}
              />
              <button
                className="ct-submit-btn"
                onClick={handleSubmit}
                disabled={!questionActive}
              >
                Submit
              </button>
            </div>

            <p className="ct-feedback">{feedback}</p>
          </>
        )}

        {gameOver && (
          <div className="ct-results">
            <p>
              Game over! You answered {correct} out of {MAX_QUESTIONS}{" "}
              correctly.
            </p>
            <p>Average time per question: {avgTime} seconds.</p>
            <button onClick={handleRestart}>Play again</button>
            <button
              className="ct-change-diff"
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

export default MScore;
