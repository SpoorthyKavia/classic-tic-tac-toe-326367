import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

function getSquare(index) {
  return screen.getByTestId(`square-${index}`);
}

function expectEmptyBoard() {
  for (let i = 0; i < 9; i += 1) {
    // Squares render value inside an aria-hidden span, so asserting on textContent is fine.
    expect(getSquare(i)).toHaveTextContent("");
  }
}

describe("Tic-Tac-Toe UI", () => {
  test("renders initial UI and shows Next player: X", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: /tic-tac-toe/i })).toBeInTheDocument();
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
    await user.click(getSquare(0));
    await user.click(getSquare(3));
    await user.click(getSquare(1));
    await user.click(getSquare(4));
    await user.click(getSquare(2));

    expect(screen.getByRole("status")).toHaveTextContent("Winner: X");
    expect(screen.getByLabelText("Score X")).toHaveTextContent("1");

    // Winning squares should have the win highlight class.
    expect(getSquare(0)).toHaveClass("cellWin");
    expect(getSquare(1)).toHaveClass("cellWin");
    expect(getSquare(2)).toHaveClass("cellWin");

    // Non-winning squares should not be highlighted.
    expect(getSquare(3)).not.toHaveClass("cellWin");
  });

  test("restart clears the board but keeps the score; reset score clears both", async () => {
    const user = userEvent.setup();
    render(<App />);

    // Create a quick win for X to increment score.
    await user.click(getSquare(0));
    await user.click(getSquare(3));
    await user.click(getSquare(1));
    await user.click(getSquare(4));
    await user.click(getSquare(2));
    expect(screen.getByRole("status")).toHaveTextContent("Winner: X");
    expect(screen.getByLabelText("Score X")).toHaveTextContent("1");

    // Restart should clear board and reset turn to X, but keep score.
    await user.click(screen.getByRole("button", { name: /restart round/i }));
    expectEmptyBoard();
    expect(screen.getByRole("status")).toHaveTextContent("Next player: X");
    expect(screen.getByLabelText("Score X")).toHaveTextContent("1");

    // Reset score should clear board AND score.
    await user.click(screen.getByRole("button", { name: /reset score and restart/i }));
    expectEmptyBoard();
    expect(screen.getByRole("status")).toHaveTextContent("Next player: X");
    expect(screen.getByLabelText("Score X")).toHaveTextContent("0");
    expect(screen.getByLabelText("Score O")).toHaveTextContent("0");
    expect(screen.getByLabelText("Score draws")).toHaveTextContent("0");
  });
});
