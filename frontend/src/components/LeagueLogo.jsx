import { useState } from "react";
import { LeagueIcon } from "./icons/PlaceholderIcons";

function LeagueLogo({ url, name, size = 26, className = "" }) {
  const [errored, setErrored] = useState(false);
  const [lastUrl, setLastUrl] = useState(url);

  if (url !== lastUrl) {
    setLastUrl(url);
    setErrored(false);
  }

  if (!url || errored) {
    return <LeagueIcon />;
  }

  return (
    <img
      src={url}
      alt={name ? `${name} logo` : "League logo"}
      title={name || "League"}
      className={`league-logo-img ${className}`}
      style={{ width: size, height: size }}
      loading="lazy"
      onError={() => setErrored(true)}
    />
  );
}

export default LeagueLogo;
