/**
 * Interactive REPL - Claude Code / Gemini CLI Style
 * Clean, natural language interface
 */

import readline from 'readline';
import { runAgent } from '../agent.js';
import { isModelAvailable, DEFAULT_MODEL } from '../ollama.js';
import { getConfigPath, loadSettings, saveSettings } from '../config.js';
import { setProgressCallback } from '../tools/deep-research.js';
import { handleStats, handleListReports, handleDemo, handleExport, handleListModels, handleModelSelect } from '../commands.js';
import {
    displayBanner,
    showToolExecution,
    showThinking,
    showResponse,
    showError,
    showInfo,
    showSuccess,
    showSimmering,
    showDivider,
    showWelcomeCode,
    getPrompt,
    clearLine,
    colors,
    chalk
} from './formatter.js';

/**
 * Start the interactive REPL
 * @param {Object} options - REPL options
 */
export async function startREPL(options = {}) {
    const {
        model,
        showThinkingOutput = false,  // Hidden by default like Claude Code
    } = options;

    const persistedSettings = await loadSettings();
    const settings = {
        model: model || persistedSettings.model || DEFAULT_MODEL,
        showThinkingOutput,
    };

    // Display welcome banner
    displayBanner();

    // Check Ollama connection
    try {
        const available = await isModelAvailable(settings.model);
        if (!available) {
            showError(`Model '${settings.model}' not found. Run: ollama pull ${settings.model}`);
        } else {
            showSuccess(`Connected to ${settings.model}`);
        }
    } catch (error) {
        showError('Could not connect to Ollama. Make sure it is running.');
        showInfo('Start with: ollama serve');
    }

    // Show the welcome code block like Claude Code
    showWelcomeCode();

    showSimmering();

    // Create readline interface
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    // Conversation history
    let history = [];
    let isClosing = false;

    // Main loop
    const prompt = () => {
        if (isClosing || rl.closed) return;
        rl.question(getPrompt(), async (input) => {
            if (isClosing || rl.closed) return;
            const trimmedInput = input.trim();

            // Handle empty input
            if (!trimmedInput) {
                prompt();
                return;
            }

            // Handle exit
            if (trimmedInput.toLowerCase() === 'exit' || trimmedInput.toLowerCase() === 'quit') {
                isClosing = true;
                console.log();
                showInfo('Goodbye! 👋');
                console.log();
                rl.close();
                process.exit(0);
            }

            // Handle slash commands and retain the older bare command aliases.
            const command = parseCommand(trimmedInput);
            if (command) {
                const shouldContinue = await handleCommand(command, settings, () => {
                    history = [];
                }, (question) => new Promise((resolve) => rl.question(question, resolve)));
                if (shouldContinue && !isClosing && !rl.closed) {
                    prompt();
                    return;
                }
                if (isClosing || rl.closed) return;
            }

            // Show help
            if (trimmedInput.toLowerCase() === 'help' || trimmedInput === '?') {
                showHelp();
                prompt();
                return;
            }

            // Handle clear
            if (trimmedInput.toLowerCase() === 'clear') {
                history = [];
                displayBanner();
                showSuccess('Conversation cleared');
                showWelcomeCode();
                prompt();
                return;
            }

            // Handle stats command
            if (trimmedInput.toLowerCase() === 'stats') {
                await handleStats();
                prompt();
                return;
            }

            // Handle reports command
            if (trimmedInput.toLowerCase() === 'reports') {
                await handleListReports();
                prompt();
                return;
            }

            // Handle export command
            if (trimmedInput.toLowerCase().startsWith('export ')) {
                const format = trimmedInput.split(' ')[1] || 'md';
                await handleExport(format);
                prompt();
                return;
            }

            // Handle demo command
            if (trimmedInput.toLowerCase() === 'demo') {
                await handleDemo();
                prompt();
                return;
            }

            // Process with agent
            await processInput(trimmedInput, history, settings);

            prompt();
        });
    };

    prompt();
}

function parseCommand(input) {
    if (!input.startsWith('/')) return null;
    const [name, ...args] = input.slice(1).trim().split(/\s+/);
    return name ? { name: name.toLowerCase(), args } : { name: 'help', args: [] };
}

