/**
 * Image Display Utility
 * Supports iTerm2 and Kitty terminal protocols
 */

import fs from 'fs/promises';
import path from 'path';
import { colors } from './formatter.js';

/**
 * Detect terminal type
 */
function detectTerminal() {
    const term = process.env.TERM_PROGRAM || process.env.TERM || '';

    if (term.includes('iTerm')) return 'iterm2';
    if (term.includes('kitty') || process.env.KITTY_WINDOW_ID) return 'kitty';
    if (term.includes('wezterm')) return 'wezterm';

    return 'unsupported';
}

/**
 * Display image in iTerm2
 * @param {Buffer} imageBuffer - Image buffer
 * @param {Object} options - Display options
 */
function displayImageITerm2(imageBuffer, options = {}) {
    const { width = 'auto', height = 'auto', inline = true } = options;

    const base64 = imageBuffer.toString('base64');
    const escape = '\x1B]';
    const bell = '\x07';

    // iTerm2 inline image protocol
    const params = [
        'inline=1',
        `width=${width}`,
        `height=${height}`,
        'preserveAspectRatio=1'
    ].join(';');

    process.stdout.write(`${escape}1337;File=${params}:${base64}${bell}\n`);
}

/**
 * Display image in Kitty
 * @param {Buffer} imageBuffer - Image buffer
 * @param {Object} options - Display options
 */
function displayImageKitty(imageBuffer, options = {}) {
    const { width = 80, height = 24 } = options;

    const base64 = imageBuffer.toString('base64');
    const chunks = base64.match(/.{1,4096}/g) || [];

    // Kitty graphics protocol
    for (let i = 0; i < chunks.length; i++) {
        const isLast = i === chunks.length - 1;
        const action = i === 0 ? 'T' : 't';
        const more = isLast ? 0 : 1;

        process.stdout.write(`\x1B_G${action}=d,f=100,m=${more};${chunks[i]}\x1B\\\n`);
    }
}

/**
 * Display an image file
 * @param {string} imagePath - Path to image file
 * @param {Object} options - Display options
 */
export async function displayImage(imagePath, options = {}) {
    try {
        const terminal = detectTerminal();

        if (terminal === 'unsupported') {
            console.log(colors.dim(`  📷 Image: ${path.basename(imagePath)}`));
            console.log(colors.dim(`     (Terminal doesn't support inline images)`));
            console.log(colors.dim(`     Path: ${imagePath}`));
            return false;
        }

        // Read image file
        const imageBuffer = await fs.readFile(imagePath);

        console.log();
        console.log(colors.dim(`  📷 ${path.basename(imagePath)}`));
        console.log();

        // Display based on terminal type
        if (terminal === 'iterm2') {
            displayImageITerm2(imageBuffer, options);
        } else if (terminal === 'kitty' || terminal === 'wezterm') {
            displayImageKitty(imageBuffer, options);
        }

        console.log();
        return true;
    } catch (error) {
        console.log(colors.error(`  ✗ Failed to display image: ${error.message}`));
        return false;
    }
}

/**
 * Check if terminal supports images
 */
export function supportsImages() {
    return detectTerminal() !== 'unsupported';
}

/**
 * Display image from URL (download and display)
 * @param {string} url - Image URL
 * @param {Object} options - Display options
 */
export async function displayImageFromURL(url, options = {}) {
    try {
        const response = await fetch(url);
        const buffer = Buffer.from(await response.arrayBuffer());

        const terminal = detectTerminal();

        if (terminal === 'unsupported') {
            console.log(colors.dim(`  📷 Image: ${url}`));
            console.log(colors.dim(`     (Terminal doesn't support inline images)`));
            return false;
        }

        console.log();
        console.log(colors.dim(`  📷 Image from: ${url.slice(0, 60)}...`));
        console.log();

        if (terminal === 'iterm2') {
            displayImageITerm2(buffer, options);
        } else if (terminal === 'kitty' || terminal === 'wezterm') {
            displayImageKitty(buffer, options);
        }

        console.log();
        return true;
    } catch (error) {
        console.log(colors.error(`  ✗ Failed to display image: ${error.message}`));
        return false;
    }
}

export default {
    displayImage,
    displayImageFromURL,
    supportsImages,
    detectTerminal
};
