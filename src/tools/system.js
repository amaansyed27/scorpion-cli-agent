/**
 * System Tools
 * System monitoring and analysis
 */

import si from 'systeminformation';
import os from 'os';

// Tool: get_cpu_usage
export const getCpuUsage = {
    schema: {
        type: 'function',
        function: {
            name: 'get_cpu_usage',
            description: 'Get current CPU usage and information',
            parameters: {
                type: 'object',
                properties: {}
            }
        }
    },
    execute: async () => {
        try {
            const [cpu, load, speed] = await Promise.all([
                si.cpu(),
                si.currentLoad(),
                si.cpuCurrentSpeed()
            ]);

            return JSON.stringify({
                success: true,
                model: `${cpu.manufacturer} ${cpu.brand}`,
                cores: cpu.cores,
                physicalCores: cpu.physicalCores,
                speed: `${speed.avg.toFixed(2)} GHz`,
                usage: {
                    total: `${load.currentLoad.toFixed(1)}%`,
                    user: `${load.currentLoadUser.toFixed(1)}%`,
                    system: `${load.currentLoadSystem.toFixed(1)}%`,
                    idle: `${load.currentLoadIdle.toFixed(1)}%`
                },
                perCore: load.cpus.map((c, i) => ({
                    core: i,
                    load: `${c.load.toFixed(1)}%`
                }))
            });
        } catch (error) {
            return JSON.stringify({ success: false, error: error.message });
        }
    }
};

// Tool: get_memory_usage
export const getMemoryUsage = {
    schema: {
        type: 'function',
        function: {
            name: 'get_memory_usage',
            description: 'Get current memory (RAM) usage',
            parameters: {
                type: 'object',
                properties: {}
            }
        }
    },
    execute: async () => {
        try {
            const mem = await si.mem();

            return JSON.stringify({
                success: true,
                total: formatBytes(mem.total),
                used: formatBytes(mem.used),
                free: formatBytes(mem.free),
                available: formatBytes(mem.available),
                usagePercent: `${((mem.used / mem.total) * 100).toFixed(1)}%`,
                swap: {
                    total: formatBytes(mem.swaptotal),
                    used: formatBytes(mem.swapused),
                    free: formatBytes(mem.swapfree)
                }
            });
        } catch (error) {
            return JSON.stringify({ success: false, error: error.message });
        }
    }
};

// Tool: get_disk_usage
export const getDiskUsage = {
    schema: {
        type: 'function',
        function: {
            name: 'get_disk_usage',
            description: 'Get disk/storage usage for all drives',
            parameters: {
                type: 'object',
                properties: {
                    drive: {
                        type: 'string',
                        description: 'Specific drive letter to check (e.g., "C:"). If not provided, shows all drives.'
                    }
                }
            }
        }
    },
    execute: async ({ drive } = {}) => {
        try {
            const disks = await si.fsSize();

            let filtered = disks;
            if (drive) {
                filtered = disks.filter(d =>
                    d.mount.toLowerCase().startsWith(drive.toLowerCase())
                );
            }

            return JSON.stringify({
                success: true,
                drives: filtered.map(d => ({
                    mount: d.mount,
                    type: d.type,
                    total: formatBytes(d.size),
                    used: formatBytes(d.used),
                    free: formatBytes(d.available),
                    usagePercent: `${d.use.toFixed(1)}%`
                }))
            });
        } catch (error) {
            return JSON.stringify({ success: false, error: error.message });
        }
    }
};

// Tool: get_running_processes
export const getRunningProcesses = {
    schema: {
        type: 'function',
        function: {
            name: 'get_running_processes',
            description: 'List running processes sorted by CPU or memory usage',
            parameters: {
                type: 'object',
                properties: {
                    sort_by: {
                        type: 'string',
                        enum: ['cpu', 'memory'],
                        description: 'Sort by CPU or memory usage (default: cpu)'
                    },
                    limit: {
                        type: 'integer',
                        description: 'Number of processes to return (default: 10)'
                    }
                }
            }
        }
    },
    execute: async ({ sort_by = 'cpu', limit = 10 }) => {
        try {
            const processes = await si.processes();

            const sorted = processes.list
                .sort((a, b) => {
                    if (sort_by === 'memory') {
                        return b.memRss - a.memRss;
                    }
                    return b.cpu - a.cpu;
                })
                .slice(0, limit);

            return JSON.stringify({
                success: true,
                totalProcesses: processes.all,
                running: processes.running,
                blocked: processes.blocked,
                topProcesses: sorted.map(p => ({
                    pid: p.pid,
                    name: p.name,
                    cpu: `${p.cpu.toFixed(1)}%`,
                    memory: formatBytes(p.memRss),
                    memoryPercent: `${p.mem.toFixed(1)}%`,
                    state: p.state
                }))
            });
        } catch (error) {
            return JSON.stringify({ success: false, error: error.message });
        }
    }
};

