/**
 * Export Utilities
 * Save research reports and data to files
 */

import fs from 'fs/promises';
import path from 'path';
import { colors } from './formatter.js';

/**
 * Save content to a file
 * @param {string} content - Content to save
 * @param {string} filename - Filename (will be placed in reports/ directory)
 * @param {string} format - Format (md, txt, json)
 */
export async function saveToFile(content, filename, format = 'md') {
    try {
        // Create reports directory if it doesn't exist
        const reportsDir = path.join(process.cwd(), 'reports');
        try {
            await fs.access(reportsDir);
        } catch {
            await fs.mkdir(reportsDir, { recursive: true });
        }

        // Generate filename with timestamp if not provided
        if (!filename) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
            filename = `research-${timestamp}.${format}`;
        }

        // Ensure extension
        if (!filename.endsWith(`.${format}`)) {
            filename += `.${format}`;
        }

        const filepath = path.join(reportsDir, filename);
        await fs.writeFile(filepath, content, 'utf-8');

        console.log();
        console.log(colors.success(`  ✓ Saved to: ${filepath}`));
        console.log();

        return filepath;
    } catch (error) {
        console.log();
        console.log(colors.error(`  ✗ Failed to save file: ${error.message}`));
        console.log();
        return null;
    }
}

/**
 * Save research report
 * @param {Object} report - Report data
 * @param {string} filename - Optional custom filename
 */
export async function saveResearchReport(report, filename = null) {
    if (typeof report === 'string') {
        // Already formatted as markdown
        return saveToFile(report, filename, 'md');
    }

    // Convert object to markdown
    let markdown = `# ${report.title || 'Research Report'}\n\n`;

    if (report.metadata) {
        markdown += `**Generated:** ${report.metadata.generatedAt || new Date().toISOString()}\n`;
        markdown += `**Confidence:** ${report.metadata.confidenceScore || 'N/A'}%\n`;
        markdown += `**Sources:** ${report.metadata.totalSources || 0}\n\n`;
        markdown += `---\n\n`;
    }

    if (report.sections && Array.isArray(report.sections)) {
        for (const section of report.sections) {
            markdown += `## ${section.title}\n\n`;
            markdown += section.content + '\n\n';
        }
    }

    if (report.citations && Array.isArray(report.citations)) {
        markdown += `---\n\n## Sources\n\n`;
        for (const cite of report.citations) {
            markdown += `[${cite.index}] ${cite.title}\n`;
            markdown += `    ${cite.url}\n\n`;
        }
    }

    return saveToFile(markdown, filename, 'md');
}

/**
 * Save JSON data
 * @param {Object} data - Data to save
 * @param {string} filename - Optional custom filename
 */
export async function saveJSON(data, filename = null) {
    const json = JSON.stringify(data, null, 2);
    return saveToFile(json, filename, 'json');
}

/**
 * List saved reports
 */
export async function listReports() {
    try {
        const reportsDir = path.join(process.cwd(), 'reports');
        const files = await fs.readdir(reportsDir);

        if (files.length === 0) {
            console.log(colors.dim('  No saved reports'));
            return [];
        }

        console.log();
        console.log(colors.bold.white('  Saved Reports:'));
        console.log(colors.dim('  ─'.repeat(30)));

        for (const file of files) {
            const filepath = path.join(reportsDir, file);
            const stats = await fs.stat(filepath);
            const sizeKB = (stats.size / 1024).toFixed(1);
            const modified = stats.mtime.toLocaleDateString();

            console.log(colors.dim('  • ') + colors.cyan(file) + colors.dim(` (${sizeKB}KB, ${modified})`));
        }
        console.log();

        return files;
    } catch (error) {
        console.log(colors.dim('  No reports directory'));
        return [];
    }
}

export default {
    saveToFile,
    saveResearchReport,
    saveJSON,
    listReports
};
