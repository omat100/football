import { useMemo, useState } from "react";
import { getPlayerPricing } from "../services/api";
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

function verdictClass(verdict) {
  if (verdict === "overvalued") return "verdict-badge verdict-over";
  if (verdict === "undervalued") return "verdict-badge verdict-under";
  if (verdict === "fairly valued") return "verdict-badge verdict-fair";
  return "verdict-badge";
}

function PricingPage() {
  const [playerQuery, setPlayerQuery] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [k, setK] = useState(15);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const clubNames = useMemo(() => {
    if (!result) return [];
    return [
      ...new Set(
        [result.club_name, ...(result.comparables || []).map((p) => p.club_name)].filter(
          Boolean
        )
      ),
    ];
  }, [result]);
  const leagueIds = useMemo(() => {
    if (!result) return [];
    return [
      ...new Set(
        [result.league_id, ...(result.comparables || []).map((p) => p.league_id)].filter(
          (id) => id !== null && id !== undefined
        )
      ),
    ];
  }, [result]);
  const playerNames = useMemo(() => {
    if (!result) return [];
    return [
      ...new Set(
        [result.short_name, ...(result.comparables || []).map((p) => p.short_name)].filter(
          Boolean
        )
      ),
    ];
  }, [result]);
  const images = useResolvedImages({
    clubs: clubNames,
    leagues: leagueIds,
    players: playerNames,
  });

  function handleQueryChange(text) {
    setPlayerQuery(text);
    setSelectedPlayer(null);
  }

  function handlePlayerSelect(player) {
    setPlayerQuery(player.short_name);
    setSelectedPlayer(player);
  }

  async function handleLookup() {
    if (!selectedPlayer) {
      setError("Search for a player and pick one from the suggestions.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await getPlayerPricing(selectedPlayer.player_id, k);
      setResult(data);
    } catch (err) {
      console.error("Error fetching pricing:", err);
      setError(err.message || "Unable to fetch player pricing.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <header className="header">
        <h1>Player Pricing</h1>
        <p>
          Estimate a player&apos;s market value from similar players
        </p>
      </header>

      <main>
        <section className="search-section">
          <h2>Look Up a Player</h2>

          <div className="search-controls">
            <div className="control-group position-control">
              <label htmlFor="playerQuery">Player Name</label>
              <PlayerAutocomplete
                id="playerQuery"
                value={playerQuery}
                placeholder="e.g. L. Messi"
                onChange={handleQueryChange}
                onSelect={handlePlayerSelect}
              />
            </div>

            <div className="control-group top-k-control">
              <label htmlFor="k">Comparables</label>
              <select
                id="k"
                value={k}
                onChange={(event) => setK(Number(event.target.value))}
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
              </select>
            </div>
          </div>

          <div className="search-action">
            <button
              onClick={handleLookup}
              disabled={loading || !selectedPlayer}
            >
              {loading ? "Estimating..." : "Estimate Value"}
            </button>
          </div>

          {error && <p className="error-message">{error}</p>}
        </section>

        {loading && (
          <div className="loading">Estimating market value...</div>
        )}

        {!loading && result && (
          <section className="results-section">
            <div className="pricing-summary">
              <div className="pricing-summary-header">
                <div className="pricing-identity">
                  <PlayerAvatar
                    url={images.players[result.short_name]}
                    name={result.short_name}
                    size={48}
                  />

                  <div>
                    <h2>{result.short_name}</h2>

                    {(result.club_name || result.league_name) && (
                      <div className="pricing-club-league">
                        {result.club_name && (
                          <>
                            <ClubLogo
                              url={images.clubs[result.club_name]}
                              name={result.club_name}
                              size={18}
                            />
                            <span>{result.club_name}</span>
                          </>
                        )}

                        {result.league_name && (
                          <>
                            <LeagueLogo
                              url={images.leagues[result.league_id]}
                              name={result.league_name}
                              size={18}
                            />
                            <span>{result.league_name}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {result.verdict && (
                  <span className={verdictClass(result.verdict)}>
                    {result.verdict}
                  </span>
                )}
              </div>

              <div className="pricing-figures">
                <div className="pricing-figure">
                  <span className="info-label">Actual Value</span>
                  <span className="info-value">
                    {formatMoney(result.actual_value_eur)}
                  </span>
                </div>

                <div className="pricing-figure">
                  <span className="info-label">Estimated Value</span>
                  <span className="info-value">
                    {formatMoney(result.estimated_value_eur)}
                  </span>
                </div>

                <div className="pricing-figure">
                  <span className="info-label">Comparable Range</span>
                  <span className="info-value">
                    {formatMoney(result.value_range?.min)} –{" "}
                    {formatMoney(result.value_range?.max)}
                  </span>
                </div>
              </div>
            </div>

            <div className="sub-section">
              <h3>Comparable Players</h3>

              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Player</th>
                      <th>Position</th>
                      <th>Overall</th>
                      <th>Value</th>
                      <th>Similarity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.comparables?.map((player) => (
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
                        <td>{formatMoney(player.value_eur)}</td>
                        <td>{(player.similarity * 100).toFixed(2)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}

export default PricingPage;
