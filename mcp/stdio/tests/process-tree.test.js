#!/usr/bin/env node
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { descendantPids, terminateProcessTree } from "../runtimes.js";

function isAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

async function waitForExitOrDead(proc, timeoutMs = 5000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (!isAlive(proc.pid)) return;
    if (proc.exitCode !== null || proc.signalCode !== null) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

if (process.platform === "win32") {
  console.log("process-tree.test.js: skipped on win32");
  process.exit(0);
}

const parent = spawn(process.execPath, [
  "-e",
  `
    const { spawn } = require("node:child_process");
    const child = spawn(process.execPath, ["-e", "setInterval(() => {}, 1000)"], { stdio: "ignore" });
    console.log(child.pid);
    setInterval(() => {}, 1000);
  `,
], { stdio: ["ignore", "pipe", "ignore"] });

const chunks = [];
parent.stdout.on("data", (chunk) => chunks.push(chunk));
await once(parent.stdout, "data");
const childPid = Number(Buffer.concat(chunks).toString("utf8").trim().split(/\s+/)[0]);

assert.ok(Number.isInteger(childPid) && childPid > 0, "child pid should be printed");
assert.ok(descendantPids(parent.pid).includes(childPid), "descendantPids should include spawned child");

terminateProcessTree(parent);
await waitForExitOrDead(parent);
await new Promise((resolve) => setTimeout(resolve, 250));

assert.equal(isAlive(parent.pid), false, "parent process should be terminated");
assert.equal(isAlive(childPid), false, "child process should be terminated with parent tree");

console.log("process-tree.test.js: all assertions passed");
