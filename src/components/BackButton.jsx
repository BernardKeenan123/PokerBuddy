import { useNavigate } from "react-router-dom";
import "../styles/BackButton.css";

function BackButton({ to, label = "Back" }) {
  const navigate = useNavigate();

  return (
    <button className="back-btn" onClick={() => navigate(to)}>
      {label}
    </button>
  );
}

export default BackButton;