async function handleCommand(command, settings, clearHistory, ask) {
    const arg = command.args[0]?.toLowerCase();

    switch (command.name) {
        case 'help':
        case '?':
            showHelp();
            return true;
        case 'list':
        case 'models':
            await handleListModels(settings.model);
            return true;
        case 'model': {
            const selected = await handleModelSelect(settings.model, ask, command.args.join(' '));
            if (selected) {
                settings.model = selected;
                try {
                    await saveSettings({ model: settings.model });
                    showSuccess(`Model changed to ${settings.model} (saved)`);
                } catch (error) {
                    showError(`Model changed, but could not save it: ${error.message}`);
                }
            }
            return true;
        }
        case 'settings':
            showSettings(settings);
            return true;
        case 'think':
            if (!['on', 'off', 'toggle'].includes(arg)) {
                showInfo('Usage: /think on | /think off | /think toggle');
            } else {
                settings.showThinkingOutput = arg === 'toggle' ? !settings.showThinkingOutput : arg === 'on';
                showSuccess(`Thinking output ${settings.showThinkingOutput ? 'enabled' : 'disabled'}`);
            }
            return true;
        case 'clear':
            clearHistory();
            displayBanner();
            showSuccess('Conversation cleared');
            showWelcomeCode();
            return true;
        case 'stats':
            await handleStats();
            return true;
        case 'reports':
            await handleListReports();
            return true;
        case 'demo':
            await handleDemo();
            return true;
        case 'export':
            await handleExport(command.args[0] || 'md');
            return true;
        case 'exit':
        case 'quit':
            showInfo('Goodbye! 👋');
            process.exit(0);
        default:
            showError(`Unknown command '/${command.name}'. Type /help for available commands.`);
            return true;
    }
}

function showSettings(settings) {
    console.log();
    console.log(colors.bold.white('  Current Settings'));
    console.log(colors.dim('  ' + '─'.repeat(30)));
    console.log(`  Model: ${colors.accent(settings.model)}`);
    console.log(`  Thinking output: ${colors.accent(settings.showThinkingOutput ? 'on' : 'off')}`);
    console.log(`  Ollama host: ${colors.dim(process.env.OLLAMA_HOST || 'http://localhost:11434')}`);
    console.log(`  Settings file: ${colors.dim(getConfigPath())}`);
    console.log();
}

/**
 * Show help for @ triggers
 */
function showHelp() {
    console.log();
    console.log(colors.bold.white('  🎯 Available Commands'));
    console.log(colors.dim('  ─'.repeat(50)));
    console.log();

    console.log(colors.accent('  @ Triggers:'));
    console.log(colors.dim('    @deepresearch, @deep') + colors.white(' <query>'));
    console.log(colors.dim('      • Comprehensive multi-source research'));
    console.log(colors.dim('      • Searches arXiv, Hacker News, Wikipedia'));
    console.log(colors.dim('      • Generates structured report with citations'));
    console.log(colors.dim('      • Shows live progress updates'));
    console.log();
    console.log(colors.dim('    @quick, @fast') + colors.white(' <question>'));
    console.log(colors.dim('      • Fast response without deep research'));
    console.log();

    console.log(colors.accent('  Utility Commands:'));
    console.log(colors.dim('    /help, /?') + colors.white(' - Show this help message'));
    console.log(colors.dim('    /list    ') + colors.white(' - List installed Ollama models'));
    console.log(colors.dim('    /model   ') + colors.white(' [name] - Select or switch model'));
    console.log(colors.dim('    /settings') + colors.white(' - Show current settings'));
    console.log(colors.dim('    /think   ') + colors.white(' on|off|toggle - Toggle thinking output'));
    console.log(colors.dim('    /demo    ') + colors.white(' - See all UI features (tables, charts)'));
    console.log(colors.dim('    /stats   ') + colors.white(' - Show session statistics'));
    console.log(colors.dim('    /reports ') + colors.white(' - List saved research reports'));
    console.log(colors.dim('    /export  ') + colors.white(' [md|json] - Export last report'));
    console.log(colors.dim('    /clear   ') + colors.white(' - Clear conversation history'));
    console.log(colors.dim('    /exit    ') + colors.white(' - Quit Scorpion'));
    console.log();

    console.log(colors.accent('  Auto-Detection:'));
    console.log(colors.dim('    Queries containing "research", "analyze", "explain in detail"'));
    console.log(colors.dim('    automatically trigger deep research mode.'));
    console.log();

    console.log(colors.accent('  Examples:'));
    console.log(colors.cyan('    @deep transformer architecture in ML'));
    console.log(colors.cyan('    research quantum computing applications'));
    console.log(colors.cyan('    demo'));
    console.log(colors.cyan('    stats'));
    console.log();
}

/**
 * Parse @ triggers and mode from input
 * @param {string} input - Raw user input
 * @returns {Object} - { mode, cleanInput }
 */
function parseMode(input) {
    const triggerMatch = input.match(/^@(\w+)\s+(.+)$/);

    if (triggerMatch) {
        const [, trigger, cleanInput] = triggerMatch;

        if (trigger === 'deepresearch' || trigger === 'deep') {
            return { mode: 'deep_research', cleanInput, explicit: true };
        }
        if (trigger === 'quick' || trigger === 'fast') {
            return { mode: 'quick_response', cleanInput, explicit: true };
        }
    }

    // Auto-detect deep research intent
    const deepKeywords = ['research', 'analyze', 'explain in detail', 'comprehensive', 'deep dive', 'study'];
    const inputLower = input.toLowerCase();

    for (const keyword of deepKeywords) {
        if (inputLower.includes(keyword)) {
            return { mode: 'deep_research', cleanInput: input, explicit: false };
        }
    }

    return { mode: 'normal', cleanInput: input, explicit: false };
}

