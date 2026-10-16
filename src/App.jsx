
import { useEffect, useState } from "react";
import "./index.css";

const RESULTS = {
  F: {
    title: "Friends",
    emoji: "🤝",
    description: "A fun friendship connection! Keep supporting and enjoying each other's company."
  },
  L: {
    title: "Love",
    emoji: "💖",
    description: "The classic FLAMES love result! Remember, real connections grow through care and respect."
  },
  A: {
    title: "Affection",
    emoji: "🥰",
    description: "A warm connection filled with kindness, appreciation and affection."
  },
  M: {
    title: "Marriage",
    emoji: "💍",
    description: "The playful FLAMES result for marriage. It's a game, not a prediction of the future!"
  },
  E: {
    title: "Enemies",
    emoji: "⚡",
    description: "A dramatic game result! It doesn't mean you have to be enemies in real life."
  },
  S: {
    title: "Siblings",
    emoji: "🫂",
    description: "A sibling-like connection full of jokes, comfort and playful moments."
  }
};


function calculateFlames(first, second) {
  const a = first.toLowerCase().replace(/[^a-z]/g, "").split("");
  const b = second.toLowerCase().replace(/[^a-z]/g, "").split("");

  if (!a.length || !b.length) return null;

  // Cancel matching letters one at a time.
  for (let i = 0; i < a.length; i++) {
    if (!a[i]) continue;

    const match = b.indexOf(a[i]);

    if (match !== -1) {
      a[i] = "";
      b[match] = "";
    }
  }

  const count =
    a.filter(Boolean).length +
    b.filter(Boolean).length;

  // If no letters remain, use a defined fallback.
  if (count === 0) {
    return {
      key: "F",
      ...RESULTS.F,
      rounds: []
    };
  }

  // Standard FLAMES circular elimination.
  let letters = ["F", "L", "A", "M", "E", "S"];
  const rounds = [];
  let index = 0;

  while (letters.length > 1) {
    index = (index + count - 1) % letters.length;

    const removed = letters[index];
    letters.splice(index, 1);

    rounds.push({
      removed,
      remaining: [...letters]
    });
  }

  const key = letters[0];

  return {
    key,
    ...RESULTS[key],
    rounds
  };
}


