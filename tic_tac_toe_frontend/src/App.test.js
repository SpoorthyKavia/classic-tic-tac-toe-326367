import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

function getSquare(index) {
  return screen.getByTestId(`square-${index}`);
}

function getAllSquares() {
  return Array.from({ length: 9 }, (_, i) => getSquare(i));
}

function expectEmptyBoard() {
  for (let i = 0; i < 9; i += 1) {
    // Squares render value inside an aria-hidden span, so asserting on textContent is fine.
    expect(getSquare(i)).toHaveTextContent("");
  }
}

/**
 * Plays a sequence of moves (square indices) by clicking the board.
 * This is intentionally "black box": it interacts only through the UI.
 */
async function playMoves(user, moves) {
  for (const idx of moves) {
    // eslint-disable-next-line no-await-in-loop
    await user.click(getSquare(idx));
  }
}

describe("Tic-Tac-Toe UI", () => {
  test("renders initial UI and shows Next player: X", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: /tic-tac-toe/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Next player: X");

    // Scoreboard starts at 0.
    expect(screen.getByLabelText("Score X")).toHaveTextContent("0");
    expect(screen.getByLabelText("Score O")).toHaveTextContent("0");
    expect(screen.getByLabelText("Score draws")).toHaveTextContent("0");

    expectEmptyBoard();
  });

  test("alternates turns X -> O and prevents playing in the same square twice", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(getSquare(0));
    expect(getSquare(0)).toHaveTextContent("X");
    expect(screen.getByRole("status")).toHaveTextContent("Next player: O");

    // Clicking the same (now-filled) square should not change it or advance turn.
    await user.click(getSquare(0));
    expect(getSquare(0)).toHaveTextContent("X");
    expect(screen.getByRole("status")).toHaveTextContent("Next player: O");

    await user.click(getSquare(1));
    expect(getSquare(1)).toHaveTextContent("O");
    expect(screen.getByRole("status")).toHaveTextContent("Next player: X");
  });

  test("detects a win, highlights the winning line, and updates score", async () => {
    const user = userEvent.setup();
    render(<App />);

    // X wins top row: indices 0,1,2
    // X:0, O:3, X:1, O:4, X:2
    await playMoves(user, [0, 3, 1, 4, 2]);

    expect(screen.getByRole("status")).toHaveTextContent("Winner: X");
    expect(screen.getByLabelText("Score X")).toHaveTextContent("1");

    // Winning squares should have the win highlight class.
    expect(getSquare(0)).toHaveClass("cellWin");
    expect(getSquare(1)).toHaveClass("cellWin");
    expect(getSquare(2)).toHaveClass("cellWin");

    // Non-winning squares should not be highlighted.
    expect(getSquare(3)).not.toHaveClass("cellWin");
    expect(getSquare(4)).not.toHaveClass("cellWin");
  });

  test("draw detection: announces draw, increments draw score, and prevents further moves", async () => {
    const user = userEvent.setup();
    render(<App />);

    // One deterministic draw line (no 3-in-a-row):
    // X:0 O:1 X:2 O:4 X:7 O:6 X:3 O:5 X:8
    await playMoves(user, [0, 1, 2, 4, 7, 6, 3, 5, 8]);

    expect(screen.getByRole("status")).toHaveTextContent("Draw!");
    expect(screen.getByLabelText("Score draws")).toHaveTextContent("1");
    expect(screen.getByLabelText("Score X")).toHaveTextContent("0");
    expect(screen.getByLabelText("Score O")).toHaveTextContent("0");

    // After game over, all squares are disabled.
    for (const square of getAllSquares()) {
      expect(square).toBeDisabled();
    }

    // Clicking should not change any existing mark.
    const before = getSquare(0).textContent;
    await user.click(getSquare(0));
    expect(getSquare(0).textContent).toBe(before);
  });

  test("winning-line highlight: diagonal win highlights only the 3 winning squares", async () => {
    const user = userEvent.setup();
    render(<App />);

    // X wins diagonal 0-4-8:
    // X:0 O:1 X:4 O:2 X:8
    await playMoves(user, [0, 1, 4, 2, 8]);

    expect(screen.getByRole("status")).toHaveTextContent("Winner: X");

    // Exactly squares 0,4,8 should have the highlight.
    expect(getSquare(0)).toHaveClass("cellWin");
    expect(getSquare(4)).toHaveClass("cellWin");
    expect(getSquare(8)).toHaveClass("cellWin");

    const nonWinning = [1, 2, 3, 5, 6, 7];
    for (const idx of nonWinning) {
      expect(getSquare(idx)).not.toHaveClass("cellWin");
    }
  });

  test("after a win, the board is locked (no more moves can be played)", async () => {
    const user = userEvent.setup();
    render(<App />);

    // X wins top row.
    await playMoves(user, [0, 3, 1, 4, 2]);
    expect(screen.getByRole("status")).toHaveTextContent("Winner: X");

    // All squares should be disabled after win.
    for (const square of getAllSquares()) {
      expect(square).toBeDisabled();
    }

    // Score should not change if user clicks around after win.
    expect(screen.getByLabelText("Score X")).toHaveTextContent("1");
    await user.click(getSquare(8));
    expect(screen.getByLabelText("Score X")).toHaveTextContent("1");
  });

  test("score behavior across rounds: restart keeps score; new win increments from previous", async () => {
    const user = userEvent.setup();
    render(<App />);

    // Round 1: X wins top row.
    await playMoves(user, [0, 3, 1, 4, 2]);
    expect(screen.getByRole("status")).toHaveTextContent("Winner: X");
    expect(screen.getByLabelText("Score X")).toHaveTextContent("1");

    // Restart clears board and resets turn, but keeps score.
    await user.click(screen.getByRole("button", { name: /restart round/i }));
    expectEmptyBoard();
    expect(screen.getByRole("status")).toHaveTextContent("Next player: X");
    expect(screen.getByLabelText("Score X")).toHaveTextContent("1");

    // Round 2: O wins top row by having X play 3,4, then O gets 0,1,2.
    await playMoves(user, [3, 0, 4, 1, 8, 2]);
    expect(screen.getByRole("status")).toHaveTextContent("Winner: O");
    expect(screen.getByLabelText("Score X")).toHaveTextContent("1");
    expect(screen.getByLabelText("Score O")).toHaveTextContent("1");
  });

  test("restart clears a drawn board but keeps draw score; reset score clears everything", async () => {
    const user = userEvent.setup();
    render(<App />);

    // Draw a round.
    await playMoves(user, [0, 1, 2, 4, 7, 6, 3, 5, 8]);
    expect(screen.getByRole("status")).toHaveTextContent("Draw!");
    expect(screen.getByLabelText("Score draws")).toHaveTextContent("1");

    // Restart: clears board + resets to X, but draw score remains.
    await user.click(screen.getByRole("button", { name: /restart round/i }));
    expectEmptyBoard();
    expect(screen.getByRole("status")).toHaveTextContent("Next player: X");
    expect(screen.getByLabelText("Score draws")).toHaveTextContent("1");

    // Reset score: clears board AND resets all scores.
    await user.click(
      screen.getByRole("button", { name: /reset score and restart/i }),
    );
    expectEmptyBoard();
    expect(screen.getByRole("status")).toHaveTextContent("Next player: X");
    expect(screen.getByLabelText("Score X")).toHaveTextContent("0");
    expect(screen.getByLabelText("Score O")).toHaveTextContent("0");
    expect(screen.getByLabelText("Score draws")).toHaveTextContent("0");
  });

  test("reset score always resets next player to X even if it was O's turn", async () => {
    const user = userEvent.setup();
    render(<App />);

    // Make one move so it becomes O's turn.
    await user.click(getSquare(0));
    expect(screen.getByRole("status")).toHaveTextContent("Next player: O");

    await user.click(
      screen.getByRole("button", { name: /reset score and restart/i }),
    );

    expectEmptyBoard();
    expect(screen.getByRole("status")).toHaveTextContent("Next player: X");
  });

  test("restart clears any previous winning highlight", async () => {
    const user = userEvent.setup();
    render(<App />);

    // X wins top row.
    await playMoves(user, [0, 3, 1, 4, 2]);
    expect(getSquare(0)).toHaveClass("cellWin");
    expect(getSquare(1)).toHaveClass("cellWin");
    expect(getSquare(2)).toHaveClass("cellWin");

    await user.click(screen.getByRole("button", { name: /restart round/i }));

    // No squares should be highlighted after restart.
    for (const square of getAllSquares()) {
      expect(square).not.toHaveClass("cellWin");
    }
  });

  test("restart clears the board but keeps the score; reset score clears both", async () => {
    const user = userEvent.setup();
    render(<App />);

    // Create a quick win for X to increment score.
    await playMoves(user, [0, 3, 1, 4, 2]);
    expect(screen.getByRole("status")).toHaveTextContent("Winner: X");
    expect(screen.getByLabelText("Score X")).toHaveTextContent("1");

    // Restart should clear board and reset turn to X, but keep score.
    await user.click(screen.getByRole("button", { name: /restart round/i }));
    expectEmptyBoard();
    expect(screen.getByRole("status")).toHaveTextContent("Next player: X");
    expect(screen.getByLabelText("Score X")).toHaveTextContent("1");

    // Reset score should clear board AND score.
    await user.click(
      screen.getByRole("button", { name: /reset score and restart/i }),
    );
    expectEmptyBoard();
    expect(screen.getByRole("status")).toHaveTextContent("Next player: X");
    expect(screen.getByLabelText("Score X")).toHaveTextContent("0");
    expect(screen.getByLabelText("Score O")).toHaveTextContent("0");
    expect(screen.getByLabelText("Score draws")).toHaveTextContent("0");
  });
});
