/**
 * UI Formatter - Claude Code / Gemini CLI Style
 * Clean, minimal, beautiful terminal output
 */

import chalk from 'chalk';
import gradient from 'gradient-string';

// Custom gradients
const bannerGradient = gradient(['#ff6b35', '#f7c531', '#f7931e']);
const accentGradient = gradient(['#667eea', '#764ba2']);
const successGradient = gradient(['#11998e', '#38ef7d']);

// Colors
const colors = {
    accent: chalk.hex('#f7931e'),       // Orange accent
    dim: chalk.dim,
    success: chalk.hex('#38ef7d'),
    error: chalk.hex('#ff6b6b'),
    info: chalk.hex('#74b9ff'),
    muted: chalk.hex('#636e72'),
    white: chalk.white,
    bold: chalk.bold,
    cyan: chalk.cyan,
};

/**
 * ASCII Art Banner for Scorpion
 */
const BANNER = `
  ███████╗ ██████╗ ██████╗ ██████╗ ██████╗ ██╗ ██████╗ ███╗   ██╗
  ██╔════╝██╔════╝██╔═══██╗██╔══██╗██╔══██╗██║██╔═══██╗████╗  ██║
  ███████╗██║     ██║   ██║██████╔╝██████╔╝██║██║   ██║██╔██╗ ██║
  ╚════██║██║     ██║   ██║██╔══██╗██╔═══╝ ██║██║   ██║██║╚██╗██║
  ███████║╚██████╗╚██████╔╝██║  ██║██║     ██║╚██████╔╝██║ ╚████║
  ╚══════╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═══╝
`;

/**
 * Display the welcome banner
 */
export function displayBanner() {
    console.clear();
    console.log(bannerGradient(BANNER));

    console.log(colors.muted('  ─────────────────────────────────────────────────────────────'));
    console.log();
    console.log(colors.accent('  ✦ ') + colors.white('Welcome to ') + colors.bold.hex('#f7931e')('Scorpion') + colors.white('!'));
    console.log();
    console.log(colors.dim('  Tips for getting started:'));
    console.log(colors.dim('  1. Ask questions, edit files, or run commands.'));
    console.log(colors.dim('  2. Be specific for the best results.'));
    console.log(colors.dim('  3. Type ') + colors.accent('exit') + colors.dim(' to quit.'));
    console.log();
}

/**
 * Display a status message (like "Searching the web for...")
 * @param {string} action - The action being performed
 * @param {string} detail - Optional detail
 */
export function showStatus(action, detail = '') {
    const prefix = colors.muted('  ○ ');
    const actionText = colors.muted(action);
    const detailText = detail ? colors.white(detail) : '';

    process.stdout.write(`\r${prefix}${actionText} ${detailText}`);
}

/**
 * Update status to show completion
 * @param {string} action - The action that completed
 * @param {string} detail - Optional detail
 */
export function completeStatus(action, detail = '') {
    const prefix = colors.success('  ● ');
    const actionText = colors.muted(action);
    const detailText = detail ? colors.white(detail) : '';

    console.log(`\r${prefix}${actionText} ${detailText}`);
}

/**
 * Show tool execution in Gemini CLI style
 * @param {string} toolName - Name of the tool
 * @param {Object} args - Tool arguments
 */
export function showToolExecution(toolName, args) {
    // Convert tool name to human-readable action
    const action = getHumanReadableAction(toolName, args);
    console.log();
    console.log(colors.info('  ◆ ') + colors.white(action));
}

/**
 * Convert tool name to human-readable action
 */