function readHistory() {
  try {
    const saved = localStorage.getItem("flames-history");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [yourName, setYourName] = useState("");
  const [theirName, setTheirName] = useState("");
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("flames-theme") || "dark";
    } catch {
      return "dark";
    }
  });
  const [history, setHistory] = useState(readHistory);
  const [page, setPage] = useState("play");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [animationText, setAnimationText] = useState("");
  const [roundIndex, setRoundIndex] = useState(0);

  useEffect(() => {
    try {
      localStorage.setItem("flames-history", JSON.stringify(history));
    } catch {
      // The app still works if browser storage is unavailable.
    }
  }, [history]);

  useEffect(() => {
    try {
      localStorage.setItem("flames-theme", theme);
    } catch {
      // Theme remains usable for this session.
    }
  }, [theme]);

  function toggleTheme() {
    setTheme(current => current === "dark" ? "light" : "dark");
  }

  function playFlames(event) {
    event.preventDefault();
    if (busy) return;

    const first = yourName.trim();
    const second = theirName.trim();

    if (!first || !second) {
      setError("Please enter both names first.");
      return;
    }

    if (!/[a-z]/i.test(first) || !/[a-z]/i.test(second)) {
      setError("Please use names containing English letters.");
      return;
    }

    const calculated = calculateFlames(first, second);

    if (!calculated) {
      setError("Please enter valid names.");
      return;
    }

    setError("");
    setResult(null);
    setBusy(true);
    setRoundIndex(0);

    const rounds = calculated.rounds || [];

    function showRound(index) {
      if (index < rounds.length) {
        setAnimationText(
          `Eliminating ${rounds[index].removed}...`
        );
        setRoundIndex(index + 1);
        window.setTimeout(() => showRound(index + 1), 650);
      } else {
        setAnimationText("Your result is ready!");
        setResult(calculated);

        const entry = {
          id: `${Date.now()}-${Math.random()}`,
          first,
          second,
          key: calculated.key,
          title: calculated.title,
          emoji: calculated.emoji,
          createdAt: new Date().toISOString()
        };

        setHistory(previous => [entry, ...previous].slice(0, 50));
        setBusy(false);
      }
    }

    setAnimationText("Finding your connection...");
    window.setTimeout(() => showRound(0), 500);
  }

  function deleteEntry(id) {
    setHistory(previous => previous.filter(item => item.id !== id));
  }

  function clearHistory() {
    if (window.confirm("Clear all your FLAMES history?")) {
      setHistory([]);
    }
  }

  function replayEntry(entry) {
    setYourName(entry.first);
    setTheirName(entry.second);
    setResult(null);
    setPage("play");
  }

  return (
    <main className={`app-shell theme-${theme}`}>
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <nav className="topbar">
        <button
          className="brand"
          onClick={() => setPage("play")}
          aria-label="Go to FLAMES home"
        >
          <span className="brand-mark">✳</span>
          FLAMES<span className="brand-dot">.</span>
        </button>

        <div className="nav-actions">
          <button
            className={`nav-button ${page === "play" ? "active" : ""}`}
            onClick={() => setPage("play")}
          >
            ✨ Play
          </button>

          <button
            className={`nav-button ${page === "history" ? "active" : ""}`}
            onClick={() => setPage("history")}
          >
            📜 History ({history.length})
          </button>

          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>
      </nav>

      {page === "play" ? (
        <section className="hero">
          <div className="eyebrow">
            <span className="live-dot" />
            THE CONNECTION GAME
          </div>

          <h1>
            Two names.
            <br />
            <span className="gradient-text">One little mystery.</span>
          </h1>

          <p className="subtitle">
            Enter two names and let the classic FLAMES game
            reveal your playful connection.
          </p>

          <form className="form-card" onSubmit={playFlames}>
            <label htmlFor="your-name">YOUR NAME</label>
            <input
              id="your-name"
              value={yourName}
              onChange={event => setYourName(event.target.value)}
              placeholder="Enter your name"
              maxLength={40}
              disabled={busy}
            />

            <div className="heart-divider">✦ ♥ ✦</div>

            <label htmlFor="their-name">THEIR NAME</label>
            <input
              id="their-name"
              value={theirName}
              onChange={event => setTheirName(event.target.value)}
              placeholder="Enter another name"
              maxLength={40}
              disabled={busy}
            />

            {error && <p className="error-message">{error}</p>}

            <button className="primary-button" type="submit" disabled={busy}>
              {busy ? "Calculating..." : "Reveal Our FLAMES ✨"}
            </button>

            <p className="privacy-note">
              🔒 Your names stay in this browser's local history.
            </p>
          </form>

          {(busy || result) && (
            <div className="result-card">
              <div className="result-stars">✦　✧　✦</div>

              {busy ? (
                <>
                  <div className="loading-heart">💗</div>
                  <h2>{animationText}</h2>
                  <p>FLAMES letters are being counted...</p>
                  <div className="flames-letters">
                    {["F", "L", "A", "M", "E", "S"].map(letter => (
                      <span key={letter}>{letter}</span>
                    ))}
                  </div>
                  <p className="round-note">
                    Round {roundIndex}
                  </p>
                </>
              ) : (
                <>
                  <div className="result-emoji">{result.emoji}</div>
                  <p className="result-label">YOUR FLAMES RESULT</p>
                  <h2 className="gradient-text">{result.title}</h2>
                  <p>{result.description}</p>
                  <p className="playful-note">
                    Just for fun — real relationships are shaped by people,
                    not a name game.
                  </p>
                  <button
                    className="secondary-button"
                    onClick={() => {
                      setResult(null);
                      setError("");
                    }}
                  >
                    Try another pair ↻
                  </button>
                </>
              )}
            </div>
          )}

          <div className="flames-guide">
            {[
              ["F", "Friends", "🤝"],
              ["L", "Love", "💖"],
              ["A", "Affection", "🥰"],
              ["M", "Marriage", "💍"],
              ["E", "Enemies", "⚡"],
              ["S", "Siblings", "🫂"]
            ].map(([letter, label, emoji]) => (
              <div className="guide-item" key={letter}>
                <span className="guide-letter">{letter}</span>
                <span>{emoji} {label}</span>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="history-section">
          <div className="eyebrow">
            <span className="live-dot" />
            YOUR SAVED RESULTS
          </div>

          <h1>
            Your <span className="gradient-text">history.</span>
          </h1>

          <p className="subtitle">
            Your latest 50 calculations are saved in this browser.
          </p>

          {history.length > 0 ? (
            <>
              <button className="clear-button" onClick={clearHistory}>
                🗑️ Clear all history
              </button>

              <div className="history-list">
                {history.map(entry => (
                  <article className="history-card" key={entry.id}>
                    <div className="history-emoji">{entry.emoji}</div>
                    <div className="history-info">
                      <h3>{entry.first} <span>♥</span> {entry.second}</h3>
                      <p>{entry.title}</p>
                      <time>
                        {new Date(entry.createdAt).toLocaleString()}
                      </time>
                    </div>
                    <div className="history-actions">
                      <button
                        className="small-button"
                        onClick={() => replayEntry(entry)}
                      >
                        Replay
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => deleteEntry(entry.id)}
                        aria-label="Delete this result"
                      >
                        ✕
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-history">
              <div className="empty-icon">🌌</div>
              <h2>Your story starts here</h2>
              <p>Your FLAMES results will appear here after your first game.</p>
              <button
                className="primary-button"
                onClick={() => setPage("play")}
              >
                Play FLAMES ✨
              </button>
            </div>
          )}
        </section>
      )}

      <footer className="footer">
        <p>MADE WITH ♥ AND A LITTLE MAGIC</p>
        <span>FLAMES is a playful name game, not a real prediction.</span>
      </footer>
    </main>
  );
}