// Tool: get_system_info
export const getSystemInfo = {
    schema: {
        type: 'function',
        function: {
            name: 'get_system_info',
            description: 'Get comprehensive system information (OS, hardware, uptime)',
            parameters: {
                type: 'object',
                properties: {}
            }
        }
    },
    execute: async () => {
        try {
            const [osInfo, system, bios, time] = await Promise.all([
                si.osInfo(),
                si.system(),
                si.bios(),
                si.time()
            ]);

            return JSON.stringify({
                success: true,
                os: {
                    platform: osInfo.platform,
                    distro: osInfo.distro,
                    release: osInfo.release,
                    arch: osInfo.arch,
                    hostname: osInfo.hostname
                },
                system: {
                    manufacturer: system.manufacturer,
                    model: system.model,
                    version: system.version
                },
                bios: {
                    vendor: bios.vendor,
                    version: bios.version
                },
                uptime: formatUptime(time.uptime),
                currentTime: new Date().toISOString(),
                timezone: time.timezone
            });
        } catch (error) {
            return JSON.stringify({ success: false, error: error.message });
        }
    }
};

// Tool: analyze_performance
export const analyzePerformance = {
    schema: {
        type: 'function',
        function: {
            name: 'analyze_performance',
            description: 'Get a comprehensive performance snapshot including CPU, memory, disk, and top processes',
            parameters: {
                type: 'object',
                properties: {}
            }
        }
    },
    execute: async () => {
        try {
            const [cpu, load, mem, disks, processes, osInfo, time] = await Promise.all([
                si.cpu(),
                si.currentLoad(),
                si.mem(),
                si.fsSize(),
                si.processes(),
                si.osInfo(),
                si.time()
            ]);

            // Get top 5 processes by CPU
            const topProcesses = processes.list
                .sort((a, b) => b.cpu - a.cpu)
                .slice(0, 5)
                .map(p => ({
                    name: p.name,
                    cpu: `${p.cpu.toFixed(1)}%`,
                    memory: formatBytes(p.memRss)
                }));

            return JSON.stringify({
                success: true,
                timestamp: new Date().toISOString(),
                system: {
                    hostname: osInfo.hostname,
                    os: `${osInfo.distro} ${osInfo.release}`,
                    uptime: formatUptime(time.uptime)
                },
                cpu: {
                    model: `${cpu.manufacturer} ${cpu.brand}`,
                    cores: cpu.cores,
                    usage: `${load.currentLoad.toFixed(1)}%`
                },
                memory: {
                    total: formatBytes(mem.total),
                    used: formatBytes(mem.used),
                    free: formatBytes(mem.available),
                    usagePercent: `${((mem.used / mem.total) * 100).toFixed(1)}%`
                },
                storage: disks.map(d => ({
                    drive: d.mount,
                    total: formatBytes(d.size),
                    used: formatBytes(d.used),
                    free: formatBytes(d.available),
                    usagePercent: `${d.use.toFixed(1)}%`
                })),
                topProcesses,
                processCount: processes.all
            });
        } catch (error) {
            return JSON.stringify({ success: false, error: error.message });
        }
    }
};

// Tool: get_network_info
export const getNetworkInfo = {
    schema: {
        type: 'function',
        function: {
            name: 'get_network_info',
            description: 'Get network interfaces and connection information',
            parameters: {
                type: 'object',
                properties: {}
            }
        }
    },
    execute: async () => {
        try {
            const [interfaces, stats, defaultGateway] = await Promise.all([
                si.networkInterfaces(),
                si.networkStats(),
                si.networkGatewayDefault()
            ]);

            return JSON.stringify({
                success: true,
                defaultGateway,
                interfaces: interfaces
                    .filter(i => i.ip4)
                    .map(i => ({
                        name: i.iface,
                        type: i.type,
                        ip4: i.ip4,
                        ip6: i.ip6,
                        mac: i.mac,
                        speed: i.speed ? `${i.speed} Mbps` : 'Unknown'
                    })),
                stats: stats.map(s => ({
                    interface: s.iface,
                    rxBytes: formatBytes(s.rx_bytes),
                    txBytes: formatBytes(s.tx_bytes),
                    rxSpeed: formatBytes(s.rx_sec) + '/s',
                    txSpeed: formatBytes(s.tx_sec) + '/s'
                }))
            });
        } catch (error) {
            return JSON.stringify({ success: false, error: error.message });
        }
    }
};

// Helper functions
function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);

    return parts.join(' ') || '< 1m';
}
