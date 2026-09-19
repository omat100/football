import { useState } from "react";

function initials(name) {
  if (!name) {
    return "?";
  }

  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase() || "?";
}

function PlayerAvatar({ url, name, size = 44, className = "" }) {
  const [errored, setErrored] = useState(false);
  const [lastUrl, setLastUrl] = useState(url);

  if (url !== lastUrl) {
    setLastUrl(url);
    setErrored(false);
  }

  if (!url || errored) {
    return (
      <div
        className={`avatar-fallback ${className}`}
        style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
        title={name || "Player"}
        aria-label={name || "Player"}
      >
        {initials(name)}
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={name || "Player"}
      title={name || "Player"}
      className={`player-avatar-img ${className}`}
      style={{ width: size, height: size }}
      loading="lazy"
      onError={() => setErrored(true)}
    />
  );
}

export default PlayerAvatar;
