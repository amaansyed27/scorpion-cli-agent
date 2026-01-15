/**
 * Shell Tools
 * Execute PowerShell and CMD commands
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Tool: run_command
export const runCommand = {
    schema: {
        type: 'function',
        function: {
            name: 'run_command',
            description: 'Execute a shell command in PowerShell. Use this to run system commands, list files, check processes, etc.',
            parameters: {
                type: 'object',
                required: ['command'],
                properties: {
                    command: {
                        type: 'string',
                        description: 'The command to execute (e.g., "Get-Process", "dir", "systeminfo")'
                    },
                    timeout: {
                        type: 'integer',
                        description: 'Timeout in milliseconds (default: 30000)'
                    }
                }
            }
        }
    },
    execute: async ({ command, timeout = 30000 }) => {
        try {
            const { stdout, stderr } = await execAsync(command, {
                shell: 'powershell.exe',
                timeout,
                maxBuffer: 1024 * 1024 * 10, // 10MB buffer
                windowsHide: true
            });

            return JSON.stringify({
                success: true,
                stdout: stdout.trim(),
                stderr: stderr.trim() || undefined
            });
        } catch (error) {
            return JSON.stringify({
                success: false,
                error: error.message,
                stderr: error.stderr?.trim(),
                code: error.code
            });
        }
    }
};

// Tool: run_powershell_script
export const runPowershellScript = {
    schema: {
        type: 'function',
        function: {
            name: 'run_powershell_script',
            description: 'Execute a multi-line PowerShell script. Use for complex operations that require multiple commands.',
            parameters: {
                type: 'object',
                required: ['script'],
                properties: {
                    script: {
                        type: 'string',
                        description: 'The PowerShell script to execute (can be multi-line)'
                    }
                }
            }
        }
    },
    execute: async ({ script }) => {
        try {
            // Encode script to base64 to handle special characters
            const encodedScript = Buffer.from(script, 'utf16le').toString('base64');

            const { stdout, stderr } = await execAsync(
                `powershell.exe -NoProfile -NonInteractive -EncodedCommand ${encodedScript}`,
                {
                    timeout: 60000,
                    maxBuffer: 1024 * 1024 * 10,
                    windowsHide: true
                }
            );

            return JSON.stringify({
                success: true,
                stdout: stdout.trim(),
                stderr: stderr.trim() || undefined
            });
        } catch (error) {
            return JSON.stringify({
                success: false,
                error: error.message,
                stderr: error.stderr?.trim()
            });
        }
    }
};

// Tool: get_environment_variable
export const getEnvVariable = {
    schema: {
        type: 'function',
        function: {
            name: 'get_environment_variable',
            description: 'Get the value of an environment variable',
            parameters: {
                type: 'object',
                required: ['name'],
                properties: {
                    name: {
                        type: 'string',
                        description: 'Name of the environment variable (e.g., "PATH", "USERPROFILE")'
                    }
                }
            }
        }
    },
    execute: async ({ name }) => {
        const value = process.env[name];
        return JSON.stringify({
            name,
            value: value || null,
            exists: value !== undefined
        });
    }
};
