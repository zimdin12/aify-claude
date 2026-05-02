#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverText = fs.readFileSync(path.join(__dirname, "..", "server.js"), "utf8");

const start = serverText.indexOf('server.tool(\n  "comms_contracts"');
assert.ok(start >= 0, "comms_contracts tool should exist");

const body = serverText.slice(
  start,
  serverText.indexOf("// ═══════════════════════════════════════════════════════════════════════════════", start + 1),
);

assert.match(body, /"open"/, "contracts tool should expose the open state");
assert.match(body, /params\.set\("state", state \|\| "open"\)/, "contracts tool should default to open contracts");
assert.match(body, /params\.set\("category", category \|\| "direct"\)/, "contracts tool should default to direct contracts");
assert.match(body, /category.*Defaults to direct/s, "contracts tool should describe the direct default");

console.log("comms-contracts-defaults.test.js: all assertions passed");