/**
 * Process user input through the agent
 * @param {string} input - User input
 * @param {Array} history - Conversation history
 * @param {Object} options - Processing options
 */
async function processInput(input, history, options = {}) {
    const { model, showThinkingOutput = false } = options;

    // Parse mode
    const { mode, cleanInput, explicit } = parseMode(input);

    // If explicit @ trigger, show what mode we're in
    if (explicit) {
        console.log();
        if (mode === 'deep_research') {
            console.log(colors.accent('  🔬 ') + colors.bold.white('Deep Research Mode'));
        } else if (mode === 'quick_response') {
            console.log(colors.accent('  ⚡ ') + colors.bold.white('Quick Response Mode'));
        }
    } else if (mode === 'deep_research') {
        // Auto-detected deep research
        console.log();
        console.log(colors.dim('  🔍 Auto-detected: ') + colors.accent('Deep Research Mode'));
    }

    // Start timer
    const startTime = Date.now();

    // Show initial thinking state
    console.log();
    process.stdout.write(colors.accent('  ✦ ') + colors.dim('Thinking...'));

    let hasStartedOutput = false;
    let toolCallCount = 0;
    let thinkingShown = false;
    let isDeepResearch = false;
    let contentBuffer = ''; // Buffer for Markdown rendering

    // Setup progress callback for deep research
    setProgressCallback((event, data) => {
        if (event === 'start') {
            console.log();
            console.log(colors.accent('  🔬 ') + colors.bold.white('Deep Research In Progress'));
            console.log(colors.dim('  ─'.repeat(30)));
        } else if (event === 'subquery') {
            console.log(colors.dim('  ├─ ') + colors.info(`Exploring [${data.type}]: `) + colors.white(`"${data.query.slice(0, 50)}..."`));
        } else if (event === 'searching') {
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            console.log(colors.dim('  │  ') + colors.cyan(`Searching ${data.source}...`) + colors.dim(` (${elapsed}s)`));
        } else if (event === 'found') {
            if (data.count > 0) {
                console.log(colors.dim('  │  ') + colors.success(`✓ Found ${data.count} results from ${data.source}`));
            } else {
                console.log(colors.dim('  │  ') + colors.muted(`⊗ No results from ${data.source}`));
            }
        } else if (event === 'generating') {
            console.log(colors.dim('  ├─ ') + colors.accent('Generating report...'));
        } else if (event === 'complete') {
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            console.log(colors.dim('  └─ ') + colors.success('Research Complete!'));
            console.log();
            console.log(colors.dim('  📊 Stats:'));
            console.log(colors.dim('     • ') + `Sources: ${chalk.cyan(data.sources)}`);
            console.log(colors.dim('     • ') + `Confidence: ${chalk.cyan(data.confidence + '%')}`);
            console.log(colors.dim('     • ') + `Time: ${chalk.cyan(elapsed + 's')}`);
            console.log();
        }
    });

    try {
        const result = await runAgent(cleanInput, {
            history,
            model,

            onThinking: (text) => {
                if (!hasStartedOutput && !isDeepResearch) {
                    clearLine();
                    hasStartedOutput = true;
                }

                if (showThinkingOutput && !thinkingShown) {
                    showThinking(text);
                    thinkingShown = true;
                }
            },

            onContent: (text) => {
                if (!hasStartedOutput) {
                    clearLine();
                    console.log(); // Clear the "Thinking..." line
                    hasStartedOutput = true;
                }

                // Buffer content for Markdown rendering
                contentBuffer += text;
            },

            onToolCall: ({ name, args }) => {
                toolCallCount++;

                // Check if this is deep research
                if (name === 'deep_research') {
                    isDeepResearch = true;
                    clearLine();
                    hasStartedOutput = true;
                    return; // Progress callback will handle display
                }

                if (!hasStartedOutput) {
                    clearLine();
                    hasStartedOutput = true;
                }

                // Show human-readable action for other tools
                showToolExecution(name, args);
            },

            onToolResult: ({ name, result }) => {
                // Parse and show brief result if relevant
                try {
                    const parsed = JSON.parse(result);
                    if (parsed.success === false && parsed.error) {
                        console.log(colors.error(`    ✗ ${parsed.error}`));
                    }
                } catch {
                    // Ignore parse errors
                }
            },
        });

        // Render buffered content with Markdown formatting
        if (contentBuffer) {
            showResponse(contentBuffer);
        }

        // Show elapsed time in a nice format
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log();
        console.log(colors.dim('  ─'.repeat(30)));
        console.log(colors.accent('  ⏱ ') + colors.white(`${elapsed}s`));
        console.log();

        // Update history
        history.push({ role: 'user', content: cleanInput });
        if (contentBuffer) {
            history.push({ role: 'assistant', content: contentBuffer });
        }

    } catch (error) {
        clearLine();

        if (error.message?.includes('ECONNREFUSED') || error.message?.includes('fetch failed')) {
            showError('Could not connect to Ollama. Make sure it is running.');
        } else {
            showError(error.message);
        }
    }
}

export { processInput, parseCommand };
