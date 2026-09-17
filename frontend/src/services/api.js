const API_URL = "http://127.0.0.1:6050";

export async function getSimilarPlayers(playerName, topK) {
  const response = await fetch(`${API_URL}/api/players/similar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      player_name: playerName,
      top_k: topK,
    }),
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}