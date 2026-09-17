function formatValue(value) {
  if (value === null || value === undefined) {
    return "N/A";
  }

  if (value >= 1000000) {
    return `€${(value / 1000000).toFixed(1)}M`;
  }

  if (value >= 1000) {
    return `€${(value / 1000).toFixed(1)}K`;
  }

  return `€${value}`;
}

function formatWage(wage) {
  if (wage === null || wage === undefined) {
    return "N/A";
  }

  if (wage >= 1000000) {
    return `€${(wage / 1000000).toFixed(1)}M`;
  }

  if (wage >= 1000) {
    return `€${(wage / 1000).toFixed(1)}K`;
  }

  return `€${wage}`;
}

function SimilarPlayers({ players }) {
  if (!players || players.length === 0) {
    return null;
  }

  return (
    <section className="results-section">
      <div className="results-header">
        <h2>Similar Players</h2>

        <span className="results-count">
          Showing {players.length} similar players
        </span>
      </div>

      <div className="players-grid">
        {players.map((player, index) => {
          const isBestFit = index === 0;

          return (
            <div
              className={`player-card ${
                isBestFit ? "best-fit-card" : ""
              }`}
              key={`${player.name}-${index}`}
            >
              {isBestFit && (
                <div className="best-fit-ribbon">
                  BEST FIT
                </div>
              )}

              <div className="player-rank">
                #{index + 1}
              </div>

              <div className="player-details">
                <h3>{player.name}</h3>

                <div className="similarity">
                  <span>Similarity</span>

                  <strong>
                    {(player.similarity * 100).toFixed(2)}%
                  </strong>
                </div>

                <div className="similarity-bar">
                  <div
                    className="similarity-progress"
                    style={{
                      width: `${player.similarity * 100}%`,
                    }}
                  ></div>
                </div>

                <div className="player-info">

                  <div className="info-item">
                    <span className="info-label">
                      Club
                    </span>

                    <span className="info-value">
                      {player.club_name || "N/A"}
                    </span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">
                      League
                    </span>

                    <span className="info-value">
                      {player.league_name || "N/A"}
                    </span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">
                      Market Value
                    </span>

                    <span className="info-value">
                      {formatValue(player.value)}
                    </span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">
                      Weekly Wage
                    </span>

                    <span className="info-value">
                      {formatWage(player.wage_eur)}
                    </span>
                  </div>

                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default SimilarPlayers;