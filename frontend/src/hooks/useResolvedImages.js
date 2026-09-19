import { useEffect, useState } from "react";
import { resolveImages } from "../services/api";

const EMPTY = { clubs: {}, leagues: {}, players: {} };

export function useResolvedImages({ clubs = [], leagues = [], players = [] }) {
  const [images, setImages] = useState(EMPTY);

  const clubKey = clubs.join("|");
  const leagueKey = leagues.join("|");
  const playerKey = players.join("|");

  useEffect(() => {
    let cancelled = false;

    if (!clubs.length && !leagues.length && !players.length) {
      Promise.resolve().then(() => {
        if (!cancelled) {
          setImages(EMPTY);
        }
      });
      return () => {
        cancelled = true;
      };
    }

    resolveImages({ clubs, leagues, players })
      .then((data) => {
        if (!cancelled) {
          setImages(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setImages(EMPTY);
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clubKey, leagueKey, playerKey]);

  return images;
}
