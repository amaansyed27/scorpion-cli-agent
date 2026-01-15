/**
 * Box and Panel Components
 * Create beautiful boxed content for terminal
 */

import { colors, chalk } from './formatter.js';
import boxen from 'boxen';

/**
 * Create a boxed panel
 * @param {string} content - Panel content
 * @param {Object} options - Boxen options
 */
export function createPanel(content, options = {}) {
    const {
        title = null,
        borderColor = 'cyan',
        borderStyle = 'round',
        padding = 1,
        margin = { top: 1, bottom: 1, left: 2, right: 0 }
    } = options;

    return boxen(content, {
        title,
        titleAlignment: 'center',
        borderColor,
        borderStyle,
        padding,
        margin
    });
}

/**
 * Create an info panel
 * @param {string} content - Content
 * @param {string} title - Title
 */
export function infoPanel(content, title = 'ℹ Info') {
    return createPanel(content, {
        title,
        borderColor: 'blue',
        borderStyle: 'round'
    });
}

/**
 * Create a success panel
 * @param {string} content - Content
 * @param {string} title - Title
 */
export function successPanel(content, title = '✓ Success') {
    return createPanel(content, {
        title,
        borderColor: 'green',
        borderStyle: 'round'
    });
}

/**
 * Create an error panel
 * @param {string} content - Content
 * @param {string} title - Title
 */
export function errorPanel(content, title = '✗ Error') {
    return createPanel(content, {
        title,
        borderColor: 'red',
        borderStyle: 'round'
    });
}

/**
 * Create a response panel (main AI response)
 * @param {string} content - Content
 */
export function responsePanel(content) {
    return createPanel(content, {
        title: chalk.bold.cyan('◆ Response'),
        borderColor: 'cyan',
        borderStyle: 'round',
        padding: { top: 1, bottom: 1, left: 2, right: 2 }
    });
}

/**
 * Create a section divider with title
 * @param {string} title - Section title
 * @param {string} icon - Optional icon
 */
export function sectionDivider(title, icon = '◆') {
    const line = '─'.repeat(60);
    const titleText = `${icon} ${title}`;
    console.log();
    console.log(colors.accent(`  ${titleText}`));
    console.log(colors.dim(`  ${line}`));
}

/**
 * Create a stats card
 * @param {Object} stats - Stats object
 * @param {string} title - Card title
 */
export function statsCard(stats, title = '📊 Stats') {
    const lines = [];

    for (const [key, value] of Object.entries(stats)) {
        const formattedKey = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
        lines.push(`${chalk.dim(formattedKey + ':')} ${chalk.cyan(value)}`);
    }

    return createPanel(lines.join('\n'), {
        title,
        borderColor: 'magenta',
        borderStyle: 'round',
        padding: 1
    });
}

/**
 * Create a quote/callout box
 * @param {string} content - Quote content
 * @param {string} type - Type (info, warning, tip)
 */
export function calloutBox(content, type = 'info') {
    const styles = {
        info: { icon: 'ℹ', color: 'blue', title: 'Info' },
        warning: { icon: '⚠', color: 'yellow', title: 'Warning' },
        tip: { icon: '💡', color: 'green', title: 'Tip' },
        note: { icon: '📝', color: 'cyan', title: 'Note' }
    };

    const style = styles[type] || styles.info;

    return createPanel(content, {
        title: `${style.icon} ${style.title}`,
        borderColor: style.color,
        borderStyle: 'round'
    });
}

export default {
    createPanel,
    infoPanel,
    successPanel,
    errorPanel,
    responsePanel,
    sectionDivider,
    statsCard,
    calloutBox
};
