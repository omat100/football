const API_URL = import.meta.env.VITE_API_URL || "https://football-c1y0.onrender.com";
const DEFAULT_TIMEOUT_MS = 20000;

async function fetchWithTimeout(url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(
        `Request timed out after ${timeoutMs / 1000}s - the server may be waking up or overloaded, try again.`,
        { cause: error }
      );
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function handleResponse(response) {
  if (!response.ok) {
    const errorText = await response.text();
    let message = null;

    try {
      const parsed = JSON.parse(errorText);
      message = Array.isArray(parsed.error)
        ? parsed.error.join(", ")
        : parsed.error;
    } catch {
      // response body wasn't JSON; fall back to raw text below
    }

    throw new Error(
      message || `API request failed: ${response.status} ${errorText}`
    );
  }

  return response.json();
}

export async function scoutSearch(desired, position, topK) {
  const response = await fetchWithTimeout(`${API_URL}/api/scouting/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      desired,
      position,
      top_k: topK,
    }),
  });

  return handleResponse(response);
}

export async function comparePlayers(players) {
  const response = await fetchWithTimeout(`${API_URL}/api/scouting/compare`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ players }),
  });

  return handleResponse(response);
}

export async function getPlayerPricing(playerId, k) {
  const params = k ? `?k=${encodeURIComponent(k)}` : "";
  const response = await fetchWithTimeout(
    `${API_URL}/api/scouting/pricing/${encodeURIComponent(playerId)}${params}`
  );

  return handleResponse(response);
}

export async function resolveImages({ clubs = [], leagues = [], players = [] }) {
  const response = await fetchWithTimeout(`${API_URL}/api/images/resolve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clubs, leagues, players }),
  });

  return handleResponse(response);
}

export async function searchPlayers(query, limit = 8) {
  const params = new URLSearchParams({ q: query, limit });
  const response = await fetchWithTimeout(
    `${API_URL}/api/players/search?${params.toString()}`
  );

  return handleResponse(response);
}

export async function getSimilarPlayers(playerName, topK) {
  const response = await fetchWithTimeout(`${API_URL}/api/players/similar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      player_name: playerName,
      top_k: topK,
    }),
  });

  return handleResponse(response);
}
