import { useMemo, useState } from "react";
import { getSimilarPlayers } from "../services/api";
import PlayerAutocomplete from "../components/PlayerAutocomplete";
import PlayerAvatar from "../components/PlayerAvatar";
import ClubLogo from "../components/ClubLogo";
import LeagueLogo from "../components/LeagueLogo";
import { useResolvedImages } from "../hooks/useResolvedImages";

function formatMoney(value) {
  if (value === null || value === undefined) {
    return "N/A";
  }

  const number = Number(value);
  if (Number.isNaN(number)) {
    return "N/A";
  }

  if (number >= 1000000) {
    return `€${(number / 1000000).toFixed(1)}M`;
  }

  if (number >= 1000) {
    return `€${(number / 1000).toFixed(0)}K`;
  }

  return `€${number.toLocaleString()}`;
}

function SimilarPlayersPage() {
  const [playerName, setPlayerName] = useState("");
  const [topK, setTopK] = useState(10);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const clubNames = useMemo(
    () => [...new Set(players.map((p) => p.club_name).filter(Boolean))],
    [players]
  );
  const leagueIds = useMemo(
    () => [...new Set(players.map((p) => p.league_id).filter(Boolean))],
    [players]
  );
  const playerNames = useMemo(
    () => [...new Set(players.map((p) => p.name).filter(Boolean))],
    [players]
  );
  const images = useResolvedImages({
    clubs: clubNames,
    leagues: leagueIds,
    players: playerNames,
  });

  async function handleSearch() {
    if (!playerName.trim()) {
      setError("Enter a player name.");
      return;
    }

    setLoading(true);
    setError("");
    setPlayers([]);

    try {
      const result = await getSimilarPlayers(playerName.trim(), topK);
      setPlayers(result);
    } catch (err) {
      console.error("Error fetching similar players:", err);
      setError(err.message || "Unable to get similar players.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <header className="header">
        <h1>Similar Players</h1>
        <p>Find statistically similar players by name (baseline model)</p>
      </header>

      <main>
        <section className="search-section">
          <h2>Search by Player Name</h2>

          <div className="search-controls">
            <div className="control-group position-control">
              <label htmlFor="playerName">Player Name</label>
              <PlayerAutocomplete
                id="playerName"
                value={playerName}
                placeholder="e.g. L. Messi"
                onChange={setPlayerName}
                onSelect={(player) => setPlayerName(player.short_name)}
              />
            </div>

            <div className="control-group top-k-control">
              <label htmlFor="topK">Results</label>
              <select
                id="topK"
                value={topK}
                onChange={(event) => setTopK(Number(event.target.value))}
              >
                <option value={5}>Top 5</option>
                <option value={10}>Top 10</option>
                <option value={15}>Top 15</option>
                <option value={20}>Top 20</option>
              </select>
            </div>
          </div>

          <div className="search-action">
            <button onClick={handleSearch} disabled={loading}>
              {loading ? "Searching..." : "Find Similar Players"}
            </button>
          </div>

          {error && <p className="error-message">{error}</p>}
        </section>

        {loading && (
          <div className="loading">Searching for similar players...</div>
        )}

        {!loading && players.length > 0 && (
          <section className="results-section">
            <div className="results-header">
              <h2>Similar Players</h2>
              <span className="results-count">
                Showing {players.length} similar players
              </span>
            </div>

            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Player</th>
                    <th>Club</th>
                    <th>League</th>
                    <th>Value</th>
                    <th>Wage</th>
                    <th>Similarity</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player, index) => (
                    <tr key={index}>
                      <td>
                        <span className="table-thumb">
                          <PlayerAvatar
                            url={images.players[player.name]}
                            name={player.name}
                            size={28}
                          />
                        </span>
                        {player.name}
                      </td>
                      <td>
                        {player.club_name ? (
                          <span className="table-inline-logo">
                            <ClubLogo
                              url={images.clubs[player.club_name]}
                              name={player.club_name}
                              size={18}
                            />
                            {player.club_name}
                          </span>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td>
                        {player.league_name ? (
                          <span className="table-inline-logo">
                            <LeagueLogo
                              url={images.leagues[player.league_id]}
                              name={player.league_name}
                              size={18}
                            />
                            {player.league_name}
                          </span>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td>{formatMoney(player.value)}</td>
                      <td>{formatMoney(player.wage_eur)}</td>
                      <td>{(player.similarity * 100).toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </>
  );
}

export default SimilarPlayersPage;
