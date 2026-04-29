#!/usr/bin/env node
import assert from "node:assert/strict";

process.env.AIFY_SERVER_URL = "http://localhost:8800";
process.env.CLAUDE_MCP_SERVER_URL = "http://localhost:8800";
process.env.AIFY_ENVIRONMENT_BRIDGE = "1";
process.env.AIFY_ENVIRONMENT_ID = "windows:test:default";
process.env.AIFY_ENVIRONMENT_LABEL = "Windows test";
process.env.AIFY_ENVIRONMENT_KIND = "windows";
process.env.AIFY_CWD_ROOTS = "C:/";

const { runtimeChildEnv } = await import("../runtimes.js");

const env = runtimeChildEnv({ CODEX_HOME: "/tmp/codex-home" });

assert.equal(env.AIFY_SERVER_URL, "http://localhost:8800");
assert.equal(env.CLAUDE_MCP_SERVER_URL, "http://localhost:8800");
assert.equal(env.CODEX_HOME, "/tmp/codex-home");
assert.equal(env.AIFY_ENVIRONMENT_BRIDGE, undefined);
assert.equal(env.AIFY_ENVIRONMENT_ID, undefined);
assert.equal(env.AIFY_ENVIRONMENT_LABEL, undefined);
assert.equal(env.AIFY_ENVIRONMENT_KIND, undefined);
assert.equal(env.AIFY_CWD_ROOTS, undefined);

console.log("runtime-child-env.test.js: all assertions passed");
