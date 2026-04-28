#!/usr/bin/env node
import assert from "node:assert/strict";

const { isClaudeSessionInUseError } = await import("../runtimes.js");

assert.equal(
  isClaudeSessionInUseError("Error: Session ID e5b70d2b-b700-4b77-a6fe-d65ccb8f84c6 is already in use."),
  true,
);
assert.equal(isClaudeSessionInUseError("Session ID is already in use."), true);
assert.equal(isClaudeSessionInUseError("Claude exited with code 1"), false);
assert.equal(isClaudeSessionInUseError("session lock unavailable"), false);

console.log("claude-session-in-use.test.js: all assertions passed");
