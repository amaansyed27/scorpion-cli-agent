/**
 * Deep Research with Live Progress
 * Shows real-time status as research progresses
 */

import * as cheerio from 'cheerio';
import fetch from 'node-fetch';

// Progress callback - set by repl.js
let progressCallback = null;

export function setProgressCallback(callback) {
    progressCallback = callback;
}

function emitProgress(event, data) {
    if (progressCallback) progressCallback(event, data);
}

// ============= Configuration =============

const SOURCES = {
    ARXIV: { name: 'arXiv', authority: 0.95, type: 'academic', icon: '📄' },
    HACKERNEWS: { name: 'Hacker News', authority: 0.75, type: 'tech', icon: '🔶' },
    WIKIPEDIA: { name: 'Wikipedia', authority: 0.85, type: 'reference', icon: '📚' }
};

// ============= Helpers =============

async function fetchWithTimeout(url, timeout = 6000) {
    const controller = new AbortController();
    const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => { controller.abort(); reject(new Error('Timeout')); }, timeout)
    );

    try {
        const response = await Promise.race([
            fetch(url, {
                signal: controller.signal,
                headers: { 'User-Agent': 'Scorpion-Research/1.0' }
            }),
            timeoutPromise
        ]);
        return response;
    } catch (e) {
        throw e;
    }
}

// ============= Search Functions =============

async function searchArxiv(query, maxResults = 5) {
    emitProgress('searching', { source: 'arXiv', query });
    try {
        const searchUrl = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=${maxResults}`;
        const response = await fetchWithTimeout(searchUrl, 8000);
        const xml = await response.text();
        const $ = cheerio.load(xml, { xmlMode: true });

        const results = [];
        $('entry').each((i, elem) => {
            if (results.length >= maxResults) return false;
            const $entry = $(elem);
            const title = $entry.find('title').text().replace(/\s+/g, ' ').trim();
            const summary = $entry.find('summary').text().replace(/\s+/g, ' ').trim();
            const url = $entry.find('id').text().trim();
            const published = $entry.find('published').text().trim();
            const authors = [];
            $entry.find('author name').each((j, auth) => {
                authors.push($(auth).text().trim());
            });

            if (title && url) {
                results.push({
                    title, url,
                    snippet: summary.slice(0, 400),
                    source: SOURCES.ARXIV,
                    published,
                    authors: authors.slice(0, 3),
                    type: 'academic'
                });
            }
        });

        emitProgress('found', { source: 'arXiv', count: results.length });
        return results;
    } catch (e) {
        emitProgress('found', { source: 'arXiv', count: 0 });
        return [];
    }
}

async function searchHackerNews(query, maxResults = 5) {
    emitProgress('searching', { source: 'Hacker News', query });
    try {
        const searchUrl = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=${maxResults}`;
        const response = await fetchWithTimeout(searchUrl, 6000);
        const data = await response.json();

        const results = [];
        const hits = data?.hits || [];

        for (const hit of hits) {
            if (results.length >= maxResults) break;
            results.push({
                title: hit.title,
                url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
                snippet: hit.title,
                source: SOURCES.HACKERNEWS,
                points: hit.points,
                comments: hit.num_comments,
                author: hit.author,
                type: 'tech'
            });
        }

        emitProgress('found', { source: 'Hacker News', count: results.length });
        return results;
    } catch (e) {
        emitProgress('found', { source: 'Hacker News', count: 0 });
        return [];
    }
}

async function searchWikipedia(query, maxResults = 3) {
    emitProgress('searching', { source: 'Wikipedia', query });
    try {
        const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=${maxResults}&format=json&origin=*`;
        const response = await fetchWithTimeout(searchUrl, 6000);
        const data = await response.json();

        const results = [];
        const items = data?.query?.search || [];

        for (const item of items) {
            if (results.length >= maxResults) break;
            const snippet = item.snippet.replace(/<[^>]+>/g, '');
            results.push({
                title: item.title,
                url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, '_'))}`,
                snippet,
                source: SOURCES.WIKIPEDIA,
                wordcount: item.wordcount,
                type: 'reference'
            });
        }

        emitProgress('found', { source: 'Wikipedia', count: results.length });
        return results;
    } catch (e) {
        emitProgress('found', { source: 'Wikipedia', count: 0 });
        return [];
    }
}

