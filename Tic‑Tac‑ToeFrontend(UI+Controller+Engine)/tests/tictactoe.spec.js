import { expect } from 'chai';
import { TicTacToe } from '../src/engine/tictactoe.js';

describe('TicTacToe engine (deterministic, engine-only)', function () {
    it('starts with an empty board and the configured starting player to move', function () {
        const game = new TicTacToe('X');

        expect(game.getCurrentPlayer()).to.equal('X');
        expect(game.isFinished()).to.equal(false);
        expect(game.getWinner()).to.equal(null);
        expect(game.isDraw()).to.equal(false);

        const board = game.getBoard();
        expect(board).to.have.length(3);
        expect(board[0]).to.deep.equal([null, null, null]);
        expect(board[1]).to.deep.equal([null, null, null]);
        expect(board[2]).to.deep.equal([null, null, null]);
    });

    it('getBoard returns a deep copy (mutations to returned board do not affect engine state)', function () {
        const game = new TicTacToe('X');

        const snapshot1 = game.getBoard();
        snapshot1[0][0] = 'X';

        // Engine must remain unchanged.
        expect(game.getBoard()[0][0]).to.equal(null);

        // Also ensure row arrays are copied (not the same references).
        const snapshot2 = game.getBoard();
        expect(snapshot2).to.not.equal(snapshot1);
        expect(snapshot2[0]).to.not.equal(snapshot1[0]);
    });

    it('accepts valid moves, marks the board, and alternates players', function () {
        const game = new TicTacToe('X');

        const r1 = game.makeMove(0, 0);
        expect(r1.ok).to.equal(true);
        expect(r1.move).to.deep.equal({ row: 0, col: 0, player: 'X' });
        expect(game.getBoard()[0][0]).to.equal('X');
        expect(game.getCurrentPlayer()).to.equal('O');
        expect(r1.isFinished).to.equal(false);

        const r2 = game.makeMove(0, 1);
        expect(r2.ok).to.equal(true);
        expect(r2.move).to.deep.equal({ row: 0, col: 1, player: 'O' });
        expect(game.getBoard()[0][1]).to.equal('O');
        expect(game.getCurrentPlayer()).to.equal('X');
        expect(r2.isFinished).to.equal(false);
    });

    it('rejects out-of-bounds moves without mutating state (board or current player)', function () {
        const game = new TicTacToe('X');
        const beforeBoard = game.getBoard();
        const beforePlayer = game.getCurrentPlayer();

        const r = game.makeMove(-1, 0);
        expect(r.ok).to.equal(false);
        expect(r.reason).to.equal('Move out of bounds.');
        expect(game.getBoard()).to.deep.equal(beforeBoard);
        expect(game.getCurrentPlayer()).to.equal(beforePlayer);
        expect(game.isFinished()).to.equal(false);
    });

    it('rejects non-integer moves without mutating state', function () {
        const game = new TicTacToe('X');
        const beforeBoard = game.getBoard();
        const beforePlayer = game.getCurrentPlayer();

        const r = game.makeMove(0.2, 1);
        expect(r.ok).to.equal(false);
        expect(r.reason).to.equal('Move out of bounds.');
        expect(game.getBoard()).to.deep.equal(beforeBoard);
        expect(game.getCurrentPlayer()).to.equal(beforePlayer);
    });

    it('rejects moves to occupied cells without mutating state (board or current player)', function () {
        const game = new TicTacToe('X');

        const first = game.makeMove(1, 1);
        expect(first.ok).to.equal(true);
        expect(game.getCurrentPlayer()).to.equal('O');

        const beforeBoard = game.getBoard();
        const beforePlayer = game.getCurrentPlayer();

        const r = game.makeMove(1, 1);
        expect(r.ok).to.equal(false);
        expect(r.reason).to.equal('Cell is already occupied.');
        expect(game.getBoard()).to.deep.equal(beforeBoard);
        expect(game.getCurrentPlayer()).to.equal(beforePlayer);
        expect(game.isFinished()).to.equal(false);
    });

    it('detects a row win and finishes the game (no further player alternation after win)', function () {
        const game = new TicTacToe('X');

        // X: (0,0), O: (1,0), X: (0,1), O: (1,1), X: (0,2) => X wins
        game.makeMove(0, 0);
        game.makeMove(1, 0);
        game.makeMove(0, 1);
        game.makeMove(1, 1);
        const r = game.makeMove(0, 2);

        expect(r.ok).to.equal(true);
        expect(r.isFinished).to.equal(true);
        expect(r.winner).to.equal('X');
        expect(r.isDraw).to.equal(false);

        expect(game.isFinished()).to.equal(true);
        expect(game.getWinner()).to.equal('X');
        expect(game.isDraw()).to.equal(false);

        // Current player should remain whatever the engine reports after finishing;
        // the contract is "no further alternation", so it must NOT flip to 'O' here.
        expect(game.getCurrentPlayer()).to.equal('X');
    });

    it('detects a column win', function () {
        const game = new TicTacToe('X');

        // X: (0,0), O: (0,1), X: (1,0), O: (1,1), X: (2,0) => X wins col 0
        game.makeMove(0, 0);
        game.makeMove(0, 1);
        game.makeMove(1, 0);
        game.makeMove(1, 1);
        const r = game.makeMove(2, 0);

        expect(r.ok).to.equal(true);
        expect(game.isFinished()).to.equal(true);
        expect(game.getWinner()).to.equal('X');
    });

    it('detects a main diagonal win', function () {
        const game = new TicTacToe('X');

        // X: (0,0), O: (0,1), X: (1,1), O: (0,2), X: (2,2) => X wins diag
        game.makeMove(0, 0);
        game.makeMove(0, 1);
        game.makeMove(1, 1);
        game.makeMove(0, 2);
        const r = game.makeMove(2, 2);

        expect(r.ok).to.equal(true);
        expect(game.isFinished()).to.equal(true);
        expect(game.getWinner()).to.equal('X');
    });

    it('detects an anti-diagonal win', function () {
        const game = new TicTacToe('X');

        // X: (0,2), O: (0,1), X: (1,1), O: (1,0), X: (2,0) => X wins anti-diag
        game.makeMove(0, 2);
        game.makeMove(0, 1);
        game.makeMove(1, 1);
        game.makeMove(1, 0);
        const r = game.makeMove(2, 0);

        expect(r.ok).to.equal(true);
        expect(game.isFinished()).to.equal(true);
        expect(game.getWinner()).to.equal('X');
    });

    it('detects draw when board is full and no winner', function () {
        const game = new TicTacToe('X');

        // Deterministic draw sequence (no 3-in-a-row):
        // X O X
        // X X O
        // O X O
        game.makeMove(0, 0); // X
        game.makeMove(0, 1); // O
        game.makeMove(0, 2); // X
        game.makeMove(1, 2); // O
        game.makeMove(1, 1); // X
        game.makeMove(2, 0); // O
        game.makeMove(1, 0); // X
        game.makeMove(2, 2); // O
        const r = game.makeMove(2, 1); // X (fills board)

        expect(r.ok).to.equal(true);
        expect(r.isFinished).to.equal(true);
        expect(r.winner).to.equal(null);
        expect(r.isDraw).to.equal(true);

        expect(game.isFinished()).to.equal(true);
        expect(game.getWinner()).to.equal(null);
        expect(game.isDraw()).to.equal(true);
    });

    it('rejects moves after finished state without mutating board or currentPlayer', function () {
        const game = new TicTacToe('X');

        // Force a win for X.
        game.makeMove(0, 0);
        game.makeMove(1, 0);
        game.makeMove(0, 1);
        game.makeMove(1, 1);
        game.makeMove(0, 2); // X wins

        const beforeBoard = game.getBoard();
        const beforePlayer = game.getCurrentPlayer();

        const r = game.makeMove(2, 2);
        expect(r.ok).to.equal(false);
        expect(r.reason).to.equal('Game is finished.');
        expect(r.isFinished).to.equal(true);
        expect(r.winner).to.equal('X');

        expect(game.getBoard()).to.deep.equal(beforeBoard);
        expect(game.getCurrentPlayer()).to.equal(beforePlayer);
    });

    it('reset clears board/finished/winner/draw and sets current player to provided startingPlayer', function () {
        const game = new TicTacToe('X');

        // Finish a game.
        game.makeMove(0, 0);
        game.makeMove(1, 0);
        game.makeMove(0, 1);
        game.makeMove(1, 1);
        game.makeMove(0, 2); // X wins

        expect(game.isFinished()).to.equal(true);
        expect(game.getWinner()).to.equal('X');

        game.reset('O');

        expect(game.isFinished()).to.equal(false);
        expect(game.getWinner()).to.equal(null);
        expect(game.isDraw()).to.equal(false);
        expect(game.getCurrentPlayer()).to.equal('O');
        expect(game.getBoard()).to.deep.equal([
            [null, null, null],
            [null, null, null],
            [null, null, null],
        ]);
    });

    it('reset() without args uses the latest configured starting player (after a reset with explicit player)', function () {
        const game = new TicTacToe('X');

        game.reset('O');
        expect(game.getCurrentPlayer()).to.equal('O');

        // Make at least one move to ensure we are not already at the starting state.
        game.makeMove(0, 0);
        expect(game.getCurrentPlayer()).to.equal('X');

        // Now reset with no args => should start with 'O' again.
        game.reset();
        expect(game.getCurrentPlayer()).to.equal('O');
        expect(game.getBoard()).to.deep.equal([
            [null, null, null],
            [null, null, null],
            [null, null, null],
        ]);
    });
});
