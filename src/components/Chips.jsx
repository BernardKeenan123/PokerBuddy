import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/chips.css";
import BackButton from "./BackButton";

function Chips() {
  const [showOptions, setShowOptions] = useState(false);
  const navigate = useNavigate();

  const handleChipsClick = () => {
    setShowOptions((prev) => !prev);
  };

  return (
    <div className="chips-page">
      <BackButton to="/" label="Back to Menu" />

      <div className="chips-menu-container">
        <div className="chips-wrapper">
          <button
            id="chips-main-btn"
            className="chips-main-btn"
            onClick={handleChipsClick}
          >
            Chips
          </button>

          <div className={`chips-options ${showOptions ? "show" : ""}`}>
            <button
              id="mscore-btn"
              className="chips-option-btn"
              onClick={() => navigate("/mscore")}
            >
              M-Score
            </button>

            <button
              id="effectiveM-btn"
              className="chips-option-btn"
              onClick={() => navigate("/effective-m")}
            >
              Effective M
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chips;

