#!/usr/bin/env node
import assert from "node:assert/strict";

const { codexTurnSandboxPolicy, managedCodexSandboxMode } = await import("../runtimes.js");

assert.equal(
  managedCodexSandboxMode({}, "managed"),
  "danger-full-access",
  "managed Codex runs should default to the unattended bypass profile",
);

assert.equal(
  managedCodexSandboxMode({}, "resident"),
  "workspace-write",
  "resident Codex runs should keep the safer workspace profile by default",
);

assert.equal(
  managedCodexSandboxMode({ sandboxMode: "workspace-write" }, "managed"),
  "workspace-write",
  "operators can opt out for debugging",
);

assert.deepEqual(
  codexTurnSandboxPolicy("danger-full-access", "/tmp/project", true),
  { type: "dangerFullAccess" },
);

assert.deepEqual(
  codexTurnSandboxPolicy("workspace-write", "/tmp/project", true),
  { type: "workspaceWrite", writableRoots: ["/tmp/project"], networkAccess: true },
);

console.log("managed-codex-permissions.test.js: all assertions passed");
