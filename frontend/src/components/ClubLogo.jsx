import { useState } from "react";
import { ClubIcon } from "./icons/PlaceholderIcons";

function ClubLogo({ url, name, size = 26, className = "" }) {
  const [errored, setErrored] = useState(false);
  const [lastUrl, setLastUrl] = useState(url);

  if (url !== lastUrl) {
    setLastUrl(url);
    setErrored(false);
  }

  if (!url || errored) {
    return <ClubIcon />;
  }

  return (
    <img
      src={url}
      alt={name ? `${name} logo` : "Club logo"}
      title={name || "Club"}
      className={`club-logo-img ${className}`}
      style={{ width: size, height: size }}
      loading="lazy"
      onError={() => setErrored(true)}
    />
  );
}

export default ClubLogo;
