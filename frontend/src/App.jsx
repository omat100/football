import { Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import ScoutSearchPage from "./pages/ScoutSearchPage";
import ComparePage from "./pages/ComparePage";
import PricingPage from "./pages/PricingPage";
import SimilarPlayersPage from "./pages/SimilarPlayersPage";
import "./App.css";

function App() {
  return (
    <div className="app">
      <NavBar />

      <Routes>
        <Route path="/" element={<ScoutSearchPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/similar" element={<SimilarPlayersPage />} />
      </Routes>
    </div>
  );
}

export default App;
