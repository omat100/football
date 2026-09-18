import { useEffect, useRef, useState } from "react";
import { searchPlayers } from "../services/api";

function PlayerAutocomplete({
  id,
  value,
  onChange,
  onSelect,
  placeholder,
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);

  useEffect(() => {
    const query = value.trim();
    let cancelled = false;

    const timeoutId = setTimeout(async () => {
      if (query.length < 2) {
        if (!cancelled) {
          setSuggestions([]);
        }
        return;
      }

      try {
        const results = await searchPlayers(query);
        if (!cancelled) {
          setSuggestions(results);
          setHighlightedIndex(-1);
        }
      } catch {
        if (!cancelled) {
          setSuggestions([]);
        }
      }
    }, 200);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(player) {
    onSelect(player);
    setIsOpen(false);
    setSuggestions([]);
  }

  function handleKeyDown(event) {
    if (!isOpen || suggestions.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((previous) =>
        Math.min(previous + 1, suggestions.length - 1)
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((previous) => Math.max(previous - 1, 0));
    } else if (event.key === "Enter" && highlightedIndex >= 0) {
      event.preventDefault();
      handleSelect(suggestions[highlightedIndex]);
    } else if (event.key === "Escape") {
      setIsOpen(false);
    }
  }

  return (
    <div className="autocomplete" ref={containerRef}>
      <input
        id={id}
        type="text"
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
      />

      {isOpen && suggestions.length > 0 && (
        <ul className="autocomplete-list">
          {suggestions.map((player, index) => (
            <li
              key={player.player_id}
              className={
                index === highlightedIndex
                  ? "autocomplete-item autocomplete-item-active"
                  : "autocomplete-item"
              }
              onMouseDown={() => handleSelect(player)}
            >
              <span className="autocomplete-name">
                {player.short_name}
              </span>
              <span className="autocomplete-meta">
                {player.club_name || "N/A"}
                {player.overall != null ? ` · ${player.overall} OVR` : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default PlayerAutocomplete;
