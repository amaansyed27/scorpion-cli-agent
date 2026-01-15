/**
 * Live Progress Module for Deep Research
 * Shows real-time status as sources are fetched
 */

import { colors, chalk } from './formatter.js';

let currentOperation = null;
let sourcesFetched = 0;
let totalSources = 0;
let startTime = null;

/**
 * Start research progress tracking
 * @param {number} total - Total number of sources
 */
export function startResearch(total) {
    currentOperation = 'research';
    sourcesFetched = 0;
    totalSources = total;
    startTime = Date.now();

    console.log();
    console.log(colors.accent('  🔬 ') + colors.bold.white('Deep Research Started'));
    console.log(colors.dim('  ─'.repeat(30)));
}

/**
 * Update progress when searching a specific source
 * @param {string} source - Source name (arXiv, HN, Wikipedia)
 */
export function searchingSource(source) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(colors.dim('  ├─ ') + colors.cyan(`Searching ${source}...`) + colors.dim(` (${elapsed}s)`));
}

/**
 * Show found results from a source
 * @param {string} source - Source name
 * @param {number} count - Number of results found
 */
export function foundResults(source, count) {
    if (count > 0) {
        console.log(colors.dim('  │  ') + colors.success(`✓ Found ${count} results from ${source}`));
    } else {
        console.log(colors.dim('  │  ') + colors.muted(`⊗ No results from ${source}`));
    }
}

/**
 * Update progress when fetching a specific URL
 * @param {string} url - URL being fetched
 * @param {number} index - Current index
 */
export function fetchingSource(url, index) {
    sourcesFetched = index;
    const progress = `${index}/${totalSources}`;
    const domain = url.replace(/^https?:\/\//, '').split('/')[0].slice(0, 30);

    console.log(colors.dim('  ├─ ') + colors.info(`[${progress}] `) + colors.white(`Fetching: ${domain}...`));
}

/**
 * Show when source fetch completes
 * @param {string} title - Source title
 * @param {boolean} success - Whether it succeeded
 */
export function sourceCompleted(title, success = true) {
    if (success) {
        console.log(colors.dim('  │  ') + colors.success(`✓ `) + colors.dim(title.slice(0, 60)));
    } else {
        console.log(colors.dim('  │  ') + colors.error(`✗ `) + colors.dim('Failed to fetch'));
    }
}

/**
 * Show report generation status
 */
export function generatingReport() {
    console.log(colors.dim('  ├─ ') + colors.accent('Generating report...'));
}

/**
 * Complete research and show final stats
 * @param {Object} stats - Research statistics
 */
export function completeResearch(stats) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(colors.dim('  └─ ') + colors.success('Research Complete!'));
    console.log();
    console.log(colors.dim('  📊 Stats:'));
    console.log(colors.dim('     • ') + `Sources: ${chalk.cyan(stats.sources)}`);
    console.log(colors.dim('     • ') + `Confidence: ${chalk.cyan(stats.confidence + '%')}`);
    console.log(colors.dim('     • ') + `Time: ${chalk.cyan(elapsed + 's')}`);
    console.log();

    // Reset
    currentOperation = null;
    sourcesFetched = 0;
    totalSources = 0;
}

/**
 * Show sub-query being explored
 * @param {string} query - Sub-query
 * @param {string} type - Query type
 */
export function exploringQuery(query, type) {
    console.log(colors.dim('  ├─ ') + colors.info(`Exploring [${type}]: `) + colors.dim('"') + colors.white(query.slice(0, 50)) + colors.dim('"'));
}

/**
 * Get current progress percentage
 */
export function getProgress() {
    if (totalSources === 0) return 0;
    return Math.round((sourcesFetched / totalSources) * 100);
}

export default {
    startResearch,
    searchingSource,
    foundResults,
    fetchingSource,
    sourceCompleted,
    generatingReport,
    completeResearch,
    exploringQuery,
    getProgress
};