function getHumanReadableAction(toolName, args) {
    const actions = {
        'run_command': `Running command: ${chalk.cyan(args?.command?.slice(0, 50) || '...')}`,
        'run_powershell_script': 'Executing PowerShell script...',
        'create_file': `Creating file: ${chalk.cyan(args?.path || '...')}`,
        'read_file': `Reading file: ${chalk.cyan(args?.path || '...')}`,
        'write_file': `Writing to file: ${chalk.cyan(args?.path || '...')}`,
        'list_directory': `Listing directory: ${chalk.cyan(args?.path || '...')}`,
        'search_files': `Searching for: ${chalk.cyan(args?.pattern || '...')}`,
        'delete_file': `Deleting: ${chalk.cyan(args?.path || '...')}`,
        'get_file_info': `Getting file info: ${chalk.cyan(args?.path || '...')}`,
        'get_cpu_usage': 'Checking CPU usage...',
        'get_memory_usage': 'Checking memory usage...',
        'get_disk_usage': 'Checking disk usage...',
        'get_running_processes': 'Getting running processes...',
        'get_system_info': 'Getting system information...',
        'analyze_performance': 'Analyzing system performance...',
        'get_network_info': 'Getting network information...',
        'web_search': `Searching the web for: ${chalk.cyan(`"${args?.query || '...'}"`)}`,
        'web_fetch': `Fetching: ${chalk.cyan(args?.url || '...')}`,
        'research_topic': `Researching in-depth: ${chalk.cyan(`"${args?.topic || '...'}"`,)} (fetching multiple sources)`,
        'deep_research': `🔬 Deep Research: ${chalk.cyan(`"${args?.query || '...'}"`)} [${args?.depth || 'standard'} depth]`,
        'save_report': `Saving report: ${chalk.cyan(args?.path || '...')}`,
        'create_summary': 'Creating summary...',
        'create_table': 'Creating table...',
        'append_to_document': `Appending to: ${chalk.cyan(args?.path || '...')}`,
        // Context tools
        'get_current_datetime': 'Getting current date and time...',
        'get_current_context': 'Getting current context...',
        'check_latest_version': `Checking latest version of: ${chalk.cyan(args?.name || '...')}`,
        'calculate_time_difference': 'Calculating time difference...',
        'get_timezone_time': `Getting time in: ${chalk.cyan(args?.timezone || '...')}`,
        'set_reminder': 'Setting reminder...',
        'list_reminders': 'Listing reminders...',
    };

    return actions[toolName] || `Executing: ${toolName}`;
}

/**
 * Show thinking indicator
 * @param {string} text - Thinking text (optional, for extended thinking)
 */
export function showThinking(text = '') {
    if (text) {
        // Show abbreviated thinking
        const abbreviated = text.length > 100 ? text.slice(0, 100) + '...' : text;
        console.log(colors.dim(`  💭 ${abbreviated}`));
    }
}

/**
 * Show the waiting/simmering indicator
 */
export function showSimmering() {
    console.log();
    console.log(colors.accent('  ✦ ') + colors.dim('Thinking...'));
}

/**
 * Format Markdown content for terminal display
 * @param {string} content - Markdown content
 * @returns {string} - Formatted content
 */
