import { useMemo, useState } from "react";
import { comparePlayers } from "../services/api";
import PlayerAutocomplete from "../components/PlayerAutocomplete";
import PlayerAvatar from "../components/PlayerAvatar";
import { useResolvedImages } from "../hooks/useResolvedImages";

const CORE_STATS = [
  "pace",
  "shooting",
  "passing",
  "dribbling",
  "defending",
  "physic",
];

function emptyIdentifier() {
  return { text: "", playerId: null };
}

function ComparePage() {
  const [identifiers, setIdentifiers] = useState([
    emptyIdentifier(),
    emptyIdentifier(),
  ]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const playerNames = useMemo(
    () => [...new Set((result?.players || []).map((p) => p.short_name))],
    [result]
  );
  const images = useResolvedImages({ players: playerNames });

  function handleIdentifierChange(index, text) {
    setIdentifiers((previous) => {
      const updated = [...previous];
      updated[index] = { text, playerId: null };
      return updated;
    });
  }

  function handleIdentifierSelect(index, player) {
    setIdentifiers((previous) => {
      const updated = [...previous];
      updated[index] = {
        text: player.short_name,
        playerId: player.player_id,
      };
      return updated;
    });
  }

  function addIdentifier() {
    setIdentifiers((previous) => [...previous, emptyIdentifier()]);
  }

  function removeIdentifier(index) {
    setIdentifiers((previous) =>
      previous.filter((_, i) => i !== index)
    );
  }

  async function handleCompare() {
    const values = identifiers
      .map((identifier) => identifier.playerId ?? identifier.text.trim())
      .filter((value) => value !== "");

    if (values.length < 2) {
      setError("Enter at least 2 player names or IDs.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await comparePlayers(values);
      setResult(data);
    } catch (err) {
      console.error("Error comparing players:", err);
      setError(err.message || "Unable to compare players.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <header className="header">
        <h1>Compare Players</h1>
        <p>Compare stats and similarity across two or more players</p>
      </header>

      <main>
        <section className="search-section">
          <h2>Players to Compare</h2>

          <div className="identifier-list">
            {identifiers.map((identifier, index) => (
              <div className="identifier-row" key={index}>
                <PlayerAutocomplete
                  value={identifier.text}
                  placeholder="Player name or player_id"
                  onChange={(text) => handleIdentifierChange(index, text)}
                  onSelect={(player) =>
                    handleIdentifierSelect(index, player)
                  }
                />

                {identifiers.length > 2 && (
                  <button
                    type="button"
                    className="remove-identifier"
                    onClick={() => removeIdentifier(index)}
                    aria-label="Remove player"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            className="optional-toggle"
            onClick={addIdentifier}
          >
            <span>+</span>
            Add another player
          </button>

          <div className="search-action">
            <button onClick={handleCompare} disabled={loading}>
              {loading ? "Comparing..." : "Compare Players"}
            </button>
          </div>

          {error && <p className="error-message">{error}</p>}
        </section>

        {loading && (
          <div className="loading">Comparing players...</div>
        )}

        {!loading && result && (
          <section className="results-section">
            <div className="results-header">
              <h2>Comparison</h2>
            </div>

            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Player</th>
                    <th>Position</th>
                    <th>Overall</th>
                    <th>Age</th>
                    {CORE_STATS.map((stat) => (
                      <th key={stat}>{stat}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.players.map((player) => (
                    <tr key={player.player_id}>
                      <td>
                        <span className="table-thumb">
                          <PlayerAvatar
                            url={images.players[player.short_name]}
                            name={player.short_name}
                            size={28}
                          />
                        </span>
                        {player.short_name}
                      </td>
                      <td>{player.primary_position ?? "N/A"}</td>
                      <td>{player.overall ?? "N/A"}</td>
                      <td>{player.age ?? "N/A"}</td>
                      {CORE_STATS.map((stat) => (
                        <td key={stat}>{player[stat] ?? "N/A"}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {result.pairwise_similarity?.length > 0 && (
              <div className="sub-section">
                <h3>Pairwise Similarity</h3>

                <ul className="pairwise-list">
                  {result.pairwise_similarity.map((pair, index) => (
                    <li key={index}>
                      <span>
                        {pair.player_a} vs {pair.player_b}
                      </span>
                      <strong>
                        {(pair.similarity * 100).toFixed(2)}%
                      </strong>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.biggest_differences && (
              <div className="sub-section">
                <h3>Biggest Differences</h3>

                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Attribute</th>
                        <th>Difference</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(result.biggest_differences).map(
                        ([stat, diff]) => (
                          <tr key={stat}>
                            <td>{stat}</td>
                            <td>{diff > 0 ? `+${diff}` : diff}</td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        )}
      </main>
    </>
  );
}

export default ComparePage;
