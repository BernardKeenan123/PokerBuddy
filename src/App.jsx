import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Menu from "./components/Menu.jsx";
import CardsMenu from "./components/CardsMenu.jsx";
import HandRecognition from "./components/HandRecognition.jsx";
import HoleCardQuiz from "./components/HoleCardQuiz.jsx";
import PositionTraining from "./components/PositionTraining.jsx";
import RFI from "./components/RFI.jsx";
import Chips from "./components/Chips.jsx";
import Position from "./components/Position.jsx";
import MScore from "./components/MScore.jsx";
import EffectiveM from "./components/EffectiveM.jsx";

function App() {
  return (
    <Router>
      <Routes>
        {/* Main menu */}
        <Route path="/" element={<Menu />} />

        {/* Chips */}
        <Route path="/chips" element={<Chips />} />
        <Route path="/mscore" element={<MScore />} />
        <Route path="/effective-m" element={<EffectiveM />} />

        {/* Cards */}
        <Route path="/cards" element={<CardsMenu />} />
        <Route path="/hand-recognition" element={<HandRecognition />} />
        <Route path="/hole-card-quiz" element={<HoleCardQuiz />} />

        {/* Position */}
        <Route path="/position" element={<Position />} />
        <Route path="/position-training" element={<PositionTraining />} />
        <Route path="/rfi" element={<RFI />} />
      </Routes>
    </Router>
  );
}

export default App;
