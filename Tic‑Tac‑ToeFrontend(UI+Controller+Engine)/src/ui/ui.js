/**
 * @fileoverview UI rendering for the Tic-Tac-Toe app (DOM-only).
 */

/**
 * @typedef {{
 *   currentPlayer: string,
 *   winner: (string|null),
 *   isDraw: boolean,
 *   isFinished: boolean,
 *   board: Array<Array<(string|null)>>,
 * }} GameViewModel
 */

/**
 * Creates the application shell and returns key element references.
 *
 * @param {HTMLElement} mountEl
 * @return {{
 *   root: HTMLElement,
 *   statusEl: HTMLElement,
 *   gridEl: HTMLElement,
 *   resetButton: HTMLButtonElement,
 *   cells: Array<HTMLButtonElement>,
 * }}
 */
export function createAppShell(mountEl) {
    mountEl.innerHTML = '';

    const root = document.createElement('div');
    root.className = 'app';

    const header = document.createElement('header');
    header.className = 'app__header';

    const title = document.createElement('h1');
    title.className = 'app__title';
    title.textContent = 'Retro Tic‑Tac‑Toe';

    const subtitle = document.createElement('p');
    subtitle.className = 'app__subtitle';
    subtitle.textContent = 'Insert coin. Take turns. Claim the grid.';

    header.appendChild(title);
    header.appendChild(subtitle);

    const statusRow = document.createElement('div');
    statusRow.className = 'statusRow';

    const statusEl = document.createElement('div');
    statusEl.className = 'statusRow__status';
    statusEl.setAttribute('role', 'status');
    statusEl.setAttribute('aria-live', 'polite');

    const resetButton = document.createElement('button');
    resetButton.className = 'statusRow__reset';
    resetButton.type = 'button';
    resetButton.textContent = 'Reset';

    statusRow.appendChild(statusEl);
    statusRow.appendChild(resetButton);

    const gridEl = document.createElement('div');
    gridEl.className = 'grid';
    gridEl.setAttribute('role', 'grid');
    gridEl.setAttribute('aria-label', 'Tic-Tac-Toe board');

    /** @type {Array<HTMLButtonElement>} */
    const cells = [];
    for (let row = 0; row < 3; row += 1) {
        for (let col = 0; col < 3; col += 1) {
            const cell = document.createElement('button');
            cell.className = 'cell';
            cell.type = 'button';
            cell.setAttribute('role', 'gridcell');
            cell.setAttribute('data-row', String(row));
            cell.setAttribute('data-col', String(col));
            cell.setAttribute('aria-label', `Row ${row + 1}, Column ${col + 1}`);
            cell.textContent = '';
            gridEl.appendChild(cell);
            cells.push(cell);
        }
    }

    const footer = document.createElement('footer');
    footer.className = 'app__footer';
    footer.innerHTML = '<span class="app__hint">Tip:</span> Use Tab/Enter to play with keyboard.';

    root.appendChild(header);
    root.appendChild(statusRow);
    root.appendChild(gridEl);
    root.appendChild(footer);

    mountEl.appendChild(root);

    return {root, statusEl, gridEl, resetButton, cells};
}

/**
 * Renders the current game state into the UI.
 *
 * @param {{
 *   statusEl: HTMLElement,
 *   cells: Array<HTMLButtonElement>,
 * }} refs
 * @param {GameViewModel} vm
 */
export function render(refs, vm) {
    refs.statusEl.textContent = getStatusText_(vm);

    for (const cell of refs.cells) {
        const row = Number(cell.getAttribute('data-row'));
        const col = Number(cell.getAttribute('data-col'));
        const value = vm.board[row][col];

        cell.textContent = value ? value : '';
        cell.setAttribute('data-value', value ? value : '');
        const isDisabled = vm.isFinished || value !== null;
        cell.disabled = isDisabled;
        cell.setAttribute('aria-disabled', String(isDisabled));
    }
}

/**
 * @param {GameViewModel} vm
 * @return {string}
 * @private
 */
function getStatusText_(vm) {
    if (vm.isFinished) {
        if (vm.winner) {
            return `Winner: ${vm.winner} — GG!`;
        }
        if (vm.isDraw) {
            return 'Draw — nobody wins this round.';
        }
        return 'Game over.';
    }
    return `Turn: ${vm.currentPlayer}`;
}