// ============= Query Decomposition =============

function decomposeQuery(query) {
    const subQueries = [];
    const queryLower = query.toLowerCase();
    const mainTopic = query.replace(/^(what|how|why|when|where|who|explain|describe|research|analyze)/i, '').trim();

    subQueries.push({ query: mainTopic, type: 'main', priority: 1 });

    if (!queryLower.includes('definition') && !queryLower.includes('what is')) {
        subQueries.push({ query: `${mainTopic} definition overview`, type: 'definition', priority: 0.9 });
    }

    if (!queryLower.includes('latest') && !queryLower.includes('recent')) {
        subQueries.push({ query: `${mainTopic} latest developments 2025`, type: 'recent', priority: 0.8 });
    }

    return subQueries;
}

// ============= Ranking =============

function calculateScore(result, query) {
    let score = 0;
    const queryLower = query.toLowerCase();
    const titleLower = result.title?.toLowerCase() || '';
    const snippetLower = result.snippet?.toLowerCase() || '';

    score += (result.source?.authority || 0.5) * 40;
    if (titleLower.includes(queryLower)) score += 30;
    else {
        const words = queryLower.split(' ');
        const matches = words.filter(w => titleLower.includes(w)).length;
        score += (matches / words.length) * 20;
    }

    const snippetWords = queryLower.split(' ');
    const snippetMatches = snippetWords.filter(w => snippetLower.includes(w)).length;
    score += (snippetMatches / snippetWords.length) * 15;

    if (result.points) score += Math.min(result.points / 50, 10);
    if (result.comments) score += Math.min(result.comments / 20, 5);

    return score;
}

function rankResults(results, query) {
    const seen = new Set();
    const ranked = [];

    for (const result of results) {
        const urlKey = result.url?.replace(/^https?:\/\/(www\.)?/, '').slice(0, 100);
        if (seen.has(urlKey)) continue;
        seen.add(urlKey);

        result.relevanceScore = calculateScore(result, query);
        ranked.push(result);
    }

    ranked.sort((a, b) => b.relevanceScore - a.relevanceScore);
    return ranked;
}

// ============= Report Generation =============

function generateReport(query, subQueries, allResults, searchTime) {
    const citations = [];
    let citationIndex = 1;

    const citationMap = new Map();
    for (const result of allResults.slice(0, 15)) {
        citationMap.set(result.url, {
            index: citationIndex++,
            ...result
        });
        citations.push(citationMap.get(result.url));
    }

    const byType = {
        academic: allResults.filter(r => r.type === 'academic').slice(0, 5),
        tech: allResults.filter(r => r.type === 'tech').slice(0, 5),
        reference: allResults.filter(r => r.type === 'reference').slice(0, 3)
    };

    const confidenceScore = Math.min(100, Math.round(
        (allResults.length / 15) * 40 +
        (byType.academic.length > 0 ? 25 : 0) +
        (byType.reference.length > 0 ? 20 : 0) +
        (byType.tech.length > 0 ? 15 : 0)
    ));

    const report = {
        title: `Research Report: ${query}`,
        metadata: {
            generatedAt: new Date().toISOString(),
            searchTime: searchTime.toFixed(2) + 's',
            totalSources: allResults.length,
            confidenceScore,
            subQueriesUsed: subQueries.length
        },
        sections: [],
        citations
    };

    const topResults = allResults.slice(0, 3);
    report.sections.push({
        title: 'Executive Summary',
        content: topResults.map(r => `${r.source?.icon || '•'} **${r.title}** - ${r.snippet?.slice(0, 150)}...`).join('\n\n')
    });

    if (byType.academic.length > 0) {
        report.sections.push({
            title: 'Academic Research',
            icon: '📄',
            content: byType.academic.map(r => {
                const cite = citationMap.get(r.url);
                return `- **${r.title}** [${cite?.index}]\n  ${r.snippet?.slice(0, 200)}...\n  *Authors: ${r.authors?.join(', ') || 'N/A'}*`;
            }).join('\n\n')
        });
    }

    if (byType.tech.length > 0) {
        report.sections.push({
            title: 'Technical Discussions',
            icon: '🔶',
            content: byType.tech.map(r => {
                const cite = citationMap.get(r.url);
                return `- **${r.title}** [${cite?.index}] (${r.points || 0} points, ${r.comments || 0} comments)`;
            }).join('\n')
        });
    }

    if (byType.reference.length > 0) {
        report.sections.push({
            title: 'Reference Materials',
            icon: '📚',
            content: byType.reference.map(r => {
                const cite = citationMap.get(r.url);
                return `- **${r.title}** [${cite?.index}]\n  ${r.snippet?.slice(0, 200)}...`;
            }).join('\n\n')
        });
    }

    return report;
}

