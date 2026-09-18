import { useState } from "react";
import { scoutSearch } from "../services/api";
import SimilarPlayers from "../components/SimilarPlayers";

function ScoutSearchPage() {
  const [position, setPosition] = useState("CB");
  const [topK, setTopK] = useState(10);

  const [stats, setStats] = useState({
    pace: 85,
    shooting: 80,
    passing: 85,
    dribbling: 80,
    defending: 70,
    physic: 80,
  });

  const [optionalStats, setOptionalStats] = useState({
    overall: "",
    age: "",
    height_cm: "",
  });

  const [showOptional, setShowOptional] = useState(false);

  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const positions = [
    "CAM",
    "CB",
    "CDM",
    "CF",
    "CM",
    "LB",
    "LM",
    "LW",
    "LWB",
    "RB",
    "RM",
    "RW",
    "RWB",
    "ST",
  ];

  function handleStatChange(event) {
    const { name, value } = event.target;

    setStats((previousStats) => ({
      ...previousStats,
      [name]: Number(value),
    }));
  }

  function handleOptionalChange(event) {
    const { name, value } = event.target;

    setOptionalStats((previousStats) => ({
      ...previousStats,
      [name]: value,
    }));
  }

  async function handleSearch() {
    setLoading(true);
    setError("");
    setPlayers([]);

    try {
      const desired = {
        pace: stats.pace,
        shooting: stats.shooting,
        passing: stats.passing,
        dribbling: stats.dribbling,
        defending: stats.defending,
        physic: stats.physic,
      };

      /*
        Optional attributes are only added
        when the user has entered a value.
      */

      if (optionalStats.overall !== "") {
        desired.overall = Number(optionalStats.overall);
      }

      if (optionalStats.age !== "") {
        desired.age = Number(optionalStats.age);
      }

      if (optionalStats.height_cm !== "") {
        desired.height_cm = Number(optionalStats.height_cm);
      }

      const result = await scoutSearch(desired, position, topK);

      setPlayers(result);
    } catch (error) {
      console.error(
        "Error fetching similar players:",
        error
      );

      setError(
        error.message ||
          "Unable to get similar players."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <header className="header">
        <h1>Football Player Analytics</h1>

        <p>
          Find players matching your desired profile
        </p>
      </header>

      <main>

        {/* =========================
            SEARCH SECTION
            ========================= */}

        <section className="search-section">

          <h2>Find Similar Players</h2>


          {/* POSITION + TOP K */}

          <div className="search-controls">

            <div className="control-group position-control">

              <label htmlFor="position">
                Position
              </label>

              <select
                id="position"
                value={position}
                onChange={(event) =>
                  setPosition(event.target.value)
                }
              >
                {positions.map((positionOption) => (
                  <option
                    key={positionOption}
                    value={positionOption}
                  >
                    {positionOption}
                  </option>
                ))}
              </select>

            </div>


            <div className="control-group top-k-control">

              <label htmlFor="topK">
                Results
              </label>

              <select
                id="topK"
                value={topK}
                onChange={(event) =>
                  setTopK(Number(event.target.value))
                }
              >
                <option value={5}>Top 5</option>
                <option value={10}>Top 10</option>
                <option value={15}>Top 15</option>
                <option value={20}>Top 20</option>
              </select>

            </div>

          </div>


          {/* =========================
              CORE STATS
              ========================= */}

          <div className="profile-section">

            <div className="profile-heading">
              <h3>Desired Player Profile</h3>

              <span>
                Set the attributes you want
              </span>
            </div>


            <div className="stat-sliders">

              {/* PACE */}

              <div className="stat-slider">

                <div className="stat-header">

                  <label htmlFor="pace">
                    Pace
                  </label>

                  <span>
                    {stats.pace}
                  </span>

                </div>

                <input
                  id="pace"
                  name="pace"
                  type="range"
                  min="0"
                  max="100"
                  value={stats.pace}
                  onChange={handleStatChange}
                />

              </div>


              {/* SHOOTING */}

              <div className="stat-slider">

                <div className="stat-header">

                  <label htmlFor="shooting">
                    Shooting
                  </label>

                  <span>
                    {stats.shooting}
                  </span>

                </div>

                <input
                  id="shooting"
                  name="shooting"
                  type="range"
                  min="0"
                  max="100"
                  value={stats.shooting}
                  onChange={handleStatChange}
                />

              </div>


              {/* PASSING */}

              <div className="stat-slider">

                <div className="stat-header">

                  <label htmlFor="passing">
                    Passing
                  </label>

                  <span>
                    {stats.passing}
                  </span>

                </div>

                <input
                  id="passing"
                  name="passing"
                  type="range"
                  min="0"
                  max="100"
                  value={stats.passing}
                  onChange={handleStatChange}
                />

              </div>


              {/* DRIBBLING */}

              <div className="stat-slider">

                <div className="stat-header">

                  <label htmlFor="dribbling">
                    Dribbling
                  </label>

                  <span>
                    {stats.dribbling}
                  </span>

                </div>

                <input
                  id="dribbling"
                  name="dribbling"
                  type="range"
                  min="0"
                  max="100"
                  value={stats.dribbling}
                  onChange={handleStatChange}
                />

              </div>


              {/* DEFENDING */}

              <div className="stat-slider">

                <div className="stat-header">

                  <label htmlFor="defending">
                    Defending
                  </label>

                  <span>
                    {stats.defending}
                  </span>

                </div>

                <input
                  id="defending"
                  name="defending"
                  type="range"
                  min="0"
                  max="100"
                  value={stats.defending}
                  onChange={handleStatChange}
                />

              </div>


              {/* PHYSIC */}

              <div className="stat-slider">

                <div className="stat-header">

                  <label htmlFor="physic">
                    Physic
                  </label>

                  <span>
                    {stats.physic}
                  </span>

                </div>

                <input
                  id="physic"
                  name="physic"
                  type="range"
                  min="0"
                  max="100"
                  value={stats.physic}
                  onChange={handleStatChange}
                />

              </div>

            </div>

          </div>


          {/* =========================
              OPTIONAL STATS
              ========================= */}

          <button
            type="button"
            className="optional-toggle"
            onClick={() =>
              setShowOptional(!showOptional)
            }
          >
            <span>
              {showOptional ? "−" : "+"}
            </span>

            Optional filters
          </button>


          {showOptional && (

            <div className="optional-section">

              <div className="optional-item">

                <label htmlFor="overall">
                  Overall
                </label>

                <input
                  id="overall"
                  name="overall"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Optional"
                  value={optionalStats.overall}
                  onChange={handleOptionalChange}
                />

              </div>


              <div className="optional-item">

                <label htmlFor="age">
                  Age
                </label>

                <input
                  id="age"
                  name="age"
                  type="number"
                  min="15"
                  max="50"
                  placeholder="Optional"
                  value={optionalStats.age}
                  onChange={handleOptionalChange}
                />

              </div>


              <div className="optional-item">

                <label htmlFor="height_cm">
                  Height (cm)
                </label>

                <input
                  id="height_cm"
                  name="height_cm"
                  type="number"
                  min="140"
                  max="220"
                  placeholder="Optional"
                  value={optionalStats.height_cm}
                  onChange={handleOptionalChange}
                />

              </div>

            </div>

          )}


          {/* =========================
              SEARCH BUTTON
              ========================= */}

          <div className="search-action">

            <button
              onClick={handleSearch}
              disabled={loading}
            >
              {loading
                ? "Searching..."
                : "Find Similar Players"}
            </button>

          </div>


          {/* ERROR */}

          {error && (
            <p className="error-message">
              {error}
            </p>
          )}

        </section>


        {/* =========================
            LOADING
            ========================= */}

        {loading && (
          <div className="loading">
            Searching for similar players...
          </div>
        )}


        {/* =========================
            RESULTS
            ========================= */}

        {!loading && players.length > 0 && (
          <SimilarPlayers
            players={players}
          />
        )}

      </main>
    </>
  );
}

export default ScoutSearchPage;
