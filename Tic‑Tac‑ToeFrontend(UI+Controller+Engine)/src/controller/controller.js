/**
 * @fileoverview Controller layer: wires UI events to engine commands and re-renders.
 */

import { TicTacToe } from '../engine/tictactoe.js';
import { createAppShell, render } from '../ui/ui.js';

/**
 * Boots the Tic-Tac-Toe app in the provided mount element.
 *
 * @param {HTMLElement} mountEl
 */
export function startApp(mountEl) {
    const engine = new TicTacToe('X');
    const refs = createAppShell(mountEl);

    /**
     * @return {{
     *   currentPlayer: string,
     *   winner: (string|null),
     *   isDraw: boolean,
     *   isFinished: boolean,
     *   board: Array<Array<(string|null)>>,
     * }}
     */
    function toViewModel() {
        return {
            currentPlayer: engine.getCurrentPlayer(),
            winner: engine.getWinner(),
            isDraw: engine.isDraw(),
            isFinished: engine.isFinished(),
            board: engine.getBoard(),
        };
    }

    /**
     * Re-renders the UI from current engine state.
     */
    function refresh() {
        render({statusEl: refs.statusEl, cells: refs.cells}, toViewModel());
    }

    refs.gridEl.addEventListener('click', (e) => {
        const target = /** @type {?HTMLElement} */ (e.target instanceof HTMLElement ? e.target : null);
        if (!target || !target.classList.contains('cell')) {
            return;
        }

        const row = Number(target.getAttribute('data-row'));
        const col = Number(target.getAttribute('data-col'));
        engine.makeMove(row, col);
        refresh();
    });

    refs.resetButton.addEventListener('click', () => {
        engine.reset('X');
        refresh();
    });

    // Initial render.
    refresh();
}
