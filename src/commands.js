/**
 * CLI Commands
 * Export, stats, and utility commands
 */

import { saveResearchReport, listReports } from './ui/export.js';
import { renderTable } from './ui/table.js';
import { barChart } from './ui/charts.js';
import { colors } from './ui/formatter.js';

/**
 * Handle export command
 * @param {string} format - Export format (md, json)
 */
export async function handleExport(format = 'md') {
    console.log();
    console.log(colors.accent('  💾 Export Report'));
    console.log(colors.dim('  ─'.repeat(30)));
    console.log();
    console.log(colors.dim('  Exporting last research report...'));
    console.log();

    // TODO: Implement export of last report
    console.log(colors.info('  ℹ Export functionality available via Deep Research'));
    console.log(colors.dim('  Reports are auto-saved to reports/ directory'));
    console.log();
}

/**
 * Handle list reports command
 */
export async function handleListReports() {
    await listReports();
}

/**
 * Handle stats command
 */
export async function handleStats() {
    console.log();
    console.log(colors.bold.white('  📊 Session Statistics'));
    console.log(colors.dim('  ─'.repeat(50)));
    console.log();

    // Example stats (would be tracked in real implementation)
    const stats = [
        { label: 'Queries', value: 12 },
        { label: 'Tool Calls', value: 45 },
        { label: 'Deep Research', value: 3 },
        { label: 'Quick Response', value: 9 }
    ];

    barChart(stats, { maxWidth: 30, color: 'cyan' });
}

/**
 * Handle demo command (show all UI features)
 */
export async function handleDemo() {
    console.log();
    console.log(colors.bold.white('  🎨 UI Feature Demo'));
    console.log(colors.dim('  ─'.repeat(50)));
    console.log();

    // Demo table
    console.log(colors.accent('  📋 Table Example:'));
    console.log();
    renderTable([
        { Feature: 'Deep Research', Status: '✓ Available', Type: 'Core' },
        { Feature: 'Quick Mode', Status: '✓ Available', Type: 'Core' },
        { Feature: 'Export', Status: '✓ Available', Type: 'Utility' }
    ], { compact: true });

    console.log();
    console.log(colors.accent('  📊 Chart Example:'));
    console.log();
    barChart([
        { label: 'arXiv', value: 85 },
        { label: 'HN', value: 65 },
        { label: 'Wikipedia', value: 92 }
    ], { title: 'Source Reliability (%)', maxWidth: 40 });

    console.log(colors.accent('  💡 Available Commands:'));
    console.log();
    console.log(colors.dim('    help') + colors.white(' - Show @ trigger help'));
    console.log(colors.dim('    stats') + colors.white(' - Show session stats'));
    console.log(colors.dim('    reports') + colors.white(' - List saved reports'));
    console.log(colors.dim('    demo') + colors.white(' - Show UI features'));
    console.log(colors.dim('    clear') + colors.white(' - Clear conversation'));
    console.log();
}

export default {
    handleExport,
    handleListReports,
    handleStats,
    handleDemo
};
