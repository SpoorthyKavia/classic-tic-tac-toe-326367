import React, { useMemo, useState } from "react";
import "./App.css";

/**
 * Winning line indices for a 3x3 Tic-Tac-Toe board.
 * Index mapping:
 * 0 1 2
 * 3 4 5
 * 6 7 8
 */
const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function computeWinner(squares) {
  for (const [a, b, c] of WINNING_LINES) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: [a, b, c] };
    }
  }
  return { winner: null, line: [] };
}

function isBoardFull(squares) {
  return squares.every((s) => s !== null);
}

// PUBLIC_INTERFACE
function App() {
  /** Squares are either "X", "O", or null */
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [score, setScore] = useState({ X: 0, O: 0, draws: 0 });

  const { winner, line: winningLine } = useMemo(
    () => computeWinner(squares),
    [squares],
  );

  const isDraw = useMemo(
    () => !winner && isBoardFull(squares),
    [winner, squares],
  );

  const statusText = useMemo(() => {
    if (winner) return `Winner: ${winner}`;
    if (isDraw) return "Draw!";
    return `Next player: ${xIsNext ? "X" : "O"}`;
  }, [winner, isDraw, xIsNext]);

  // PUBLIC_INTERFACE
  const handleSquareClick = (index) => {
    // Ignore moves if game is over or square already filled
    if (winner || isDraw || squares[index]) return;

    const next = squares.slice();
    next[index] = xIsNext ? "X" : "O";
    setSquares(next);
    setXIsNext((v) => !v);

    // If that move ends the game, update score based on the resulting board.
    const result = computeWinner(next);
    if (result.winner) {
      setScore((prev) => ({
        ...prev,
        [result.winner]: prev[result.winner] + 1,
      }));
    } else if (isBoardFull(next)) {
      setScore((prev) => ({ ...prev, draws: prev.draws + 1 }));
    }
  };

  // PUBLIC_INTERFACE
  const restartRound = () => {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
  };

  // PUBLIC_INTERFACE
  const resetScoreAndRestart = () => {
    setScore({ X: 0, O: 0, draws: 0 });
    setSquares(Array(9).fill(null));
    setXIsNext(true);
  };

  return (
    <div className="App">
      <main className="appShell">
        <header className="header">
          <div>
            <h1 className="title">Tic-Tac-Toe</h1>
            <p className="subtitle">Local two-player • First to 3 in a row wins</p>
          </div>

          <div className="scoreCard" aria-label="Scoreboard">
            <div className="scoreItem">
              <span className="scoreLabel">X</span>
              <span className="scoreValue" aria-label="Score X">
                {score.X}
              </span>
            </div>
            <div className="scoreDivider" aria-hidden="true" />
            <div className="scoreItem">
              <span className="scoreLabel">O</span>
              <span className="scoreValue" aria-label="Score O">
                {score.O}
              </span>
            </div>
            <div className="scoreDivider" aria-hidden="true" />
            <div className="scoreItem">
              <span className="scoreLabel">Draws</span>
              <span className="scoreValue" aria-label="Score draws">
                {score.draws}
              </span>
            </div>
          </div>
        </header>

        <section className="gameCard" aria-label="Tic Tac Toe game">
          <div className="statusRow">
            <div className="statusPill" role="status" aria-live="polite">
              {statusText}
            </div>

            <div className="controls">
              <button
                type="button"
                className="btn btnPrimary"
                onClick={restartRound}
                aria-label="Restart round"
              >
                Restart
              </button>
              <button
                type="button"
                className="btn btnGhost"
                onClick={resetScoreAndRestart}
                aria-label="Reset score and restart"
              >
                Reset score
              </button>
            </div>
          </div>

          <div className="boardWrap">
            <div className="board" role="grid" aria-label="Tic Tac Toe board">
              {squares.map((value, idx) => {
                const isWin = winningLine.includes(idx);
                const isDisabled = Boolean(winner || isDraw || value);

                return (
                  <button
                    key={idx}
                    type="button"
                    className={[
                      "cell",
                      isWin ? "cellWin" : "",
                      value === "X" ? "cellX" : "",
                      value === "O" ? "cellO" : "",
                    ].join(" ")}
                    onClick={() => handleSquareClick(idx)}
                    disabled={isDisabled}
                    role="gridcell"
                    aria-label={`Square ${idx + 1}${value ? `: ${value}` : ""}`}
                    data-testid={`square-${idx}`}
                  >
                    <span className="cellValue" aria-hidden="true">
                      {value ?? ""}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <p className="hint">
            Tip: the winning line will highlight in accent color. Hit{" "}
            <strong>Restart</strong> to play another round.
          </p>
        </section>

        <footer className="footer">
          <span className="footerText">Built with React • Modern light theme</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
