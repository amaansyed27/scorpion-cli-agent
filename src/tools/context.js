/**
 * Context Tools
 * Real-time context awareness - date, time, current state of the world
 * This is what makes AI more human-like - knowing "now"
 */

import { jinaSearch, jinaFetch } from './web.js';

/**
 * Get current date/time with various formats
 */
function getCurrentDateTime() {
    const now = new Date();

    return {
        // ISO format
        iso: now.toISOString(),

        // Human readable
        date: now.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }),
        time: now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        }),

        // Components
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: now.getDate(),
        hour: now.getHours(),
        minute: now.getMinutes(),
        dayOfWeek: now.toLocaleDateString('en-US', { weekday: 'long' }),

        // Unix timestamp
        timestamp: now.getTime(),

        // Timezone
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timezoneOffset: now.getTimezoneOffset()
    };
}

// Tool: get_current_datetime
export const getCurrentDatetime = {
    schema: {
        type: 'function',
        function: {
            name: 'get_current_datetime',
            description: 'Get the current date and time. Use this whenever you need to know the current date, time, day of week, or year. This provides real-time information.',
            parameters: {
                type: 'object',
                properties: {
                    format: {
                        type: 'string',
                        enum: ['full', 'date', 'time', 'year'],
                        description: 'What format to return (default: full)'
                    }
                }
            }
        }
    },
    execute: async ({ format = 'full' } = {}) => {
        const dt = getCurrentDateTime();

        switch (format) {
            case 'date':
                return JSON.stringify({
                    success: true,
                    date: dt.date,
                    dayOfWeek: dt.dayOfWeek,
                    year: dt.year
                });
            case 'time':
                return JSON.stringify({
                    success: true,
                    time: dt.time,
                    timezone: dt.timezone
                });
            case 'year':
                return JSON.stringify({
                    success: true,
                    year: dt.year
                });
            default:
                return JSON.stringify({
                    success: true,
                    ...dt
                });
        }
    }
};

// Tool: get_current_context
export const getCurrentContext = {
    schema: {
        type: 'function',
        function: {
            name: 'get_current_context',
            description: 'Get current real-world context including date, time, and user environment. Call this to ground yourself in reality and know what "now" means.',
            parameters: {
                type: 'object',
                properties: {}
            }
        }
    },
    execute: async () => {
        const dt = getCurrentDateTime();
        const os = process.platform;
        const cwd = process.cwd();
        const user = process.env.USERNAME || process.env.USER || 'unknown';
        const home = process.env.USERPROFILE || process.env.HOME || '';

        return JSON.stringify({
            success: true,
            currentTime: {
                date: dt.date,
                time: dt.time,
                year: dt.year,
                timezone: dt.timezone
            },
            environment: {
                os: os === 'win32' ? 'Windows' : os === 'darwin' ? 'macOS' : 'Linux',
                user,
                homeDirectory: home,
                workingDirectory: cwd
            },
            awareness: {
                note: `The current year is ${dt.year}. Any knowledge you have from training may be outdated. Use web search to get latest information.`
            }
        });
    }
};

