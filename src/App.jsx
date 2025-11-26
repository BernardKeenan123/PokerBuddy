import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Menu from "./components/Menu.jsx";
import CardsMenu from "./components/CardsMenu.jsx";
import HandRecognition from "./components/HandRecognition.jsx";
import HoleCardQuiz from "./components/HoleCardQuiz.jsx";

// Temporary placeholder components so the menu buttons don't crash:
import Chips from "./components/Chips.jsx";
import Position from "./components/Position.jsx";

function App() {
  return (
    <Router>
      <Routes>
        {/* Main menu */}
        <Route path="/" element={<Menu />} />

        {/* Cards section */}
        <Route path="/cards" element={<CardsMenu />} />

        {/* Placeholder pages for now */}
        <Route path="/chips" element={<Chips />} />
        <Route path="/position" element={<Position />} />

        
        <Route path="/hand-recognition" element={<HandRecognition />} />
        <Route path="/hole-card-quiz" element={<HoleCardQuiz />} />
        


      </Routes>
    </Router>
  );
}

export default App;
