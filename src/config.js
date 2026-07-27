/**
 * Persistent local settings for Scorpion.
 */

import fs from 'fs/promises';
import os from 'os';
import path from 'path';

const CONFIG_DIRECTORY = process.env.SCORPION_CONFIG_DIR || path.join(os.homedir(), '.scorpion');
const CONFIG_PATH = path.join(CONFIG_DIRECTORY, 'config.json');

export async function loadSettings() {
    try {
        const raw = await fs.readFile(CONFIG_PATH, 'utf8');
        const settings = JSON.parse(raw);

        return typeof settings?.model === 'string' && settings.model.trim()
            ? { model: settings.model.trim() }
            : {};
    } catch (error) {
        if (error.code === 'ENOENT' || error instanceof SyntaxError) return {};
        throw error;
    }
}

export async function saveSettings(settings) {
    await fs.mkdir(CONFIG_DIRECTORY, { recursive: true });
    await fs.writeFile(CONFIG_PATH, `${JSON.stringify(settings, null, 2)}\n`, 'utf8');
}

export function getConfigPath() {
    return CONFIG_PATH;
}
