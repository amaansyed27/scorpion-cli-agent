/**
 * Filesystem Tools
 * File and directory operations
 */

import fs from 'fs/promises';
import path from 'path';
import { glob } from 'fs/promises';

// Tool: create_file
export const createFile = {
    schema: {
        type: 'function',
        function: {
            name: 'create_file',
            description: 'Create a new file with the specified content. Creates parent directories if they do not exist.',
            parameters: {
                type: 'object',
                required: ['path', 'content'],
                properties: {
                    path: {
                        type: 'string',
                        description: 'Absolute or relative path for the new file'
                    },
                    content: {
                        type: 'string',
                        description: 'Content to write to the file'
                    }
                }
            }
        }
    },
    execute: async ({ path: filePath, content }) => {
        try {
            const absolutePath = path.resolve(filePath);
            await fs.mkdir(path.dirname(absolutePath), { recursive: true });
            await fs.writeFile(absolutePath, content, 'utf-8');

            return JSON.stringify({
                success: true,
                path: absolutePath,
                message: `File created successfully at ${absolutePath}`
            });
        } catch (error) {
            return JSON.stringify({ success: false, error: error.message });
        }
    }
};

// Tool: read_file
export const readFile = {
    schema: {
        type: 'function',
        function: {
            name: 'read_file',
            description: 'Read the contents of a file',
            parameters: {
                type: 'object',
                required: ['path'],
                properties: {
                    path: {
                        type: 'string',
                        description: 'Path to the file to read'
                    },
                    encoding: {
                        type: 'string',
                        description: 'File encoding (default: utf-8)'
                    }
                }
            }
        }
    },
    execute: async ({ path: filePath, encoding = 'utf-8' }) => {
        try {
            const absolutePath = path.resolve(filePath);
            const content = await fs.readFile(absolutePath, encoding);
            const stats = await fs.stat(absolutePath);

            return JSON.stringify({
                success: true,
                path: absolutePath,
                content,
                size: stats.size,
                modified: stats.mtime.toISOString()
            });
        } catch (error) {
            return JSON.stringify({ success: false, error: error.message });
        }
    }
};

// Tool: write_file
export const writeFile = {
    schema: {
        type: 'function',
        function: {
            name: 'write_file',
            description: 'Write or append content to a file',
            parameters: {
                type: 'object',
                required: ['path', 'content'],
                properties: {
                    path: {
                        type: 'string',
                        description: 'Path to the file'
                    },
                    content: {
                        type: 'string',
                        description: 'Content to write'
                    },
                    append: {
                        type: 'boolean',
                        description: 'If true, append to file instead of overwriting (default: false)'
                    }
                }
            }
        }
    },
    execute: async ({ path: filePath, content, append = false }) => {
        try {
            const absolutePath = path.resolve(filePath);

            if (append) {
                await fs.appendFile(absolutePath, content, 'utf-8');
            } else {
                await fs.writeFile(absolutePath, content, 'utf-8');
            }

            return JSON.stringify({
                success: true,
                path: absolutePath,
                message: append ? 'Content appended' : 'File written'
            });
        } catch (error) {
            return JSON.stringify({ success: false, error: error.message });
        }
    }
};

// Tool: list_directory
export const listDirectory = {
    schema: {
        type: 'function',
        function: {
            name: 'list_directory',
            description: 'List contents of a directory with file information',
            parameters: {
                type: 'object',
                required: ['path'],
                properties: {
                    path: {
                        type: 'string',
                        description: 'Directory path to list'
                    },
                    recursive: {
                        type: 'boolean',
                        description: 'If true, list recursively (default: false)'
                    },
                    limit: {
                        type: 'integer',
                        description: 'Maximum number of items to return (default: 100)'
                    }
                }
            }
        }
    },
    execute: async ({ path: dirPath, recursive = false, limit = 100 }) => {
        try {
            const absolutePath = path.resolve(dirPath);
            const items = [];

            async function listDir(dir, depth = 0) {
                if (items.length >= limit) return;

                const entries = await fs.readdir(dir, { withFileTypes: true });

                for (const entry of entries) {
                    if (items.length >= limit) break;

                    const fullPath = path.join(dir, entry.name);
                    const relativePath = path.relative(absolutePath, fullPath);

                    try {
                        const stats = await fs.stat(fullPath);
                        items.push({
                            name: entry.name,
                            path: relativePath || entry.name,
                            type: entry.isDirectory() ? 'directory' : 'file',
                            size: entry.isFile() ? stats.size : undefined,
                            modified: stats.mtime.toISOString()
                        });

                        if (recursive && entry.isDirectory() && depth < 5) {
                            await listDir(fullPath, depth + 1);
                        }
                    } catch (e) {
                        // Skip inaccessible items
                    }
                }
            }

            await listDir(absolutePath);

            return JSON.stringify({
                success: true,
                path: absolutePath,
                count: items.length,
                truncated: items.length >= limit,
                items
            });
        } catch (error) {
            return JSON.stringify({ success: false, error: error.message });
        }
    }
};