function formatMarkdown(content) {
    let result = content;

    // Headers with better spacing and visual hierarchy
    result = result.replace(/^### (.+)$/gm, (_, text) => '\n' + chalk.bold.cyan(`   ▸ ${text}`) + '\n');
    result = result.replace(/^## (.+)$/gm, (_, text) => '\n' + chalk.bold.hex('#f7931e')(`  ═ ${text}`) + '\n' + chalk.dim('  ' + '─'.repeat(Math.min(text.length + 4, 50))) + '\n');
    result = result.replace(/^# (.+)$/gm, (_, text) => '\n' + chalk.bold.white(`  ${text}`) + '\n' + chalk.dim('  ' + '═'.repeat(Math.min(text.length, 50))) + '\n');

    // Bold with better contrast
    result = result.replace(/\*\*(.+?)\*\*/g, (_, text) => chalk.bold.hex('#00d9ff')(text));

    // Inline code with background effect
    result = result.replace(/`([^`]+)`/g, (_, code) => chalk.bgHex('#1a1a1a').cyan(` ${code} `));

    // Code blocks with better borders
    result = result.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
        const lines = code.trim().split('\n');
        const formattedLines = lines.map(line => chalk.dim('  │ ') + chalk.green(line));
        const langLabel = lang ? chalk.cyan(lang) : chalk.dim('code');
        return '\n' + chalk.dim('  ┌─[ ') + langLabel + chalk.dim(' ]─') + '\n' + formattedLines.join('\n') + '\n' + chalk.dim('  └─────────') + '\n';
    });

    // Bullets with better spacing  
    result = result.replace(/^- (.+)$/gm, (_, text) => chalk.hex('#00d9ff')('  • ') + text);
    result = result.replace(/^\* (.+)$/gm, (_, text) => chalk.hex('#00d9ff')('  • ') + text);

    // Numbered lists with colored numbers
    result = result.replace(/^(\d+)\. (.+)$/gm, (_, num, text) => chalk.hex('#00d9ff')(`  ${num}. `) + text);

    // Horizontal rules with better style
    result = result.replace(/^---$/gm, '\n' + chalk.dim('  ' + '─'.repeat(55)) + '\n');

    // Links with better visibility
    result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, url) => chalk.bold.cyan(text) + chalk.dim(` → ${url.slice(0, 50)}${url.length > 50 ? '...' : ''}`));

    // Blockquotes (simulated collapsible sections)
    result = result.replace(/^> (.+)$/gm, (_, text) => chalk.dim('  ┃ ') + chalk.italic(text));

    // Tables (basic support)
    result = result.replace(/^\|(.+)\|$/gm, (match) => {
        return chalk.dim('  ') + match.split('|').map(cell => cell.trim()).filter(Boolean).join(chalk.dim(' │ '));
    });

    return result;
}

/**
 * Show AI response with Markdown formatting
 * @param {string} content - The response content
 */
export function showResponse(content) {
    console.log();

    // Format Markdown
    const formatted = formatMarkdown(content);

    // Add slight indent to response
    const lines = formatted.split('\n');
    for (const line of lines) {
        // Skip extra indentation for already-formatted lines
        if (line.startsWith('  ')) {
            console.log(line);
        } else {
            console.log('  ' + line);
        }
    }
    console.log();
}

/**
 * Show error
 * @param {string} message - Error message
 */
export function showError(message) {
    console.log();
    console.log(colors.error('  ✗ ') + colors.error(message));
    console.log();
}

/**
 * Show success
 * @param {string} message - Success message
 */
export function showSuccess(message) {
    console.log(colors.success('  ✓ ') + colors.white(message));
}

/**
 * Show info
 * @param {string} message - Info message
 */
export function showInfo(message) {
    console.log(colors.info('  ℹ ') + colors.dim(message));
}

/**
 * Get the prompt string
 */
export function getPrompt() {
    return colors.white('  > ');
}

/**
 * Show a horizontal divider
 */
export function showDivider() {
    console.log(colors.muted('  ─────────────────────────────────────────────────────────────'));
}

/**
 * Clear the current line
 */
export function clearLine() {
    process.stdout.write('\r\x1b[K');
}

/**
 * Show welcome code block (like Claude Code)
 */
export function showWelcomeCode() {
    console.log();
    console.log(colors.dim('  while(curious) {'));
    console.log(colors.dim('      question_everything();'));
    console.log(colors.dim('      dig_deeper();'));
    console.log(colors.dim('      connect_dots(unexpected);'));
    console.log();
    console.log(colors.dim('      if (stuck) {'));
    console.log(colors.accent('          keep_thinking();'));
    console.log(colors.dim('      }'));
    console.log(colors.dim('  }'));
    console.log();
}

/**
 * Show a progress bar
 * @param {number} current - Current value
 * @param {number} total - Total value
 * @param {string} label - Label for the progress
 */
export function showProgress(current, total, label = '') {
    const percentage = Math.round((current / total) * 100);
    const barWidth = 30;
    const filled = Math.round(barWidth * (current / total));
    const empty = barWidth - filled;

    const bar = colors.success('█'.repeat(filled)) + colors.dim('░'.repeat(empty));
    const text = colors.dim(`  ${label} `) + bar + colors.dim(` ${percentage}%`);

    process.stdout.write(`\r${text}`);
    if (current === total) console.log();
}

/**
 * Show a section header (for reports)
 * @param {string} title - Section title
 * @param {string} icon - Optional icon
 */
export function showSection(title, icon = '◆') {
    console.log();
    console.log(colors.accent(`  ${icon} `) + colors.bold.white(title));
    console.log(colors.dim('  ' + '─'.repeat(50)));
}

/**
 * Show a key-value pair
 * @param {string} key - Key
 * @param {string} value - Value
 */
export function showKeyValue(key, value) {
    console.log(colors.dim(`  ${key}: `) + colors.white(value));
}

/**
 * Show a confidence badge
 * @param {number} score - Confidence score (0-100)
 */
export function showConfidence(score) {
    let color, label;
    if (score >= 80) { color = colors.success; label = 'HIGH'; }
    else if (score >= 50) { color = colors.info; label = 'MEDIUM'; }
    else { color = colors.error; label = 'LOW'; }

    console.log(colors.dim('  Confidence: ') + color(`${score}% (${label})`));
}

/**
 * Show a citation
 * @param {number} index - Citation index
 * @param {string} title - Source title
 * @param {string} url - Source URL
 */
export function showCitation(index, title, url) {
    console.log(colors.dim(`  [${index}] `) + colors.cyan(title.slice(0, 60)));
    console.log(colors.dim(`      ${url.slice(0, 70)}`));
}

export {
    chalk,
    gradient,
    colors,
    bannerGradient,
    accentGradient,
    successGradient
};
