/**
 * CLI Commands
 * Export, stats, and utility commands
 */

import { saveResearchReport, listReports } from './ui/export.js';
import { renderTable } from './ui/table.js';
import { barChart } from './ui/charts.js';
import { colors } from './ui/formatter.js';
import { listModels } from './ollama.js';

/**
 * List models installed in the local Ollama instance.
 * @param {string} currentModel - Currently selected model
 * @returns {Promise<Array>} Installed models
 */
export async function handleListModels(currentModel) {
    try {
        const models = await listModels();

        if (models.length === 0) {
            console.log(colors.info('  No Ollama models are installed.'));
            console.log(colors.dim('  Pull one with: ollama pull <model>'));
            return models;
        }

        console.log();
        console.log(colors.bold.white('  Ollama Models'));
        console.log(colors.dim('  ' + '─'.repeat(50)));
        renderTable(models.map((model) => ({
            Model: model.name === currentModel ? `${model.name} *` : model.name,
            Size: formatBytes(model.size),
            Modified: model.modified_at ? new Date(model.modified_at).toLocaleString() : '—',
        })), { compact: true });
        console.log(colors.dim('  * active model'));
        console.log();
        return models;
    } catch (error) {
        console.log(colors.error('  Could not list Ollama models.'));
        console.log(colors.dim('  Make sure Ollama is running: ollama serve'));
        return [];
    }
}

/**
 * Select an installed Ollama model using the REPL's existing input stream.
 * @param {string} currentModel - Currently selected model
 * @param {Function} ask - Function that prompts for one line of input
 * @param {string} requestedModel - Optional model supplied with `/model <name>`
 * @returns {Promise<string|null>} Selected model, or null when cancelled/unavailable
 */
export async function handleModelSelect(currentModel, ask, requestedModel = '') {
    let models;
    try {
        models = await listModels();
    } catch (error) {
        console.log(colors.error('  Could not connect to Ollama.'));
        console.log(colors.dim('  Make sure Ollama is running: ollama serve'));
        return null;
    }
    if (models.length === 0) {
        console.log(colors.info('  No Ollama models are installed. Pull one with: ollama pull <model>'));
        return null;
    }

    const requested = requestedModel.trim();
    if (requested) {
        const exactMatch = models.find((model) => model.name === requested);
        if (exactMatch) return exactMatch.name;
        console.log(colors.error(`  Model '${requested}' is not installed. Use /list to see available models.`));
        return null;
    }

    console.log();
    console.log(colors.bold.white('  Select an Ollama Model'));
    models.forEach((model, index) => {
        const active = model.name === currentModel ? colors.success(' (active)') : '';
        console.log(`  ${colors.dim(`${index + 1}.`)} ${model.name}${active}`);
    });
    console.log(colors.dim('  Enter a number, model name, or press Enter to cancel.'));

    const answer = (await ask(colors.accent('  Select model: '))).trim();
    if (!answer) return null;

    const selectedIndex = Number.parseInt(answer, 10);
    if (Number.isInteger(selectedIndex) && String(selectedIndex) === answer && models[selectedIndex - 1]) {
        return models[selectedIndex - 1].name;
    }

    const exactMatch = models.find((model) => model.name === answer);
    if (exactMatch) return exactMatch.name;

    console.log(colors.error(`  '${answer}' is not a valid installed model.`));
    return null;
}

function formatBytes(bytes = 0) {
    if (!bytes) return '—';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    return `${(bytes / (1024 ** index)).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

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
    handleListModels,
    handleModelSelect,
    handleStats,
    handleDemo
};
