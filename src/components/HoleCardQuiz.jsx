import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/HoleCardQuiz.css";
import BackButton from "./BackButton";

// === Hole card definitions ===
const holeCards = {
  suited: [
    "AKs", "AQs", "AJs", "ATs", "A9s", "A8s", "A7s", "A6s", "A5s", "A4s", "A3s", "A2s",
    "KQs", "KJs", "KTs", "K9s", "K8s", "K7s", "K6s", "K5s", "K4s", "K3s", "K2s",
    "QJs", "QTs", "Q9s", "Q8s", "Q7s", "Q6s", "Q5s", "Q4s", "Q3s", "Q2s",
    "JTs", "J9s", "J8s", "J7s", "J6s", "J5s", "J4s", "J3s", "J2s",
    "T9s", "T8s", "T7s", "T6s", "T5s", "T4s", "T3s", "T2s",
    "98s", "97s", "96s", "95s", "94s", "93s", "92s",
    "87s", "86s", "85s", "84s", "83s", "82s",
    "76s", "75s", "74s", "73s", "72s",
    "65s", "64s", "63s", "62s",
    "54s", "53s", "52s",
    "43s", "42s",
    "32s",
  ],
  offsuit: [
    "AKo", "AQo", "AJo", "ATo", "A9o", "A8o", "A7o", "A6o", "A5o", "A4o", "A3o", "A2o",
    "KQo", "KJo", "KTo", "K9o", "K8o", "K7o", "K6o", "K5o", "K4o", "K3o", "K2o",
    "QJo", "QTo", "Q9o", "Q8o", "Q7o", "Q6o", "Q5o", "Q4o", "Q3o", "Q2o",
    "JTo", "J9o", "J8o", "J7o", "J6o", "J5o", "J4o", "J3o", "J2o",
    "T9o", "T8o", "T7o", "T6o", "T5o", "T4o", "T3o", "T2o",
    "98o", "97o", "96o", "95o", "94o", "93o", "92o",
    "87o", "86o", "85o", "84o", "83o", "82o",
    "76o", "75o", "74o", "73o", "72o",
    "65o", "64o", "63o", "62o",
    "54o", "53o", "52o",
    "43o", "42o",
    "32o",
  ],
  pairs: ["AA", "KK", "QQ", "JJ", "TT", "99", "88", "77", "66", "55", "44", "33", "22"],
};

// === Difficulty settings ===
const DIFFICULTY_SETTINGS = {
  easy: { questions: 10, timePerQuestion: 10 },
  medium: { questions: 6, timePerQuestion: 6 },
  hard: { questions: 3, timePerQuestion: 3 },
};

// Question type IDs
const QUESTION_TYPES = [
  "specificHand",
  "description",
  "totalCombinations",
  "handCombinations",
  "opponentCombinations",
];

// Types that are fixed-text “fact” questions
const FIXED_TYPES = ["description", "totalCombinations", "handCombinations"];

// ---- Utility: combos for a given hand code ----
function combosForHand(hand) {
  if (hand.endsWith("s")) return 4;   // suited
  if (hand.endsWith("o")) return 12;  // offsuit
  return 6;                           // pair
}

// ---- Utility: total number of possible hole card combos ----
function totalHoleCardCombos() {
  const suited = holeCards.suited.length * 4;
  const offsuit = holeCards.offsuit.length * 12;
  const pairs = holeCards.pairs.length * 6;
  return suited + offsuit + pairs; // 1326
}

// ---- Helper: shuffle an array ----
function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// ---- Helper: numeric options around a correct answer ----
function generateNumericOptions(correct, count = 4) {
  const options = new Set([correct]);
  const deltas = [-8, -4, -2, 2, 4, 8, 10, 12];

  let i = 0;
  while (options.size < count && i < 100) {
    const delta = deltas[Math.floor(Math.random() * deltas.length)];
    const candidate = correct + delta;
    if (candidate > 0 && candidate !== correct) {
      options.add(candidate);
    }
    i++;
  }

  return shuffle([...options]).map((n) => String(n));
}

