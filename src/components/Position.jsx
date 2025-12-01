import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/position.css";
import BackButton from "./BackButton";

function Position() {
  const [showOptions, setShowOptions] = useState(false);
  const navigate = useNavigate();

  const toggleOptions = () => setShowOptions((prev) => !prev);

  return (
    <div className="position-page">
      <BackButton to="/" label="Back to Menu" />

      <div className="position-menu-container">
        <div className="position-wrapper">
          <button
            className="position-main-btn"
            onClick={toggleOptions}
          >
            Position
          </button>

          <div className={`position-options ${showOptions ? "show" : ""}`}>
            {/* Seat Names (PositionTraining) */}
            <button
              id="seatnames-btn"
              className="position-option-btn"
              onClick={() => navigate("/position-training")}
            >
              Seat Names
            </button>

            {/* RFI */}
            <button
              id="rfi-btn"
              className="position-option-btn"
              onClick={() => navigate("/rfi")}
            >
              RFI
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Position;
