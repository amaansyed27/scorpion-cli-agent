/**
 * Document Tools
 * Create summaries, reports, and documents
 */

import fs from 'fs/promises';
import path from 'path';

// Tool: save_report
export const saveReport = {
    schema: {
        type: 'function',
        function: {
            name: 'save_report',
            description: 'Save a report or document to a file. Use this to create text files, markdown documents, or reports with structured content.',
            parameters: {
                type: 'object',
                required: ['title', 'content', 'path'],
                properties: {
                    title: {
                        type: 'string',
                        description: 'Title of the report'
                    },
                    content: {
                        type: 'string',
                        description: 'Main content of the report'
                    },
                    path: {
                        type: 'string',
                        description: 'File path to save the report (e.g., "report.txt" or "C:/Users/Amaan/report.md")'
                    },
                    format: {
                        type: 'string',
                        enum: ['txt', 'md'],
                        description: 'Output format (default: based on file extension)'
                    },
                    include_timestamp: {
                        type: 'boolean',
                        description: 'Include generation timestamp (default: true)'
                    }
                }
            }
        }
    },
    execute: async ({ title, content, path: filePath, format, include_timestamp = true }) => {
        try {
            const absolutePath = path.resolve(filePath);
            const ext = format || path.extname(absolutePath).slice(1) || 'txt';
            const isMarkdown = ext === 'md';

            let fileContent = '';

            if (isMarkdown) {
                fileContent = `# ${title}\n\n`;
                if (include_timestamp) {
                    fileContent += `*Generated: ${new Date().toLocaleString()}*\n\n---\n\n`;
                }
                fileContent += content;
            } else {
                fileContent = `${title}\n${'='.repeat(title.length)}\n\n`;
                if (include_timestamp) {
                    fileContent += `Generated: ${new Date().toLocaleString()}\n\n`;
                }
                fileContent += content;
            }

            await fs.mkdir(path.dirname(absolutePath), { recursive: true });
            await fs.writeFile(absolutePath, fileContent, 'utf-8');

            const stats = await fs.stat(absolutePath);

            return JSON.stringify({
                success: true,
                path: absolutePath,
                title,
                format: ext,
                size: formatBytes(stats.size),
                message: `Report saved successfully to ${absolutePath}`
            });
        } catch (error) {
            return JSON.stringify({ success: false, error: error.message });
        }
    }
};

// Tool: create_summary
export const createSummary = {
    schema: {
        type: 'function',
        function: {
            name: 'create_summary',
            description: 'Format content as a structured summary. Returns formatted text that can be displayed or saved.',
            parameters: {
                type: 'object',
                required: ['content'],
                properties: {
                    content: {
                        type: 'string',
                        description: 'Content to summarize/format'
                    },
                    format: {
                        type: 'string',
                        enum: ['text', 'markdown', 'bullets'],
                        description: 'Output format (default: text)'
                    },
                    title: {
                        type: 'string',
                        description: 'Optional title for the summary'
                    }
                }
            }
        }
    },
    execute: async ({ content, format = 'text', title }) => {
        try {
            let formatted = '';

            switch (format) {
                case 'markdown':
                    if (title) {
                        formatted = `## ${title}\n\n${content}`;
                    } else {
                        formatted = content;
                    }
                    break;

                case 'bullets':
                    const lines = content.split('\n').filter(l => l.trim());
                    if (title) {
                        formatted = `${title}:\n`;
                    }
                    formatted += lines.map(l => `• ${l.trim()}`).join('\n');
                    break;

                case 'text':
                default:
                    if (title) {
                        formatted = `${title}\n${'-'.repeat(title.length)}\n\n${content}`;
                    } else {
                        formatted = content;
                    }
                    break;
            }

            return JSON.stringify({
                success: true,
                format,
                summary: formatted,
                characterCount: formatted.length
            });
        } catch (error) {
            return JSON.stringify({ success: false, error: error.message });
        }
    }
};

// Tool: create_table
export const createTable = {
    schema: {
        type: 'function',
        function: {
            name: 'create_table',
            description: 'Create a formatted table from data. Useful for presenting structured information.',
            parameters: {
                type: 'object',
                required: ['headers', 'rows'],
                properties: {
                    headers: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Column headers'
                    },
                    rows: {
                        type: 'array',
                        items: {
                            type: 'array',
                            items: { type: 'string' }
                        },
                        description: 'Data rows (array of arrays)'
                    },
                    format: {
                        type: 'string',
                        enum: ['markdown', 'text'],
                        description: 'Output format (default: markdown)'
                    }
                }
            }
        }
    },
    execute: async ({ headers, rows, format = 'markdown' }) => {
        try {
            let table = '';

            if (format === 'markdown') {
                // Markdown table
                table = '| ' + headers.join(' | ') + ' |\n';
                table += '| ' + headers.map(() => '---').join(' | ') + ' |\n';
                for (const row of rows) {
                    table += '| ' + row.join(' | ') + ' |\n';
                }
            } else {
                // Text table
                const widths = headers.map((h, i) => {
                    const maxRowWidth = Math.max(...rows.map(r => String(r[i] || '').length));
                    return Math.max(h.length, maxRowWidth);
                });

                const separator = '+' + widths.map(w => '-'.repeat(w + 2)).join('+') + '+';

                table = separator + '\n';
                table += '| ' + headers.map((h, i) => h.padEnd(widths[i])).join(' | ') + ' |\n';
                table += separator + '\n';

                for (const row of rows) {
                    table += '| ' + row.map((c, i) => String(c || '').padEnd(widths[i])).join(' | ') + ' |\n';
                }
                table += separator;
            }

            return JSON.stringify({
                success: true,
                format,
                table,
                rowCount: rows.length,
                columnCount: headers.length
            });
        } catch (error) {
            return JSON.stringify({ success: false, error: error.message });
        }
    }
};

// Tool: append_to_document
export const appendToDocument = {
    schema: {
        type: 'function',
        function: {
            name: 'append_to_document',
            description: 'Append content to an existing document or create it if it does not exist.',
            parameters: {
                type: 'object',
                required: ['path', 'content'],
                properties: {
                    path: {
                        type: 'string',
                        description: 'Path to the document'
                    },
                    content: {
                        type: 'string',
                        description: 'Content to append'
                    },
                    add_separator: {
                        type: 'boolean',
                        description: 'Add a separator line before the content (default: true)'
                    }
                }
            }
        }
    },
    execute: async ({ path: filePath, content, add_separator = true }) => {
        try {
            const absolutePath = path.resolve(filePath);

            let existingContent = '';
            try {
                existingContent = await fs.readFile(absolutePath, 'utf-8');
            } catch (e) {
                // File doesn't exist, will be created
            }

            let newContent = content;
            if (existingContent && add_separator) {
                newContent = '\n\n---\n\n' + content;
            } else if (existingContent) {
                newContent = '\n\n' + content;
            }

            await fs.appendFile(absolutePath, newContent, 'utf-8');

            return JSON.stringify({
                success: true,
                path: absolutePath,
                message: existingContent ? 'Content appended' : 'Document created',
                appendedLength: newContent.length
            });
        } catch (error) {
            return JSON.stringify({ success: false, error: error.message });
        }
    }
};

// Helper function
function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