// ---- Per-type caps depending on quiz length ----
function getMaxCountForType(type, totalQuestions) {
  if (totalQuestions >= 10) {
    if (FIXED_TYPES.includes(type)) return 2; // each fact question at most 2x
    return 3; // dynamic types can appear up to 3x
  }
  if (totalQuestions >= 6) {
    if (FIXED_TYPES.includes(type)) return 1;
    return 2;
  }
  // Very short quiz (3 questions, hard): keep it very varied
  return 1;
}

// ---- Build a question type plan for the whole quiz ----
function buildQuestionTypePlan(totalQuestions) {
  const counts = Object.fromEntries(QUESTION_TYPES.map((t) => [t, 0]));
  const plan = [];
  let lastType = null;

  for (let i = 0; i < totalQuestions; i++) {
    // Types still under their cap
    let candidates = QUESTION_TYPES.filter(
      (t) => counts[t] < getMaxCountForType(t, totalQuestions)
    );

    // Fallback: if somehow all hit cap, allow any type
    if (candidates.length === 0) {
      candidates = [...QUESTION_TYPES];
    }

    // Avoid back-to-back same type if possible
    const nonRepeat = candidates.filter((t) => t !== lastType);
    const pool = nonRepeat.length ? nonRepeat : candidates;

    const chosen =
      pool[Math.floor(Math.random() * pool.length)];

    plan.push(chosen);
    counts[chosen] += 1;
    lastType = chosen;
  }

  return plan;
}

// ---- Generate one question by a given type ----
function generateHoleCardQuestionOfType(type) {
  // 1) Specific hand: "How many ways can you have AKo?"
  if (type === "specificHand") {
    const categories = ["suited", "offsuit", "pairs"];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const list = holeCards[category];
    const hand = list[Math.floor(Math.random() * list.length)];
    const correct = combosForHand(hand); // 4 / 6 / 12

    const options = generateNumericOptions(correct, 4);

    return {
      type,
      text: `How many ways can you have ${hand}?`,
      correctAnswer: String(correct),
      options,
    };
  }

  // 2) "What is a hole card?" – definition style
  if (type === "description") {
    const correct = "Two private cards dealt to each player preflop";
    const options = shuffle([
      correct,
      "All five community cards on the board",
      "Any suited connectors",
      "The burn cards discarded by the dealer",
    ]);

    return {
      type,
      text: "What is a hole card?",
      correctAnswer: correct,
      options,
    };
  }

  // 3) Total number of hole card combinations
  if (type === "totalCombinations") {
    const correct = totalHoleCardCombos(); // 1326
    const options = shuffle([
      String(correct),
      "169",
      "52",
      "1081",
    ]);

    return {
      type,
      text: "How many distinct hole card combinations are there in Texas Hold'em?",
      correctAnswer: String(correct),
      options,
    };
  }

  // 4) Distinct hand *types* (e.g. AKs, KQo etc) – 169
  if (type === "handCombinations") {
    const correct = 169;
    const options = shuffle([
      String(correct),
      "1326",
      "81",
      "52",
    ]);

    return {
      type,
      text: "How many distinct starting hand *types* are there (e.g. AKs, KQo, 77)?",
      correctAnswer: String(correct),
      options,
    };
  }

  // 5) Opponent combo question: 2 random hands
  if (type === "opponentCombinations") {
    const allHands = [
      ...holeCards.suited,
      ...holeCards.offsuit,
      ...holeCards.pairs,
    ];

    const selected = [];
    for (let i = 0; i < 2; i++) {
      const idx = Math.floor(Math.random() * allHands.length);
      selected.push(allHands[idx]);
      allHands.splice(idx, 1);
    }

    const correct = selected
      .map((hand) => combosForHand(hand))
      .reduce((a, b) => a + b, 0);

    const options = generateNumericOptions(correct, 4);

    return {
      type,
      text: `If I put my opponent on ${selected.join(
        " and "
      )}, how many total combinations can they have?`,
      correctAnswer: String(correct),
      options,
    };
  }

  // Fallback (shouldn’t hit)
  const fallback = totalHoleCardCombos();
  return {
    type: "totalCombinations",
    text: "How many distinct hole card combinations are there?",
    correctAnswer: String(fallback),
    options: generateNumericOptions(fallback, 4),
  };
}