// Tool: search_files
export const searchFiles = {
    schema: {
        type: 'function',
        function: {
            name: 'search_files',
            description: 'Search for files by name pattern in a directory',
            parameters: {
                type: 'object',
                required: ['path', 'pattern'],
                properties: {
                    path: {
                        type: 'string',
                        description: 'Directory to search in'
                    },
                    pattern: {
                        type: 'string',
                        description: 'Search pattern (e.g., "*.txt", "report*", "**/*.js")'
                    },
                    limit: {
                        type: 'integer',
                        description: 'Maximum results (default: 50)'
                    }
                }
            }
        }
    },
    execute: async ({ path: searchPath, pattern, limit = 50 }) => {
        try {
            const absolutePath = path.resolve(searchPath);
            const results = [];

            // Simple recursive search
            async function searchDir(dir) {
                if (results.length >= limit) return;

                const entries = await fs.readdir(dir, { withFileTypes: true });

                for (const entry of entries) {
                    if (results.length >= limit) break;

                    const fullPath = path.join(dir, entry.name);

                    // Simple pattern matching
                    const regex = new RegExp(
                        pattern
                            .replace(/\./g, '\\.')
                            .replace(/\*/g, '.*')
                            .replace(/\?/g, '.'),
                        'i'
                    );

                    if (regex.test(entry.name)) {
                        try {
                            const stats = await fs.stat(fullPath);
                            results.push({
                                name: entry.name,
                                path: fullPath,
                                type: entry.isDirectory() ? 'directory' : 'file',
                                size: entry.isFile() ? stats.size : undefined
                            });
                        } catch (e) {
                            // Skip inaccessible
                        }
                    }

                    if (entry.isDirectory()) {
                        try {
                            await searchDir(fullPath);
                        } catch (e) {
                            // Skip inaccessible directories
                        }
                    }
                }
            }

            await searchDir(absolutePath);

            return JSON.stringify({
                success: true,
                pattern,
                searchPath: absolutePath,
                count: results.length,
                results
            });
        } catch (error) {
            return JSON.stringify({ success: false, error: error.message });
        }
    }
};

// Tool: delete_file
export const deleteFile = {
    schema: {
        type: 'function',
        function: {
            name: 'delete_file',
            description: 'Delete a file or empty directory',
            parameters: {
                type: 'object',
                required: ['path'],
                properties: {
                    path: {
                        type: 'string',
                        description: 'Path to the file or directory to delete'
                    },
                    recursive: {
                        type: 'boolean',
                        description: 'If true, delete directories recursively (use with caution)'
                    }
                }
            }
        }
    },
    execute: async ({ path: targetPath, recursive = false }) => {
        try {
            const absolutePath = path.resolve(targetPath);
            const stats = await fs.stat(absolutePath);

            if (stats.isDirectory()) {
                await fs.rm(absolutePath, { recursive });
            } else {
                await fs.unlink(absolutePath);
            }

            return JSON.stringify({
                success: true,
                path: absolutePath,
                message: `Deleted ${stats.isDirectory() ? 'directory' : 'file'}: ${absolutePath}`
            });
        } catch (error) {
            return JSON.stringify({ success: false, error: error.message });
        }
    }
};

// Tool: get_file_info
export const getFileInfo = {
    schema: {
        type: 'function',
        function: {
            name: 'get_file_info',
            description: 'Get detailed information about a file or directory',
            parameters: {
                type: 'object',
                required: ['path'],
                properties: {
                    path: {
                        type: 'string',
                        description: 'Path to the file or directory'
                    }
                }
            }
        }
    },
    execute: async ({ path: targetPath }) => {
        try {
            const absolutePath = path.resolve(targetPath);
            const stats = await fs.stat(absolutePath);

            return JSON.stringify({
                success: true,
                path: absolutePath,
                name: path.basename(absolutePath),
                type: stats.isDirectory() ? 'directory' : 'file',
                size: stats.size,
                sizeFormatted: formatBytes(stats.size),
                created: stats.birthtime.toISOString(),
                modified: stats.mtime.toISOString(),
                accessed: stats.atime.toISOString(),
                isReadOnly: !(stats.mode & 0o200)
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
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
