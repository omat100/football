import { useState } from "react";

function ClubIcon() {
  return (
    <svg
      className="meta-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M12 3L20 6V11C20 16.2 16.8 19.8 12 21C7.2 19.8 4 16.2 4 11V6L12 3Z" />
      <path d="M12 7L13.2 9.4L15.8 9.8L13.9 11.7L14.3 14.3L12 13.1L9.7 14.3L10.1 11.7L8.2 9.8L10.8 9.4L12 7Z" />
    </svg>
  );
}

function LeagueIcon() {
  return (
    <svg
      className="meta-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M7 4H17V7C17 10.3 14.8 13 12 13C9.2 13 7 10.3 7 7V4Z" />
      <path d="M7 5H4V6C4 9 5.8 11 8.2 11.6" />
      <path d="M17 5H20V6C20 9 18.2 11 15.8 11.6" />
      <path d="M12 13V17" />
      <path d="M8 20H16" />
      <path d="M9 17H15" />
    </svg>
  );
}

function ValueIcon() {
  return (
    <svg
      className="meta-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <ellipse cx="8" cy="7" rx="4" ry="2" />
      <path d="M4 7V10C4 11.1 5.8 12 8 12C10.2 12 12 11.1 12 10V7" />
      <path d="M4 10V13C4 14.1 5.8 15 8 15C10.2 15 12 14.1 12 13" />
      <path d="M4 13V16C4 17.1 5.8 18 8 18C10.2 18 12 17.1 12 16" />
      <ellipse cx="16" cy="11" rx="4" ry="2" />
      <path d="M12 11V14C12 15.1 13.8 16 16 16C18.2 16 20 15.1 20 14V11" />
      <path d="M12 14V17C12 18.1 13.8 19 16 19C18.2 19 20 18.1 20 17V14" />
    </svg>
  );
}

function WageIcon() {
  return (
    <svg
      className="meta-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3V7" />
      <path d="M16 3V7" />
      <path d="M4 10H20" />
      <path d="M8 14H8.01" />
      <path d="M12 14H12.01" />
      <path d="M16 14H16.01" />
      <path d="M8 17H8.01" />
      <path d="M12 17H12.01" />
    </svg>
  );
}

function SimilarPlayers({ players }) {
  const [expandedPlayers, setExpandedPlayers] = useState(new Set());

  if (!players || players.length === 0) {
    return null;
  }

  function togglePlayer(playerId) {
    setExpandedPlayers((previousExpanded) => {
      const updated = new Set(previousExpanded);

      if (updated.has(playerId)) {
        updated.delete(playerId);
      } else {
        updated.add(playerId);
      }

      return updated;
    });
  }

  function formatMoney(value) {
    if (value === null || value === undefined || value === "") {
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
          const playerKey = player.player_id ?? index;
          const isExpanded = expandedPlayers.has(playerKey);

          return (
            <div
              key={`${playerKey}-${index}`}
              className={`player-card ${
                isBestFit ? "best-fit-card" : ""
              }`}
            >
              {isBestFit && (
                <div className="best-fit-ribbon">
                  BEST FIT
                </div>
              )}

              <div className="player-details">

                {/* Rank */}
                <div className="player-rank">
                  #{index + 1}
                </div>

                {/* Player name */}
                <h3 className="player-name">
                  {player.long_name ||
                    player.short_name ||
                    "Unknown Player"}
                </h3>

                {/* Similarity */}
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
                      width: `${Math.max(
                        0,
                        Math.min(
                          player.similarity * 100,
                          100
                        )
                      )}%`,
                    }}
                  />
                </div>

                {/* Main player information */}
                <div className="player-main-info">

                  {/* Club */}
                  <div className="meta-block">
                    <div className="meta-icon-wrapper">
                      <ClubIcon />
                    </div>

                    <div>
                      <span className="info-label">
                        Club
                      </span>

                      <span className="info-value">
                        {player.club_name || "N/A"}
                      </span>
                    </div>
                  </div>

                  {/* League */}
                  <div className="meta-block">
                    <div className="meta-icon-wrapper">
                      <LeagueIcon />
                    </div>

                    <div>
                      <span className="info-label">
                        League
                      </span>

                      <span className="info-value">
                        {player.league_name || "N/A"}
                      </span>
                    </div>
                  </div>

                  {/* Market Value */}
                  <div className="meta-block">
                    <div className="meta-icon-wrapper">
                      <ValueIcon />
                    </div>

                    <div>
                      <span className="info-label">
                        Market Value
                      </span>

                      <span className="info-value">
                        {formatMoney(player.value_eur)}
                      </span>
                    </div>
                  </div>

                  {/* Weekly Wage */}
                  <div className="meta-block">
                    <div className="meta-icon-wrapper">
                      <WageIcon />
                    </div>

                    <div>
                      <span className="info-label">
                        Weekly Wage
                      </span>

                      <span className="info-value">
                        {formatMoney(player.wage_eur)}
                      </span>
                    </div>
                  </div>

                </div>

                {/* Player details toggle */}
                <button
                  type="button"
                  className={`player-details-toggle ${
                    isExpanded
                      ? "player-details-toggle-expanded"
                      : ""
                  }`}
                  onClick={() => togglePlayer(playerKey)}
                  aria-expanded={isExpanded}
                >
                  <span className="details-toggle-icon">
                    {isExpanded ? "−" : "+"}
                  </span>

                  <span>
                    Player details
                  </span>

                  <span
                    className={`details-chevron ${
                      isExpanded ? "chevron-up" : ""
                    }`}
                  >
                    ›
                  </span>
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="player-extra-details">

                    <div className="detail-box">
                      <span className="detail-label">
                        Position
                      </span>

                      <span className="detail-value">
                        {player.primary_position || "N/A"}
                      </span>
                    </div>

                    <div className="detail-box">
                      <span className="detail-label">
                        Overall
                      </span>

                      <span className="detail-value">
                        {player.overall ?? "N/A"}
                      </span>
                    </div>

                    <div className="detail-box">
                      <span className="detail-label">
                        Age
                      </span>

                      <span className="detail-value">
                        {player.age ?? "N/A"}
                      </span>
                    </div>

                    <div className="detail-box">
                      <span className="detail-label">
                        Height
                      </span>

                      <span className="detail-value">
                        {player.height_cm
                          ? `${player.height_cm} cm`
                          : "N/A"}
                      </span>
                    </div>

                    <div className="detail-box">
                      <span className="detail-label">
                        Pace
                      </span>

                      <span className="detail-value">
                        {player.pace ?? "N/A"}
                      </span>
                    </div>

                    <div className="detail-box">
                      <span className="detail-label">
                        Shooting
                      </span>

                      <span className="detail-value">
                        {player.shooting ?? "N/A"}
                      </span>
                    </div>

                    <div className="detail-box">
                      <span className="detail-label">
                        Passing
                      </span>

                      <span className="detail-value">
                        {player.passing ?? "N/A"}
                      </span>
                    </div>

                    <div className="detail-box">
                      <span className="detail-label">
                        Dribbling
                      </span>

                      <span className="detail-value">
                        {player.dribbling ?? "N/A"}
                      </span>
                    </div>

                    <div className="detail-box">
                      <span className="detail-label">
                        Defending
                      </span>

                      <span className="detail-value">
                        {player.defending ?? "N/A"}
                      </span>
                    </div>

                    <div className="detail-box">
                      <span className="detail-label">
                        Physic
                      </span>

                      <span className="detail-value">
                        {player.physic ?? "N/A"}
                      </span>
                    </div>

                  </div>
                )}

              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default SimilarPlayers;