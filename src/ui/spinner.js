/**
 * Spinner Utilities
 * Beautiful loading animations for long operations
 */

import ora from 'ora';
import { colors } from './formatter.js';

let currentSpinner = null;

/**
 * Start a spinner
 * @param {string} text - Loading text
 * @param {string} spinnerType - Spinner type (dots, line, etc.)
 */
export function startSpinner(text, spinnerType = 'dots') {
    if (currentSpinner) {
        currentSpinner.stop();
    }

    currentSpinner = ora({
        text: colors.dim(text),
        spinner: spinnerType,
        color: 'cyan',
        indent: 2
    }).start();

    return currentSpinner;
}

/**
 * Update spinner text
 * @param {string} text - New text
 */
export function updateSpinner(text) {
    if (currentSpinner) {
        currentSpinner.text = colors.dim(text);
    }
}

/**
 * Stop spinner with success
 * @param {string} text - Success message
 */
export function succeedSpinner(text) {
    if (currentSpinner) {
        currentSpinner.succeed(colors.success(text));
        currentSpinner = null;
    }
}

/**
 * Stop spinner with failure
 * @param {string} text - Failure message
 */
export function failSpinner(text) {
    if (currentSpinner) {
        currentSpinner.fail(colors.error(text));
        currentSpinner = null;
    }
}

/**
 * Stop spinner with info
 * @param {string} text - Info message
 */
export function infoSpinner(text) {
    if (currentSpinner) {
        currentSpinner.info(colors.info(text));
        currentSpinner = null;
    }
}

/**
 * Stop spinner without message
 */
export function stopSpinner() {
    if (currentSpinner) {
        currentSpinner.stop();
        currentSpinner = null;
    }
}

/**
 * Get current spinner instance
 */
export function getCurrentSpinner() {
    return currentSpinner;
}

export default {
    startSpinner,
    updateSpinner,
    succeedSpinner,
    failSpinner,
    infoSpinner,
    stopSpinner,
    getCurrentSpinner
};
