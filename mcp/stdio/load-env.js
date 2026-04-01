/**
 * Load env vars from settings.local.json files.
 * Merges user-level (~/.claude/settings.local.json) and project-level
 * (.claude/settings.local.json), with project values overriding user values.
 * Only fills in vars that are not already set in process.env.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

function readJsonSafe(filePath) {
    try {
        return JSON.parse(readFileSync(filePath, 'utf8'));
    } catch {
        return null;
    }
}

export function loadSettingsEnv() {
    const userSettings = readJsonSafe(join(homedir(), '.claude', 'settings.local.json'));
    const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
    const projectSettings = readJsonSafe(join(projectDir, '.claude', 'settings.local.json'));

    // Merge: user defaults, then project overrides
    const env = {
        ...(userSettings?.env || {}),
        ...(projectSettings?.env || {}),
    };

    // Only set vars that aren't already in process.env
    for (const [key, value] of Object.entries(env)) {
        if (!process.env[key] && value) {
            process.env[key] = value;
        }
    }
}