function formatReportAsMarkdown(report) {
    let md = `# ${report.title}\n\n`;
    md += `**Generated:** ${new Date(report.metadata.generatedAt).toLocaleString()}\n`;
    md += `**Sources:** ${report.metadata.totalSources} | **Confidence:** ${report.metadata.confidenceScore}% | **Time:** ${report.metadata.searchTime}\n\n`;
    md += `---\n\n`;

    for (const section of report.sections) {
        md += `## ${section.icon || ''} ${section.title}\n\n`;
        md += section.content + '\n\n';
    }

    md += `---\n\n## 📑 Sources\n\n`;
    for (const cite of report.citations.slice(0, 15)) {
        md += `[${cite.index}] ${cite.title}\n    ${cite.url}\n\n`;
    }

    return md;
}

// ============= Main Research =============

export async function conductResearch(query, options = {}) {
    const {
        depth = 'standard',
        maxResults = 15,
        timeout = 30000
    } = options;

    const startTime = Date.now();

    emitProgress('start', { query, depth });

    const subQueries = decomposeQuery(query);
    const queryLimit = depth === 'quick' ? 2 : depth === 'deep' ? 3 : 2;
    const activeSubQueries = subQueries.slice(0, queryLimit);

    for (const sq of activeSubQueries) {
        emitProgress('subquery', { query: sq.query, type: sq.type });
    }

    const allSearches = [];
    for (const sq of activeSubQueries) {
        allSearches.push(searchArxiv(sq.query, 3));
        allSearches.push(searchHackerNews(sq.query, 3));
        if (sq.type === 'main' || sq.type === 'definition') {
            allSearches.push(searchWikipedia(sq.query, 2));
        }
    }

    const timeoutPromise = new Promise(resolve => setTimeout(() => resolve([]), timeout));
    const resultsArrays = await Promise.race([
        Promise.all(allSearches.map(p => p.catch(() => []))),
        timeoutPromise
    ]);

    const allResults = (resultsArrays || []).flat();
    const rankedResults = rankResults(allResults, query);
    const searchTime = (Date.now() - startTime) / 1000;

    emitProgress('generating', {});
    const report = generateReport(query, activeSubQueries, rankedResults, searchTime);

    emitProgress('complete', {
        sources: report.metadata.totalSources,
        confidence: report.metadata.confidenceScore,
        time: searchTime
    });

    return {
        success: true,
        query,
        depth,
        metadata: report.metadata,
        report: formatReportAsMarkdown(report),
        rawResults: rankedResults.slice(0, maxResults),
        subQueries: activeSubQueries
    };
}

// ============= Tool Export =============

export const deepResearchTool = {
    schema: {
        type: 'function',
        function: {
            name: 'deep_research',
            description: 'Comprehensive multi-source research with live progress updates. Searches academic papers (arXiv), tech discussions (HN), and references (Wikipedia). Generates structured reports with citations.',
            parameters: {
                type: 'object',
                required: ['query'],
                properties: {
                    query: {
                        type: 'string',
                        description: 'Research topic or question'
                    },
                    depth: {
                        type: 'string',
                        enum: ['quick', 'standard', 'deep'],
                        description: 'Research depth'
                    }
                }
            }
        }
    },
    execute: async ({ query, depth = 'standard' }) => {
        try {
            const result = await conductResearch(query, { depth });

            return JSON.stringify({
                success: true,
                query: result.query,
                depth: result.depth,
                confidence: result.metadata.confidenceScore,
                sources: result.metadata.totalSources,
                searchTime: result.metadata.searchTime,
                report: result.report
            });
        } catch (error) {
            return JSON.stringify({ success: false, error: error.message, query });
        }
    }
};

export default { conductResearch, deepResearchTool, setProgressCallback };
