import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Menu.css";

function Menu() {
  const [showTrainOptions, setShowTrainOptions] = useState(false);
  const navigate = useNavigate();

const handlePlayClick = () => {
  // Intentionally left blank for now – Play doesn't go anywhere yet.
};

  const handleTrainClick = () => {
    setShowTrainOptions((prev) => !prev);
  };

  return (
    <div className="menu-page">
      <div className="menu-container">
        <button id="play-btn" className="main-btn" onClick={handlePlayClick}>
          Play
        </button>

        {/* Train + orbiting options */}
        <div className="train-wrapper">
          <button
            id="train-btn"
            className="main-btn"
            onClick={handleTrainClick}
          >
            Train
          </button>

          <div className={`train-options ${showTrainOptions ? "show" : ""}`}>
            <button
              id="cards-btn"
              className="train-btn"
              onClick={() => navigate("/cards")}
            >
              Cards
            </button>
            <button
              id="chips-btn"
              className="train-btn"
              onClick={() => navigate("/chips")}
            >
              Chips
            </button>
            <button
              id="position-btn"
              className="train-btn"
              onClick={() => navigate("/position")}
            >
              Position
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Menu;
