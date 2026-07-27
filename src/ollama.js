/**
 * Ollama Client Wrapper
 * Provides a centralized interface to the Ollama API
 */

import { Ollama } from 'ollama';

// Default configuration
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'qwen3.5:0.8b';
const DEFAULT_HOST = 'http://localhost:11434';

// Create the Ollama client
const ollama = new Ollama({ host: process.env.OLLAMA_HOST || DEFAULT_HOST });

/**
 * Chat with the model using tool calling
 * @param {Object} options - Chat options
 * @param {string} options.model - Model name
 * @param {Array} options.messages - Conversation messages
 * @param {Array} options.tools - Available tools
 * @param {boolean} options.think - Enable thinking mode
 * @param {boolean} options.stream - Enable streaming
 * @returns {Promise} - Chat response or async iterator for streaming
 */
export async function chat(options) {
  const {
    model = DEFAULT_MODEL,
    messages,
    tools = [],
    think = true,
    stream = false,
    format = undefined,
  } = options;

  return ollama.chat({
    model,
    messages,
    tools: tools.length > 0 ? tools : undefined,
    think,
    stream,
    format,
  });
}

/**
 * Web search using Ollama's API (requires API key)
 * @param {string} query - Search query
 * @param {number} maxResults - Maximum results to return
 * @returns {Promise<Array>} - Search results
 */
export async function webSearch(query, maxResults = 5) {
  try {
    const results = await ollama.webSearch({ query, max_results: maxResults });
    return results;
  } catch (error) {
    // Fallback: return error message if API key not set
    if (error.message?.includes('unauthorized') || error.message?.includes('API key')) {
      return {
        error: 'Web search requires OLLAMA_API_KEY. Set it in your environment.',
        suggestion: 'Get your API key at https://ollama.com/settings/keys'
      };
    }
    throw error;
  }
}

/**
 * Fetch a web page using Ollama's API
 * @param {string} url - URL to fetch
 * @returns {Promise<Object>} - Page content
 */
export async function webFetch(url) {
  try {
    const result = await ollama.webFetch({ url });
    return result;
  } catch (error) {
    if (error.message?.includes('unauthorized') || error.message?.includes('API key')) {
      return {
        error: 'Web fetch requires OLLAMA_API_KEY. Set it in your environment.',
        suggestion: 'Get your API key at https://ollama.com/settings/keys'
      };
    }
    throw error;
  }
}

/**
 * List available models
 * @returns {Promise<Array>} - List of models
 */
export async function listModels() {
  const response = await ollama.list();
  return response.models;
}

/**
 * Check if a model is available
 * @param {string} modelName - Model to check
 * @returns {Promise<boolean>} - True if available
 */
export async function isModelAvailable(modelName = DEFAULT_MODEL) {
    try {
        const models = await listModels();
        return models.some((m) => m.name === modelName || (
            !modelName.includes(':') && m.name.split(':')[0] === modelName
        ));
  } catch (error) {
    return false;
  }
}

/**
 * Pull a model if not available
 * @param {string} modelName - Model to pull
 * @param {Function} onProgress - Progress callback
 */
export async function pullModel(modelName, onProgress) {
  const stream = await ollama.pull({ model: modelName, stream: true });
  for await (const part of stream) {
    if (onProgress) {
      onProgress(part);
    }
  }
}

export { ollama, DEFAULT_MODEL, DEFAULT_HOST };
