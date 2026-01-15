/**
 * Tool Registry
 * Manages all available tools and their schemas for the agent
 */

import * as shellTools from './tools/shell.js';
import * as filesystemTools from './tools/filesystem.js';
import * as systemTools from './tools/system.js';
import * as webTools from './tools/web.js';
import * as documentTools from './tools/documents.js';
import * as contextTools from './tools/context.js';
import * as deepResearchTools from './tools/deep-research.js';

// Collect all tool modules
const toolModules = {
    ...shellTools,
    ...filesystemTools,
    ...systemTools,
    ...webTools,
    ...documentTools,
    ...contextTools,
    ...deepResearchTools,
};

/**
 * Get all tool schemas for Ollama API
 * @returns {Array} - Array of tool definitions
 */
export function getAllToolSchemas() {
    return Object.values(toolModules)
        .filter(tool => tool.schema)
        .map(tool => tool.schema);
}

/**
 * Get a tool executor by name
 * @param {string} name - Tool name
 * @returns {Function|null} - Tool executor function
 */
export function getToolExecutor(name) {
    const tool = Object.values(toolModules).find(t => t.schema?.function?.name === name);
    return tool?.execute || null;
}

/**
 * Execute a tool by name with arguments
 * @param {string} name - Tool name
 * @param {Object} args - Tool arguments
 * @returns {Promise<string>} - Tool result as string
 */
export async function executeTool(name, args) {
    const executor = getToolExecutor(name);
    if (!executor) {
        return JSON.stringify({ error: `Tool '${name}' not found` });
    }

    try {
        const result = await executor(args);
        return typeof result === 'string' ? result : JSON.stringify(result, null, 2);
    } catch (error) {
        return JSON.stringify({
            error: error.message,
            tool: name,
            args
        });
    }
}

/**
 * Get tool categories for help display
 * @returns {Object} - Tools grouped by category
 */
export function getToolsByCategory() {
    return {
        'Shell': Object.values(shellTools).filter(t => t.schema).map(t => ({
            name: t.schema.function.name,
            description: t.schema.function.description
        })),
        'File System': Object.values(filesystemTools).filter(t => t.schema).map(t => ({
            name: t.schema.function.name,
            description: t.schema.function.description
        })),
        'System': Object.values(systemTools).filter(t => t.schema).map(t => ({
            name: t.schema.function.name,
            description: t.schema.function.description
        })),
        'Web': Object.values(webTools).filter(t => t.schema).map(t => ({
            name: t.schema.function.name,
            description: t.schema.function.description
        })),
        'Documents': Object.values(documentTools).filter(t => t.schema).map(t => ({
            name: t.schema.function.name,
            description: t.schema.function.description
        })),
        'Context': Object.values(contextTools).filter(t => t.schema).map(t => ({
            name: t.schema.function.name,
            description: t.schema.function.description
        })),
        'Deep Research': Object.values(deepResearchTools).filter(t => t.schema).map(t => ({
            name: t.schema.function.name,
            description: t.schema.function.description
        })),
    };
}

/**
 * Get total number of available tools
 * @returns {number} - Tool count
 */
export function getToolCount() {
    return getAllToolSchemas().length;
}
