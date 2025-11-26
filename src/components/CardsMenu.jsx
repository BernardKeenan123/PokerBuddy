import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/cards.css";

function CardsMenu() {
  const navigate = useNavigate();
  const [showOptions, setShowOptions] = useState(false);

  const handleCardsClick = () => {
    setShowOptions((prev) => !prev);
  };

  return (
    <div className="cards-page">
      <button className="back-btn" onClick={() => navigate("/")}>
        Back to Menu
      </button>

      <div className="cards-menu-container">
        <div className="cards-wrapper">
          {/* main Cards button in the middle */}
          <button
            id="cards-main-btn"
            className="cards-main-btn"
            onClick={handleCardsClick}
          >
            Cards
          </button>

          {/* options orbiting around Cards */}
          <div className={`cards-options ${showOptions ? "show" : ""}`}>
            <button
              id="hand-recognition-btn"
              className="cards-option-btn"
              onClick={() => navigate("/hand-recognition")}
            >
              Hand Recognition
            </button>
            <button
              id="hole-card-quiz-btn"
              className="cards-option-btn"
              onClick={() => navigate("/hole-card-quiz")}
            >
              Hole Card Quiz
            </button>

            {/* If you add more card games later, copy one of the buttons above
                and they will automatically orbit around the Cards button too. */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardsMenu;
