/**
 * Chart Rendering Utility
 * ASCII charts and graphs for terminal
 */

import { colors, chalk } from './formatter.js';

/**
 * Render a bar chart
 * @param {Array} data - Data array [{label, value}]
 * @param {Object} options - Chart options
 */
export function barChart(data, options = {}) {
    const {
        maxWidth = 50,
        showValues = true,
        color = 'cyan',
        title = null
    } = options;

    if (!data || data.length === 0) {
        console.log(colors.dim('  (No data to display)'));
        return;
    }

    // Find max value for scaling
    const maxValue = Math.max(...data.map(d => d.value));
    const maxLabelLength = Math.max(...data.map(d => d.label.length));

    if (title) {
        console.log();
        console.log(colors.bold.white(`  ${title}`));
        console.log(colors.dim('  ─'.repeat(30)));
    }

    console.log();

    for (const item of data) {
        const percentage = item.value / maxValue;
        const barLength = Math.round(percentage * maxWidth);
        const bar = '█'.repeat(barLength);
        const paddedLabel = item.label.padEnd(maxLabelLength);

        const colorFn = typeof color === 'function' ? color : chalk[color] || chalk.cyan;
        const valueStr = showValues ? chalk.dim(` ${item.value}`) : '';

        console.log(`  ${chalk.dim(paddedLabel)} ${colorFn(bar)}${valueStr}`);
    }

    console.log();
}

/**
 * Render a sparkline
 * @param {Array} values - Array of numbers
 * @param {Object} options - Options
 */
export function sparkline(values, options = {}) {
    const { color = 'cyan', showMinMax = true } = options;

    if (!values || values.length === 0) {
        return colors.dim('(no data)');
    }

    const sparks = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;

    if (range === 0) {
        return sparks[4].repeat(values.length);
    }

    let line = values.map(v => {
        const normalized = (v - min) / range;
        const index = Math.min(Math.floor(normalized * sparks.length), sparks.length - 1);
        return sparks[index];
    }).join('');

    const colorFn = chalk[color] || chalk.cyan;
    line = colorFn(line);

    if (showMinMax) {
        line = chalk.dim(`${min} `) + line + chalk.dim(` ${max}`);
    }

    return line;
}

/**
 * Render a progress bar
 * @param {number} current - Current value
 * @param {number} total - Total value
 * @param {Object} options - Options
 */
export function progressBar(current, total, options = {}) {
    const {
        width = 40,
        complete = '█',
        incomplete = '░',
        showPercentage = true,
        color = 'green'
    } = options;

    const percentage = Math.min(Math.max(current / total, 0), 1);
    const filled = Math.round(width * percentage);
    const empty = width - filled;

    const colorFn = chalk[color] || chalk.green;
    const bar = colorFn(complete.repeat(filled)) + colors.dim(incomplete.repeat(empty));

    let result = `  ${bar}`;
    if (showPercentage) {
        const pct = Math.round(percentage * 100);
        result += colors.dim(` ${pct}%`);
    }

    return result;
}

/**
 * Render a distribution chart (histogram)
 * @param {Object} distribution - {label: count}
 * @param {Object} options - Options
 */
export function distributionChart(distribution, options = {}) {
    const { title = 'Distribution', maxWidth = 40 } = options;

    const data = Object.entries(distribution).map(([label, value]) => ({ label, value }));
    barChart(data, { ...options, title, maxWidth });
}

/**
 * Render a simple line chart with ASCII art
 * @param {Array} values - Array of numbers
 * @param {Object} options - Options
 */
export function lineChart(values, options = {}) {
    const { height = 10, width = 60, title = null, color = 'cyan' } = options;

    if (!values || values.length === 0) {
        console.log(colors.dim('  (No data to display)'));
        return;
    }

    if (title) {
        console.log();
        console.log(colors.bold.white(`  ${title}`));
        console.log(colors.dim('  ─'.repeat(30)));
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;

    console.log();

    // Create grid
    for (let row = height; row >= 0; row--) {
        const threshold = min + (range * row / height);
        let line = '  ';

        for (let i = 0; i < values.length; i++) {
            const value = values[i];
            const prevValue = i > 0 ? values[i - 1] : value;

            if ((value >= threshold && prevValue < threshold) ||
                (value < threshold && prevValue >= threshold)) {
                line += chalk[color]('╱');
            } else if (value >= threshold) {
                line += chalk[color]('█');
            } else {
                line += ' ';
            }
        }

        console.log(line);
    }

    console.log();
}

/**
 * Render a comparison table with bars
 * @param {Array} items - Array of {name, value, target}
 */
export function comparisonChart(items, options = {}) {
    const { title = 'Comparison' } = options;

    console.log();
    console.log(colors.bold.white(`  ${title}`));
    console.log(colors.dim('  ─'.repeat(50)));
    console.log();

    for (const item of items) {
        const bar = sparkline([item.value, item.target || item.value], { color: 'cyan', showMinMax: false });
        const percentage = item.target ? Math.round((item.value / item.target) * 100) : 100;
        const status = percentage >= 100 ? colors.success('✓') : colors.dim('○');

        console.log(`  ${status} ${item.name.padEnd(20)} ${bar} ${colors.dim(percentage + '%')}`);
    }

    console.log();
}

export default {
    barChart,
    sparkline,
    progressBar,
    distributionChart,
    lineChart,
    comparisonChart
};
