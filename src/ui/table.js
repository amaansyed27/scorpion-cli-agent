/**
 * Table Rendering Utility
 * Creates beautiful ASCII tables for terminal display
 */

import { colors, chalk } from './formatter.js';

/**
 * Render a table
 * @param {Array} data - Array of objects
 * @param {Object} options - Table options
 */
export function renderTable(data, options = {}) {
    const {
        headers = null,
        maxWidth = 100,
        compact = false
    } = options;

    if (!data || data.length === 0) {
        console.log(colors.dim('  (No data)'));
        return;
    }

    // Auto-detect headers from first object
    const keys = headers || Object.keys(data[0]);

    // Calculate column widths
    const columnWidths = {};
    for (const key of keys) {
        columnWidths[key] = Math.max(
            key.length,
            ...data.map(row => String(row[key] || '').length)
        );
        // Cap at reasonable width
        columnWidths[key] = Math.min(columnWidths[key], 40);
    }

    // Top border
    const topBorder = '  ┌' + keys.map(key => '─'.repeat(columnWidths[key] + 2)).join('┬') + '┐';
    console.log(colors.dim(topBorder));

    // Header row
    const headerRow = '  │ ' + keys.map(key => {
        const padded = key.padEnd(columnWidths[key]);
        return chalk.bold.cyan(padded);
    }).join(' │ ') + ' │';
    console.log(headerRow);

    // Header separator
    const headerSep = '  ├' + keys.map(key => '─'.repeat(columnWidths[key] + 2)).join('┼') + '┤';
    console.log(colors.dim(headerSep));

    // Data rows
    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const rowStr = '  │ ' + keys.map(key => {
            let value = String(row[key] || '');
            // Truncate if too long
            if (value.length > columnWidths[key]) {
                value = value.slice(0, columnWidths[key] - 3) + '...';
            }
            return value.padEnd(columnWidths[key]);
        }).join(' │ ') + ' │';

        console.log(rowStr);

        // Row separator (optional)
        if (!compact && i < data.length - 1) {
            const rowSep = '  ├' + keys.map(key => '─'.repeat(columnWidths[key] + 2)).join('┼') + '┤';
            console.log(colors.dim(rowSep));
        }
    }

    // Bottom border
    const bottomBorder = '  └' + keys.map(key => '─'.repeat(columnWidths[key] + 2)).join('┴') + '┘';
    console.log(colors.dim(bottomBorder));
}

/**
 * Render a simple key-value table
 * @param {Object} data - Object with key-value pairs
 */
export function renderKeyValueTable(data) {
    if (!data || Object.keys(data).length === 0) {
        console.log(colors.dim('  (No data)'));
        return;
    }

    const entries = Object.entries(data);
    const maxKeyLength = Math.max(...entries.map(([key]) => key.length));

    console.log(colors.dim('  ┌' + '─'.repeat(maxKeyLength + 2) + '┬' + '─'.repeat(40) + '┐'));

    for (let i = 0; i < entries.length; i++) {
        const [key, value] = entries[i];
        const paddedKey = key.padEnd(maxKeyLength);
        let valueStr = String(value);

        // Truncate long values
        if (valueStr.length > 38) {
            valueStr = valueStr.slice(0, 35) + '...';
        }
        valueStr = valueStr.padEnd(38);

        const row = `  │ ${chalk.bold.cyan(paddedKey)} │ ${valueStr} │`;
        console.log(row);

        if (i < entries.length - 1) {
            console.log(colors.dim('  ├' + '─'.repeat(maxKeyLength + 2) + '┼' + '─'.repeat(40) + '┤'));
        }
    }

    console.log(colors.dim('  └' + '─'.repeat(maxKeyLength + 2) + '┴' + '─'.repeat(40) + '┘'));
}

/**
 * Render a compact list
 * @param {Array} items - Array of strings or objects
 * @param {Object} options - Options
 */
export function renderList(items, options = {}) {
    const {
        numbered = false,
        icon = '•',
        color = colors.white
    } = options;

    if (!items || items.length === 0) {
        console.log(colors.dim('  (No items)'));
        return;
    }

    for (let i = 0; i < items.length; i++) {
        const item = typeof items[i] === 'string' ? items[i] : String(items[i]);
        const prefix = numbered ? colors.dim(`  ${i + 1}. `) : colors.dim(`  ${icon} `);
        console.log(prefix + color(item));
    }
}

export default {
    renderTable,
    renderKeyValueTable,
    renderList
};
