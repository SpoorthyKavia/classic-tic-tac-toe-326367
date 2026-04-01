/**
 * @fileoverview Deterministic Tic-Tac-Toe engine (pure game logic; no DOM).
 */

/** @typedef {'X'|'O'} Player */

/**
 * @typedef {{
 *   ok: boolean,
 *   reason?: string,
 *   winner?: (Player|null),
 *   isDraw?: boolean,
 *   isFinished?: boolean,
 *   currentPlayer?: Player,
 *   move?: {row: number, col: number, player: Player},
 * }} MoveResult
 */

/**
 * Pure game engine for Tic-Tac-Toe.
 *
 * The engine is deterministic:
 * - Identical move sequences yield identical outcomes.
 * - Rejected moves do not mutate state.
 */
export class TicTacToe {
    /**
     * Creates a new TicTacToe engine.
     * @param {Player=} startingPlayer The player to start (default: 'X').
     */
    constructor(startingPlayer = 'X') {
        /** @private @type {Player} */
        this.startingPlayer_ = startingPlayer;

        /** @private @type {Array<Array<(Player|null)>>} */
        this.board_ = this.createEmptyBoard_();

        /** @private @type {Player} */
        this.currentPlayer_ = startingPlayer;

        /** @private @type {(Player|null)} */
        this.winner_ = null;

        /** @private @type {boolean} */
        this.finished_ = false;

        /** @private @type {number} */
        this.moveCount_ = 0;
    }

    /**
     * @return {Array<Array<(Player|null)>>} A new 3x3 null-filled board.
     * @private
     */
    createEmptyBoard_() {
        return [
            [null, null, null],
            [null, null, null],
            [null, null, null],
        ];
    }

    // PUBLIC_INTERFACE
    getBoard() {
        /**
         * Returns a deep copy of the board to protect internal state.
         * @return {Array<Array<(Player|null)>>}
         */
        return this.board_.map((row) => row.slice());
    }

    // PUBLIC_INTERFACE
    getCurrentPlayer() {
        /**
         * Returns the current player ('X' or 'O').
         * @return {Player}
         */
        return this.currentPlayer_;
    }

    // PUBLIC_INTERFACE
    getWinner() {
        /**
         * Returns the winner, or null if no winner.
         * @return {(Player|null)}
         */
        return this.winner_;
    }

    // PUBLIC_INTERFACE
    isFinished() {
        /**
         * Returns whether the game is finished (win or draw).
         * @return {boolean}
         */
        return this.finished_;
    }

    // PUBLIC_INTERFACE
    isDraw() {
        /**
         * Returns whether the game ended in a draw.
         * @return {boolean}
         */
        return this.finished_ && this.winner_ === null && this.moveCount_ === 9;
    }

    /**
     * Checks bounds for a move.
     * @param {number} row
     * @param {number} col
     * @return {boolean}
     * @private
     */
    isInBounds_(row, col) {
        return Number.isInteger(row) && Number.isInteger(col) &&
            row >= 0 && row < 3 && col >= 0 && col < 3;
    }

    /**
     * Computes winner from current board.
     * @return {(Player|null)}
     * @private
     */
    computeWinner_() {
        const b = this.board_;

        /** @type {Array<Array<[number, number]>>} */
        const lines = [
            // Rows
            [[0, 0], [0, 1], [0, 2]],
            [[1, 0], [1, 1], [1, 2]],
            [[2, 0], [2, 1], [2, 2]],
            // Cols
            [[0, 0], [1, 0], [2, 0]],
            [[0, 1], [1, 1], [2, 1]],
            [[0, 2], [1, 2], [2, 2]],
            // Diagonals
            [[0, 0], [1, 1], [2, 2]],
            [[0, 2], [1, 1], [2, 0]],
        ];

        for (const line of lines) {
            const [[r1, c1], [r2, c2], [r3, c3]] = line;
            const v1 = b[r1][c1];
            if (v1 === null) {
                continue;
            }
            if (v1 === b[r2][c2] && v1 === b[r3][c3]) {
                return v1;
            }
        }
        return null;
    }

    /**
     * Updates finished/winner flags after a successful move.
     * @private
     */
    evaluateEndState_() {
        const winner = this.computeWinner_();
        if (winner !== null) {
            this.winner_ = winner;
            this.finished_ = true;
            return;
        }

        if (this.moveCount_ === 9) {
            // Draw.
            this.winner_ = null;
            this.finished_ = true;
        }
    }

    // PUBLIC_INTERFACE
    makeMove(row, col) {
        /**
         * Attempts to make a move at (row, col) for the current player.
         *
         * Rejected moves do not mutate state.
         *
         * @param {number} row
         * @param {number} col
         * @return {MoveResult}
         */
        if (this.finished_) {
            return {
                ok: false,
                reason: 'Game is finished.',
                winner: this.winner_,
                isDraw: this.isDraw(),
                isFinished: this.finished_,
                currentPlayer: this.currentPlayer_,
            };
        }

        if (!this.isInBounds_(row, col)) {
            return {
                ok: false,
                reason: 'Move out of bounds.',
                winner: this.winner_,
                isDraw: this.isDraw(),
                isFinished: this.finished_,
                currentPlayer: this.currentPlayer_,
            };
        }

        if (this.board_[row][col] !== null) {
            return {
                ok: false,
                reason: 'Cell is already occupied.',
                winner: this.winner_,
                isDraw: this.isDraw(),
                isFinished: this.finished_,
                currentPlayer: this.currentPlayer_,
            };
        }

        const player = this.currentPlayer_;
        this.board_[row][col] = player;
        this.moveCount_ += 1;

        this.evaluateEndState_();

        if (!this.finished_) {
            this.currentPlayer_ = (this.currentPlayer_ === 'X') ? 'O' : 'X';
        }

        return {
            ok: true,
            winner: this.winner_,
            isDraw: this.isDraw(),
            isFinished: this.finished_,
            currentPlayer: this.currentPlayer_,
            move: {row, col, player},
        };
    }

    // PUBLIC_INTERFACE
    reset(startingPlayer = this.startingPlayer_) {
        /**
         * Resets the game state (board cleared, winner cleared, finished cleared).
         * @param {Player=} startingPlayer Optional new starting player.
         */
        this.startingPlayer_ = startingPlayer;
        this.board_ = this.createEmptyBoard_();
        this.currentPlayer_ = startingPlayer;
        this.winner_ = null;
        this.finished_ = false;
        this.moveCount_ = 0;
    }
}
