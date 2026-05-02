#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverText = fs.readFileSync(path.join(__dirname, "..", "server.js"), "utf8");

const compactStart = serverText.indexOf('server.tool(\n  "comms_compact"');
assert.ok(compactStart >= 0, "comms_compact tool should exist");

const compactBody = serverText.slice(compactStart, serverText.indexOf('// ═══════════════════════════════════════════════════════════════════════════════', compactStart + 1));

assert.match(compactBody, /mode:\s*z\.enum\(\["handoff",\s*"internal"\]\)/, "compact tool should expose explicit handoff/internal modes");
assert.match(compactBody, /const selectedMode = mode \|\| "handoff"/, "handoff should remain the reliable default");
assert.match(compactBody, /const successorId = newAgentId \|\| targetAgentId/, "handoff should default to the same agent ID");
assert.match(compactBody, /selectedMode === "internal"/, "internal compact should have an explicit branch");
assert.match(compactBody, /internalCompactUnsupportedText\(sourceSession\)/, "unsupported native compact should fail clearly");
assert.match(compactBody, /compactMode:\s*"handoff"/, "handoff spawn metadata should mark compact mode");

console.log("compact-mode-contract.test.js: all assertions passed");
