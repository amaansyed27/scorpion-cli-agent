/**
 * Comprehensive Web Search Tools
 * Multiple search engines for accuracy and redundancy
 * 
 * Sources: DuckDuckGo, Bing, Google News
 */

import * as cheerio from 'cheerio';
import fetch from 'node-fetch'; // Explicitly use node-fetch

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
];

function getRandomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

async function fetchWithTimeout(url, options = {}, timeout = 6000) {
  const controller = new AbortController();
  const timeoutMs = timeout;

  const fetchPromise = fetch(url, {
    ...options,
    signal: controller.signal,
    redirect: 'follow',
    headers: {
      'User-Agent': getRandomUserAgent(),
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      ...options.headers,
    },
  });

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      controller.abort();
      reject(new Error(`Timeout after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    // Bulletproof timeout using Promise.race
    const response = await Promise.race([fetchPromise, timeoutPromise]);
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * DuckDuckGo HTML Search - Optimized
 */
async function searchDuckDuckGo(query, maxResults = 5) {
  try {
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const response = await fetchWithTimeout(searchUrl, {}, 6000); // 6s timeout for search
    const html = await response.text();
    const $ = cheerio.load(html);

    const results = [];
    $('.result').each((i, elem) => {
      if (results.length >= maxResults) return false;

      const $link = $(elem).find('.result__a');
      const $snippet = $(elem).find('.result__snippet');
      let url = $link.attr('href');

      if (url && url.includes('uddg=')) {
        try { url = decodeURIComponent(url.match(/uddg=([^&]+)/)[1]); } catch (e) { }
      }

      if (url && url.startsWith('http')) {
        results.push({
          title: $link.text().trim(),
          url,
          snippet: $snippet.text().trim(),
          source: 'DuckDuckGo'
        });
      }
    });
    return results;
  } catch (e) {
    return []; // Fail silently to not block others
  }
}

/**
 * Bing Search - Optimized
 */
async function searchBing(query, maxResults = 5) {
  try {
    const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
    const response = await fetchWithTimeout(searchUrl, {}, 6000);
    const html = await response.text();
    const $ = cheerio.load(html);

    const results = [];
    $('li.b_algo').each((i, elem) => {
      if (results.length >= maxResults) return false;
      const $link = $(elem).find('h2 a');
      const url = $link.attr('href');

      if (url && url.startsWith('http')) {
        results.push({
          title: $link.text().trim(),
          url,
          snippet: $(elem).find('p').text().trim().slice(0, 300),
          source: 'Bing'
        });
      }
    });
    return results;
  } catch (e) {
    return [];
  }
}

/**
 * Google News - Optimized
 */
async function searchGoogleNews(query, maxResults = 5) {
  try {
    const searchUrl = `https://news.google.com/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
    const response = await fetchWithTimeout(searchUrl, {}, 6000);
    const html = await response.text();
    const $ = cheerio.load(html);

    const results = [];
    $('article').each((i, elem) => {
      if (results.length >= maxResults) return false;
      const $link = $(elem).find('a[href^="./article"]');
      let url = $link.attr('href');

      if (url) {
        url = 'https://news.google.com' + url.slice(1);
        results.push({
          title: $link.text().trim(),
          url,
          snippet: $(elem).find('time').parent().text().trim(),
          source: 'GoogleNews'
        });
      }
    });
    return results;
  } catch (e) {
    return [];
  }
}

/**
 * Multi-engine search - combines results from multiple sources
 */
async function multiSearch(query, maxResults = 8) {
  const allResults = [];
  const seenUrls = new Set();
  const errors = [];

  // Run searches in parallel
  const searches = [
    searchDuckDuckGo(query, 5).catch(e => { errors.push('DDG: ' + e.message); return []; }),
    searchBing(query, 5).catch(e => { errors.push('Bing: ' + e.message); return []; }),
    searchGoogleNews(query, 3).catch(e => { errors.push('GNews: ' + e.message); return []; }),
  ];

  const results = await Promise.all(searches);

  // Merge and dedupe results
  for (const sourceResults of results) {
    for (const result of sourceResults) {
      // Normalize URL for deduplication
      const normalizedUrl = result.url.replace(/\/$/, '').replace(/^https?:\/\/(www\.)?/, '').slice(0, 100);

      if (!seenUrls.has(normalizedUrl)) {
        seenUrls.add(normalizedUrl);
        allResults.push(result);
      }
    }
  }

  // Sort by having snippet (more informative first)
  allResults.sort((a, b) => (b.snippet?.length || 0) - (a.snippet?.length || 0));

  return {
    results: allResults.slice(0, maxResults),
    sourcesUsed: results.filter(r => r.length > 0).length,
    errors: errors.length > 0 ? errors : undefined
  };
}

/**
 * Fetch and extract content from URL
 */
async function fetchPage(url) {
  try {
    if (!url.startsWith('http')) url = 'https://' + url;

    // Strict 8s timeout for fetching pages
    const response = await fetchWithTimeout(url, {}, 8000);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
      return { url, title: 'Non-HTML', content: `Content: ${contentType}`, contentLength: 0 };
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove junk
    $('script, style, nav, footer, header, aside, iframe, noscript, svg, form, [class*="cookie"], [class*="popup"], [class*="modal"], [class*="banner"], [id*="ad"], [class*="advertisement"], [class*="sidebar"], [class*="menu"]').remove();

    // Get title
    const title = $('title').text().trim() ||
      $('h1').first().text().trim() ||
      $('meta[property="og:title"]').attr('content') || 'Untitled';

    // Get meta description
    const metaDesc = $('meta[name="description"]').attr('content') ||
      $('meta[property="og:description"]').attr('content') || '';

    // Try main content areas
    let content = '';
    const mainSelectors = ['article', 'main', '[role="main"]', '.post-content', '.article-content',
      '.entry-content', '.content', '#content', '.post', '.article', '.story'];

    for (const sel of mainSelectors) {
      const $main = $(sel);
      if ($main.length && $main.text().trim().length > 300) {
        content = $main.text();
        break;
      }
    }

    // Fallback to body text if no main content found
    if (!content || content.length < 300) {
      content = $('body').text();
    }

    // Clean content
    content = content.replace(/\s+/g, ' ').replace(/\n\s*\n/g, '\n\n').trim();

    // Prepend meta description
    if (metaDesc && content.length > 0) {
      content = metaDesc + '\n\n' + content;
    }

    return {
      url,
      title: title.slice(0, 200),
      content: content.slice(0, 8000), // Limit content size
      contentLength: content.length
    };
  } catch (error) {
    // Return error object instead of throwing
    return {
      url,
      title: 'Error',
      content: `Failed to load: ${error.message}`,
      contentLength: 0,
      error: true
    };
  }
}

// ============= Tool Exports =============

export const webSearch = {
  schema: {
    type: 'function',
    function: {
      name: 'web_search',
      description: 'Search the web using multiple search engines (DuckDuckGo, Bing, Google News) for comprehensive results. Returns deduplicated results from all sources.',
      parameters: {
        type: 'object',
        required: ['query'],
        properties: {
          query: {
            type: 'string',
            description: 'Search query - be specific for best results'
          },
          max_results: {
            type: 'integer',
            description: 'Max results to return (default: 8)'
          }
        }
      }
    }
  },
  execute: async ({ query, max_results = 8 }) => {
    try {
      const { results, sourcesUsed, errors } = await multiSearch(query, max_results);

      return JSON.stringify({
        success: results.length > 0,
        query,
        resultCount: results.length,
        sourcesUsed,
        errors,
        results
      });
    } catch (error) {
      return JSON.stringify({ success: false, error: error.message, query });
    }
  }
};

export const webFetch = {
  schema: {
    type: 'function',
    function: {
      name: 'web_fetch',
      description: 'Fetch and read content from a URL. Extracts main article content, removing ads and navigation.',
      parameters: {
        type: 'object',
        required: ['url'],
        properties: {
          url: {
            type: 'string',
            description: 'URL to fetch'
          }
        }
      }
    }
  },
  execute: async ({ url }) => {
    try {
      const result = await fetchPage(url);
      return JSON.stringify({ success: true, ...result });
    } catch (error) {
      return JSON.stringify({ success: false, error: error.message, url });
    }
  }
};

export const researchTopic = {
  schema: {
    type: 'function',
    function: {
      name: 'research_topic',
      description: 'Comprehensive research on a topic: searches multiple engines, then fetches and reads content from top sources. Best for in-depth research.',
      parameters: {
        type: 'object',
        required: ['topic'],
        properties: {
          topic: {
            type: 'string',
            description: 'Topic to research'
          },
          depth: {
            type: 'integer',
            description: 'Number of sources to read in detail (default: 3, max: 5)'
          }
        }
      }
    }
  },
  execute: async ({ topic, depth = 2 }) => {
    // HARD TIMEOUT for entire operation: 25 seconds
    // If it takes longer, we return whatever we have
    const start = Date.now();
    const TIMEOUT_MS = 25000;

    try {
      // 1. Search (Limit to 5 seconds)
      const searchPromise = multiSearch(topic, 5);
      const timeoutPromise = new Promise(resolve => setTimeout(() => resolve({ results: [], sourcesUsed: 0 }), 5000));

      const { results: searchResults, sourcesUsed } = await Promise.race([searchPromise, timeoutPromise]);

      if (!searchResults || searchResults.length === 0) {
        return JSON.stringify({ success: false, error: "Search timed out or found no results", topic });
      }

      const research = {
        topic,
        searchEnginesUsed: sourcesUsed || 1,
        searchResults: searchResults.slice(0, 5).map(r => ({
          title: r.title,
          url: r.url,
          snippet: r.snippet,
          source: r.source
        })),
        detailedContent: []
      };

      // 2. Fetch Content (Limit concurrency to 2, Max 2 sources total)
      const maxSources = Math.min(depth, 2);
      const topResults = searchResults.slice(0, maxSources);

      const fetchPromises = topResults.map(async (result) => {
        // Check if we're already out of time
        if (Date.now() - start > TIMEOUT_MS) return null;

        try {
          // Individual page fetch limit: 6s
          const page = await fetchPage(result.url);
          return {
            title: page.title,
            url: page.url,
            searchEngine: result.source,
            content: page.content.slice(0, 1500) // Reduced content size for faster processing
          };
        } catch (e) {
          return null;
        }
      });

      // Wait for fetches but enforce global timeout
      const resultsPromise = Promise.all(fetchPromises);
      const globalTimeout = new Promise(resolve => setTimeout(() => resolve([]), TIMEOUT_MS - (Date.now() - start)));

      const fetchedPages = await Promise.race([resultsPromise, globalTimeout]);

      research.detailedContent = (fetchedPages || []).filter(p => p !== null);

      return JSON.stringify({
        success: true,
        ...research,
        summary: `Found ${searchResults.length} results, fetched ${research.detailedContent.length} sources in ${(Date.now() - start) / 1000}s.`
      });

    } catch (error) {
      return JSON.stringify({ success: false, error: error.message, topic });
    }
  }
};

// Export for other modules
export { multiSearch as jinaSearch, fetchPage as jinaFetch, searchDuckDuckGo, searchBing, searchGoogleNews };
