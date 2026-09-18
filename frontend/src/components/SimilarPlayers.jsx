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
              key={`${player.player_id}-${index}`}
              className={`player-card ${
                isBestFit ? "best-fit-card" : ""
              }`}
            >

              {/* BEST FIT RIBBON */}

              {isBestFit && (
                <div className="best-fit-ribbon">
                  BEST FIT
                </div>
              )}


              {/* RANK */}

              <div className="player-rank">
                #{index + 1}
              </div>


              {/* PLAYER DETAILS */}

              <div className="player-details">

                <h3>
                  {player.short_name || "Unknown Player"}
                </h3>


                {/* SIMILARITY */}

                <div className="similarity">

                  <span>
                    Similarity
                  </span>

                  <strong>
                    {(player.similarity * 100).toFixed(2)}%
                  </strong>

                </div>


                {/* SIMILARITY BAR */}

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


                {/* PLAYER INFORMATION */}

                <div className="player-info">

                  <div className="info-item">
                    <span className="info-label">
                      Position
                    </span>

                    <span className="info-value">
                      {player.primary_position || "N/A"}
                    </span>
                  </div>


                  <div className="info-item">
                    <span className="info-label">
                      Age
                    </span>

                    <span className="info-value">
                      {player.age ?? "N/A"}
                    </span>
                  </div>


                  <div className="info-item">
                    <span className="info-label">
                      Overall
                    </span>

                    <span className="info-value">
                      {player.overall ?? "N/A"}
                    </span>
                  </div>


                  <div className="info-item">
                    <span className="info-label">
                      Pace
                    </span>

                    <span className="info-value">
                      {player.pace ?? "N/A"}
                    </span>
                  </div>


                  <div className="info-item">
                    <span className="info-label">
                      Shooting
                    </span>

                    <span className="info-value">
                      {player.shooting ?? "N/A"}
                    </span>
                  </div>


                  <div className="info-item">
                    <span className="info-label">
                      Passing
                    </span>

                    <span className="info-value">
                      {player.passing ?? "N/A"}
                    </span>
                  </div>


                  <div className="info-item">
                    <span className="info-label">
                      Dribbling
                    </span>

                    <span className="info-value">
                      {player.dribbling ?? "N/A"}
                    </span>
                  </div>


                  <div className="info-item">
                    <span className="info-label">
                      Defending
                    </span>

                    <span className="info-value">
                      {player.defending ?? "N/A"}
                    </span>
                  </div>


                  <div className="info-item">
                    <span className="info-label">
                      Physic
                    </span>

                    <span className="info-value">
                      {player.physic ?? "N/A"}
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