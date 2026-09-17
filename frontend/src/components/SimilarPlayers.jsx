function SimilarPlayers({ players }) {
  if (!players || players.length === 0) {
    return null;
  }

  return (
    <section className="results-section">
      <h2>Similar Players</h2>

      <div className="players-grid">
        {players.map((player, index) => (
          <div className="player-card" key={`${player.name}-${index}`}>
            <div className="player-rank">
              #{index + 1}
            </div>

            <div className="player-details">
              <h3>{player.name}</h3>

              <p>
                Similarity:{" "}
                <strong>
                  {(player.similarity * 100).toFixed(2)}%
                </strong>
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default SimilarPlayers;