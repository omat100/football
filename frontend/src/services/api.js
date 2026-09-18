const API_URL = "http://127.0.0.1:6050";

export async function getSimilarPlayers(
  desired,
  position,
  topK
) {
  const response = await fetch(
    `${API_URL}/api/scouting/`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        desired,
        position,
        top_k: topK,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `API request failed: ${response.status} ${errorText}`
    );
  }

  return response.json();
}