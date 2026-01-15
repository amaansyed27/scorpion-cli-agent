/**
 * Agent Core
 * Implements the agentic loop with tool calling and streaming
 */

import { chat, DEFAULT_MODEL } from './ollama.js';
import { getAllToolSchemas, executeTool } from './registry.js';

/**
 * Get current date/time for system prompt
 */
function getCurrentDateTime() {
    const now = new Date();
    return {
        date: now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        year: now.getFullYear(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
}

/**
 * Build system prompt with real-time context
 */
function buildSystemPrompt() {
    const dt = getCurrentDateTime();
    const currentYear = new Date().getFullYear();

    return `You are Scorpion, a helpful AI assistant. Current date: ${dt.date}

CRITICAL RULES:
1. Your knowledge is outdated (cutoff: mid-2023). For ANY current events, news, sports, or facts about people/companies/products, you MUST use web_search() first.
2. Search for anything mentioning ${currentYear - 1} or ${currentYear}, or keywords: "latest", "recent", "today", "current"
3. Answer from memory ONLY for: basic math, greetings, timeless concepts

MANDATORY: When answering sports/news, ALWAYS call web_search() before responding.

---

RESPONSE FORMAT - use this structure for EVERY answer:

## Main Topic

> Key Insight: One sentence summary

Your detailed explanation with **important terms** in bold and \`code\` for technical items.

- Key point 1
- Key point 2
- Key point 3

---

### Additional Context (if needed)

More details here.

---

FORMATTING RULES:
- ## for main sections
- ### for subsections  
- **bold** for names, key terms, numbers
- \`code\` for technical terms
- > for key insights/summaries
- Short paragraphs (2-3 sentences)
- Cite sources clearly

Be concise, organized, and always cite your sources.`;
}

/**
 * Run the agent loop
 * @param {string} userMessage - User's input message
 * @param {Object} options - Agent options
 * @param {Array} options.history - Conversation history
 * @param {Function} options.onThinking - Callback for thinking output
 * @param {Function} options.onContent - Callback for content output
 * @param {Function} options.onToolCall - Callback when tool is called
 * @param {Function} options.onToolResult - Callback with tool result
 * @param {string} options.model - Model to use
 * @returns {Object} - Final response and updated history
 */
export async function runAgent(userMessage, options = {}) {
    const {
        history = [],
        onThinking = () => { },
        onContent = () => { },
        onToolCall = () => { },
        onToolResult = () => { },
        model = DEFAULT_MODEL,
    } = options;

    // Build messages with dynamic system prompt (includes current date/time)
    const messages = [
        { role: 'system', content: buildSystemPrompt() },
        ...history,
        { role: 'user', content: userMessage }
    ];

    // Get all available tools
    const tools = getAllToolSchemas();

    let iterations = 0;
    const maxIterations = 10; // Safety limit

    while (iterations < maxIterations) {
        iterations++;

        // Call the model with streaming
        const stream = await chat({
            model,
            messages,
            tools,
            think: true,
            stream: true,
        });

        // Accumulate the response
        let thinking = '';
        let content = '';
        let toolCalls = [];
        let inThinking = false;

        for await (const chunk of stream) {
            // Handle thinking
            if (chunk.message?.thinking) {
                if (!inThinking) {
                    inThinking = true;
                }
                thinking += chunk.message.thinking;
                onThinking(chunk.message.thinking);
            }

            // Handle content
            if (chunk.message?.content) {
                if (inThinking) {
                    inThinking = false;
                }
                content += chunk.message.content;
                onContent(chunk.message.content);
            }

            // Handle tool calls
            if (chunk.message?.tool_calls) {
                toolCalls = chunk.message.tool_calls;
            }
        }

        // Add assistant message to history
        const assistantMessage = {
            role: 'assistant',
            content: content || undefined,
            thinking: thinking || undefined,
            tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
        };
        messages.push(assistantMessage);

        // If there are tool calls, execute them
        if (toolCalls.length > 0) {
            for (const call of toolCalls) {
                const toolName = call.function?.name;
                const toolArgs = call.function?.arguments || {};

                onToolCall({ name: toolName, args: toolArgs });

                // Execute the tool
                const result = await executeTool(toolName, toolArgs);

                onToolResult({ name: toolName, result });

                // Add tool result to messages
                messages.push({
                    role: 'tool',
                    tool_name: toolName,
                    content: result,
                });
            }
            // Continue the loop to let model process tool results
        } else {
            // No tool calls - agent is done
            break;
        }
    }

    // Extract final response
    const finalMessage = messages[messages.length - 1];

    // Update history (exclude system prompt)
    const newHistory = messages.slice(1);

    return {
        content: finalMessage.content || '',
        thinking: finalMessage.thinking,
        history: newHistory,
        iterations,
    };
}

/**
 * Run a single query without streaming (simpler interface)
 * @param {string} query - User query
 * @param {Array} history - Conversation history
 * @returns {Promise<Object>} - Response object
 */
export async function query(query, history = []) {
    let fullContent = '';
    let fullThinking = '';
    const toolsUsed = [];

    const result = await runAgent(query, {
        history,
        onThinking: (text) => { fullThinking += text; },
        onContent: (text) => { fullContent += text; },
        onToolCall: (tool) => { toolsUsed.push(tool.name); },
    });

    return {
        content: fullContent || result.content,
        thinking: fullThinking,
        toolsUsed,
        history: result.history,
    };
}

export { buildSystemPrompt };