// Tool: check_latest_version
export const checkLatestVersion = {
    schema: {
        type: 'function',
        function: {
            name: 'check_latest_version',
            description: 'Check for the latest version of a software, package, or tool. Use this when you need to know if something has been updated since your training data.',
            parameters: {
                type: 'object',
                required: ['name'],
                properties: {
                    name: {
                        type: 'string',
                        description: 'Name of the software/package to check (e.g., "Node.js", "Python", "React")'
                    },
                    type: {
                        type: 'string',
                        enum: ['software', 'npm', 'python', 'general'],
                        description: 'Type of package (default: general)'
                    }
                }
            }
        }
    },
    execute: async ({ name, type = 'general' }) => {
        try {
            const currentYear = new Date().getFullYear();

            // Search for latest version
            const query = `${name} latest version ${currentYear}`;
            let results;

            try {
                results = await jinaSearch(query, 3);
            } catch (e) {
                results = [];
            }

            // For npm packages, also try the npm registry
            let npmInfo = null;
            if (type === 'npm') {
                try {
                    const response = await fetch(`https://registry.npmjs.org/${name}/latest`, {
                        headers: { 'Accept': 'application/json' }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        npmInfo = {
                            name: data.name,
                            version: data.version,
                            description: data.description,
                            lastPublish: data.time?.modified || 'unknown'
                        };
                    }
                } catch (e) {
                    // npm check failed, continue with search results
                }
            }

            // For Python packages, try PyPI
            let pypiInfo = null;
            if (type === 'python') {
                try {
                    const response = await fetch(`https://pypi.org/pypi/${name}/json`);
                    if (response.ok) {
                        const data = await response.json();
                        pypiInfo = {
                            name: data.info.name,
                            version: data.info.version,
                            summary: data.info.summary,
                            releaseDate: Object.keys(data.releases).pop()
                        };
                    }
                } catch (e) {
                    // PyPI check failed
                }
            }

            return JSON.stringify({
                success: true,
                name,
                currentYear,
                note: `Checked on ${new Date().toLocaleDateString()}`,
                npmPackage: npmInfo,
                pypiPackage: pypiInfo,
                searchResults: results.map(r => ({
                    title: r.title,
                    url: r.url,
                    snippet: r.snippet
                })),
                recommendation: `If your knowledge is outdated, trust the search results above for the latest information about ${name}.`
            });
        } catch (error) {
            return JSON.stringify({
                success: false,
                error: error.message,
                name
            });
        }
    }
};

// Tool: calculate_time_difference
export const calculateTimeDifference = {
    schema: {
        type: 'function',
        function: {
            name: 'calculate_time_difference',
            description: 'Calculate the time difference between two dates or from a date to now. Useful for knowing how old something is.',
            parameters: {
                type: 'object',
                required: ['from_date'],
                properties: {
                    from_date: {
                        type: 'string',
                        description: 'The starting date (ISO format or natural like "2023-01-15")'
                    },
                    to_date: {
                        type: 'string',
                        description: 'The ending date (default: now)'
                    }
                }
            }
        }
    },
    execute: async ({ from_date, to_date }) => {
        try {
            const from = new Date(from_date);
            const to = to_date ? new Date(to_date) : new Date();

            if (isNaN(from.getTime())) {
                throw new Error('Invalid from_date');
            }
            if (isNaN(to.getTime())) {
                throw new Error('Invalid to_date');
            }

            const diffMs = to.getTime() - from.getTime();
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const diffMonths = Math.floor(diffDays / 30);
            const diffYears = Math.floor(diffDays / 365);

            let humanReadable = '';
            if (diffYears > 0) {
                humanReadable = `${diffYears} year${diffYears > 1 ? 's' : ''}`;
                const remainingMonths = diffMonths - (diffYears * 12);
                if (remainingMonths > 0) {
                    humanReadable += ` and ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
                }
            } else if (diffMonths > 0) {
                humanReadable = `${diffMonths} month${diffMonths > 1 ? 's' : ''}`;
            } else {
                humanReadable = `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
            }

            return JSON.stringify({
                success: true,
                from: from.toISOString(),
                to: to.toISOString(),
                difference: {
                    days: diffDays,
                    months: diffMonths,
                    years: diffYears,
                    humanReadable
                },
                isInPast: diffMs > 0,
                isInFuture: diffMs < 0
            });
        } catch (error) {
            return JSON.stringify({
                success: false,
                error: error.message
            });
        }
    }
};

// Tool: get_timezone_time
export const getTimezoneTime = {
    schema: {
        type: 'function',
        function: {
            name: 'get_timezone_time',
            description: 'Get the current time in a specific timezone. Useful for knowing what time it is in different parts of the world.',
            parameters: {
                type: 'object',
                required: ['timezone'],
                properties: {
                    timezone: {
                        type: 'string',
                        description: 'Timezone name (e.g., "America/New_York", "Europe/London", "Asia/Tokyo")'
                    }
                }
            }
        }
    },
    execute: async ({ timezone }) => {
        try {
            const now = new Date();

            const options = {
                timeZone: timezone,
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            };

            const formatted = now.toLocaleString('en-US', options);

            return JSON.stringify({
                success: true,
                timezone,
                datetime: formatted,
                iso: now.toLocaleString('en-CA', { timeZone: timezone }).replace(', ', 'T')
            });
        } catch (error) {
            return JSON.stringify({
                success: false,
                error: `Invalid timezone: ${timezone}. Use format like "America/New_York" or "Asia/Tokyo".`
            });
        }
    }
};

// Tool: set_reminder (stores in memory for session)
const reminders = [];

export const setReminder = {
    schema: {
        type: 'function',
        function: {
            name: 'set_reminder',
            description: 'Set a reminder for the current session. Note: Reminders only persist during this session.',
            parameters: {
                type: 'object',
                required: ['message'],
                properties: {
                    message: {
                        type: 'string',
                        description: 'The reminder message'
                    },
                    time: {
                        type: 'string',
                        description: 'When to remind (optional, for reference)'
                    }
                }
            }
        }
    },
    execute: async ({ message, time }) => {
        const reminder = {
            id: reminders.length + 1,
            message,
            time: time || 'unspecified',
            createdAt: new Date().toISOString()
        };
        reminders.push(reminder);

        return JSON.stringify({
            success: true,
            reminder,
            totalReminders: reminders.length,
            note: 'Reminder saved for this session'
        });
    }
};

export const listReminders = {
    schema: {
        type: 'function',
        function: {
            name: 'list_reminders',
            description: 'List all reminders set during this session.',
            parameters: {
                type: 'object',
                properties: {}
            }
        }
    },
    execute: async () => {
        return JSON.stringify({
            success: true,
            count: reminders.length,
            reminders
        });
    }
};