function HoleCardQuiz() {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState(null);

  const [questionIndex, setQuestionIndex] = useState(0);
  const [questionTypesPlan, setQuestionTypesPlan] = useState([]);

  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [quizFinished, setQuizFinished] = useState(false);
  const [questionActive, setQuestionActive] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  const timerRef = useRef(null);

  const totalQuestions =
    difficulty ? DIFFICULTY_SETTINGS[difficulty].questions : 0;
  const timePerQuestion =
    difficulty ? DIFFICULTY_SETTINGS[difficulty].timePerQuestion : 0;

  // Start a new quiz when difficulty is chosen
  useEffect(() => {
    if (!difficulty) return;

    const total = DIFFICULTY_SETTINGS[difficulty].questions;
    const plan = buildQuestionTypePlan(total);

    setQuestionTypesPlan(plan);
    setQuestionIndex(0);
    setScore(0);
    setQuizFinished(false);
    setFeedback("");
    setSelectedOption(null);

    // Initialize first question
    const firstType = plan[0];
    const q = generateHoleCardQuestionOfType(firstType);
    setCurrentQuestion(q);
    setTimeLeft(timePerQuestion);
    setQuestionActive(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty]);

  // Timer effect
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

  const goToNextQuestion = () => {
    const nextIndex = questionIndex + 1;
    if (nextIndex < totalQuestions) {
      const nextType = questionTypesPlan[nextIndex];
      const q = generateHoleCardQuestionOfType(nextType);

      setQuestionIndex(nextIndex);
      setCurrentQuestion(q);
      setSelectedOption(null);
      setFeedback("");
      setTimeLeft(timePerQuestion);
      setQuestionActive(true);
    } else {
      setQuizFinished(true);
    }
  };

  const handleOptionClick = (option) => {
    if (!questionActive || !currentQuestion) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    setQuestionActive(false);
    setSelectedOption(option);

    const correct = currentQuestion.correctAnswer;

    if (option === correct) {
      setScore((s) => s + 1);
      setFeedback("Correct!");
    } else {
      setFeedback(`Incorrect. Correct answer: ${correct}`);
    }

    setTimeout(goToNextQuestion, 1500);
  };

  const handleTimeout = () => {
    if (!currentQuestion) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    setQuestionActive(false);
    setFeedback(`Time's up! Correct answer: ${currentQuestion.correctAnswer}`);

    setTimeout(goToNextQuestion, 1500);
  };

  const handleBackToCards = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    navigate("/cards");
  };

  // === Render ===

  // Difficulty selection screen
  if (!difficulty) {
    return (
      <div className="hc-page">
        <BackButton to="/cards" label="Back to Cards Menu" />
        <div className="hc-container">
          <h1>Hole Card Quiz</h1>
          <p>Select a difficulty to start:</p>
          <div className="hc-difficulty-row">
            <button onClick={() => setDifficulty("easy")}>Easy</button>
            <button onClick={() => setDifficulty("medium")}>Medium</button>
            <button onClick={() => setDifficulty("hard")}>Hard</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hc-page">
      <BackButton to="/cards" label="Back to Cards Menu" />
      <div className="hc-container">
        <h1>Hole Card Quiz</h1>
        <p className="hc-meta">
          Difficulty: <strong>{difficulty}</strong> · Question{" "}
          {questionIndex + 1}/{totalQuestions} · Score: {score}
        </p>

        {!quizFinished && currentQuestion && (
          <>
            <div id="question-container">
              <p>{currentQuestion.text}</p>
              <div className="hc-options">
                {currentQuestion.options.map((opt) => (
                  <button
                    key={opt}
                    className={
                      !questionActive && opt === currentQuestion.correctAnswer
                        ? "hc-option correct"
                        : !questionActive && opt === selectedOption
                        ? "hc-option selected"
                        : "hc-option"
                    }
                    onClick={() => handleOptionClick(opt)}
                    disabled={!questionActive}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <p id="timer">Time left: {timeLeft}s</p>
            {feedback && <p className="hc-feedback">{feedback}</p>}
          </>
        )}

              {quizFinished && (
                  <div className="hc-finished">
                      <p>
                          Quiz over! Your score: {score}/{totalQuestions}
                      </p>
                      <button
                          className="hc-option finish-option"
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

export default HoleCardQuiz;
