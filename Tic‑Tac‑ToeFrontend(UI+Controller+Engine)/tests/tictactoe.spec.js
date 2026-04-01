import { expect } from 'chai';
import { TicTacToe } from '../src/engine/tictactoe.js';

describe('TicTacToe engine', function() {
    it('starts with empty board and X to move', function() {
        const game = new TicTacToe('X');
        expect(game.getCurrentPlayer()).to.equal('X');
        expect(game.isFinished()).to.equal(false);
        expect(game.getWinner()).to.equal(null);

        const board = game.getBoard();
        expect(board).to.have.length(3);
        expect(board[0]).to.deep.equal([null, null, null]);
        expect(board[1]).to.deep.equal([null, null, null]);
        expect(board[2]).to.deep.equal([null, null, null]);
    });

    it('accepts valid moves and alternates players', function() {
        const game = new TicTacToe('X');

        const r1 = game.makeMove(0, 0);
        expect(r1.ok).to.equal(true);
        expect(r1.move.player).to.equal('X');
        expect(game.getBoard()[0][0]).to.equal('X');
        expect(game.getCurrentPlayer()).to.equal('O');

        const r2 = game.makeMove(0, 1);
        expect(r2.ok).to.equal(true);
        expect(r2.move.player).to.equal('O');
        expect(game.getBoard()[0][1]).to.equal('O');
        expect(game.getCurrentPlayer()).to.equal('X');
    });

    it('rejects out-of-bounds moves without mutating state', function() {
        const game = new TicTacToe('X');
        const before = game.getBoard();

        const r = game.makeMove(-1, 0);
        expect(r.ok).to.equal(false);
        expect(r.reason).to.equal('Move out of bounds.');
        expect(game.getBoard()).to.deep.equal(before);
        expect(game.getCurrentPlayer()).to.equal('X');
    });

    it('rejects moves to occupied cells without mutating current player', function() {
        const game = new TicTacToe('X');
        expect(game.makeMove(1, 1).ok).to.equal(true);
        expect(game.getCurrentPlayer()).to.equal('O');

        const before = game.getBoard();
        const r = game.makeMove(1, 1);
        expect(r.ok).to.equal(false);
        expect(r.reason).to.equal('Cell is already occupied.');
        expect(game.getBoard()).to.deep.equal(before);
        expect(game.getCurrentPlayer()).to.equal('O');
    });

    it('detects a row win and finishes the game', function() {
        const game = new TicTacToe('X');

        // X: (0,0), O: (1,0), X: (0,1), O: (1,1), X: (0,2) => X wins
        game.makeMove(0, 0);
        game.makeMove(1, 0);
        game.makeMove(0, 1);
        game.makeMove(1, 1);
        const r = game.makeMove(0, 2);

        expect(r.ok).to.equal(true);
        expect(game.isFinished()).to.equal(true);
        expect(game.getWinner()).to.equal('X');
        expect(game.isDraw()).to.equal(false);
    });

    it('detects a diagonal win', function() {
        const game = new TicTacToe('X');

        // X: (0,0), O: (0,1), X: (1,1), O: (0,2), X: (2,2) => X wins diag
        game.makeMove(0, 0);
        game.makeMove(0, 1);
        game.makeMove(1, 1);
        game.makeMove(0, 2);
        game.makeMove(2, 2);

        expect(game.isFinished()).to.equal(true);
        expect(game.getWinner()).to.equal('X');
    });

    it('detects draw when board is full and no winner', function() {
        const game = new TicTacToe('X');

        // A known draw sequence:
        // X O X
        // X X O
        // O X O
        game.makeMove(0, 0); // X
        game.makeMove(0, 1); // O
        game.makeMove(0, 2); // X
        game.makeMove(1, 0); // O (note: will be O because turns alternate; adjust sequence)
        // Let's reset with a correct draw sequence using the engine's alternation:
        game.reset('X');

        game.makeMove(0, 0); // X
        game.makeMove(0, 1); // O
        game.makeMove(0, 2); // X
        game.makeMove(1, 1); // O
        game.makeMove(1, 0); // X
        game.makeMove(2, 0); // O
        game.makeMove(1, 2); // X
        game.makeMove(2, 2); // O
        game.makeMove(2, 1); // X

        expect(game.isFinished()).to.equal(true);
        expect(game.getWinner()).to.equal(null);
        expect(game.isDraw()).to.equal(true);
    });

    it('rejects moves after finished state', function() {
        const game = new TicTacToe('X');
        game.makeMove(0, 0);
        game.makeMove(1, 0);
        game.makeMove(0, 1);
        game.makeMove(1, 1);
        game.makeMove(0, 2); // X wins

        const before = game.getBoard();
        const r = game.makeMove(2, 2);
        expect(r.ok).to.equal(false);
        expect(r.reason).to.equal('Game is finished.');
        expect(game.getBoard()).to.deep.equal(before);
    });

    it('reset clears finished state and board', function() {
        const game = new TicTacToe('X');
        game.makeMove(0, 0);
        game.makeMove(1, 0);
        game.makeMove(0, 1);
        game.makeMove(1, 1);
        game.makeMove(0, 2); // X wins

        expect(game.isFinished()).to.equal(true);
        game.reset('O');
        expect(game.isFinished()).to.equal(false);
        expect(game.getWinner()).to.equal(null);
        expect(game.getCurrentPlayer()).to.equal('O');
        expect(game.getBoard()[0]).to.deep.equal([null, null, null]);
    });
});
