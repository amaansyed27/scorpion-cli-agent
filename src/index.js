#!/usr/bin/env node

/**
 * Scorpion CLI
 * An agentic AI assistant powered by Ollama
 * Inspired by Claude Code & Gemini CLI
 */

import { program } from 'commander';
import { startREPL } from './ui/repl.js';
import { query } from './agent.js';
import { isModelAvailable, DEFAULT_MODEL } from './ollama.js';
import {
    displayBanner,
    showError,
    showSuccess,
    showInfo,
    colors
} from './ui/formatter.js';

// Package info
const VERSION = '0.1.1';
const NAME = 'scorpion';

// Setup CLI
program
    .name(NAME)
    .version(VERSION)
    .description('🦂 Scorpion - Agentic AI CLI powered by Ollama')
    .option('-m, --model <model>', 'Ollama model to use')
    .option('-q, --query <query>', 'Run a single query and exit')
    .option('--think', 'Show AI thinking process')
    .option('--check', 'Check Ollama connection and exit');

program.parse();

const options = program.opts();

// Main entry point
async function main() {
    const selectedModel = options.model || DEFAULT_MODEL;

    // Handle --check flag
    if (options.check) {
        showInfo('Checking Ollama connection...');
        try {
            const available = await isModelAvailable(selectedModel);
            if (available) {
                showSuccess(`Ollama is running. Model '${selectedModel}' is available.`);
            } else {
                showError(`Model '${selectedModel}' not found.`);
                showInfo(`Run: ollama pull ${selectedModel}`);
            }
        } catch (error) {
            showError('Could not connect to Ollama.');
            showInfo('Make sure Ollama is running: ollama serve');
        }
        process.exit(0);
    }

    // Handle --query flag (single query mode)
    if (options.query) {
        try {
            console.log(colors.dim('\n  Processing...\n'));

            const result = await query(options.query);

            console.log(colors.white('  ' + result.content.split('\n').join('\n  ')));
            console.log();
            process.exit(0);
        } catch (error) {
            showError(error.message);
            process.exit(1);
        }
    }

    // Start interactive REPL
    await startREPL({
        model: options.model,
        showThinkingOutput: options.think || false,
    });
}

// Run
main().catch((error) => {
    showError(error.message);
    process.exit(1);
});
