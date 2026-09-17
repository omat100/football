import { useState } from "react";
import { getSimilarPlayers } from "./services/api";
import SimilarPlayers from "./components/SimilarPlayers";
import "./App.css";

function App() {
  const [playerName, setPlayerName] = useState("");
  const [topK, setTopK] = useState(10);

  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch() {
    if (!playerName.trim()) {
      setError("Please enter a player name.");
      setPlayers([]);
      return;
    }

    setLoading(true);
    setError("");
    setPlayers([]);

    try {
      const result = await getSimilarPlayers(
        playerName.trim(),
        topK
      );

      setPlayers(result);
    } catch (error) {
      console.error("Error fetching similar players:", error);

      setError(
        "Unable to get similar players. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      handleSearch();
    }
  }

  return (
    <div className="app">

      {/* Header */}
      <header className="header">
        <h1>Football Player Analytics</h1>

        <p>
          Find players similar to your selected player
        </p>
      </header>


      {/* Main Content */}
      <main>

        {/* Search Section */}
        <section className="search-section">

          <h2>Find Similar Players</h2>

          <div className="search-controls">

            {/* Player Search */}
            <input
              type="text"
              placeholder="Enter player name..."
              value={playerName}
              onChange={(event) =>
                setPlayerName(event.target.value)
              }
              onKeyDown={handleKeyDown}
            />


            {/* Top K Selection */}
            <select
              value={topK}
              onChange={(event) =>
                setTopK(Number(event.target.value))
              }
            >
              <option value={5}>Top 5</option>
              <option value={10}>Top 10</option>
              <option value={15}>Top 15</option>
              <option value={20}>Top 20</option>
            </select>


            {/* Search Button */}
            <button
              onClick={handleSearch}
              disabled={loading}
            >
              {loading
                ? "Searching..."
                : "Find Similar Players"}
            </button>

          </div>


          {/* Error Message */}
          {error && (
            <p className="error-message">
              {error}
            </p>
          )}

        </section>


        {/* Loading Message */}
        {loading && (
          <div className="loading">
            Searching for similar players...
          </div>
        )}


        {/* Results */}
        {!loading && players.length > 0 && (
          <SimilarPlayers players={players} />
        )}

      </main>

    </div>
  );
}

export default App;