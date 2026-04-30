#!/usr/bin/env node
// Resident Claude live wake must bind to the current Claude process's own
// channel sidecar. A plain Claude tab must not become claude-live just because
// another claude-aify tab on the machine has a live marker.

import assert from "node:assert/strict";

const { selectClaudeChannelMarkerForParent } = await import("../runtime-markers.js");

const newerOtherSession = {
  runtime: "claude-code",
  cwd: "C:/project",
  pid: 101,
  parentPid: 9001,
  channelEnabled: true,
  createdAt: "2026-01-01T00:01:00.000Z",
};
const olderCurrentSession = {
  runtime: "claude-code",
  cwd: "C:/project",
  pid: 102,
  parentPid: 9002,
  channelEnabled: true,
  createdAt: "2026-01-01T00:00:00.000Z",
};
const disabledCurrentSession = {
  runtime: "claude-code",
  cwd: "C:/project",
  pid: 103,
  parentPid: 9002,
  channelEnabled: false,
  createdAt: "2026-01-01T00:02:00.000Z",
};

assert.equal(
  selectClaudeChannelMarkerForParent([newerOtherSession, olderCurrentSession], 9002),
  olderCurrentSession,
  "must choose the marker owned by the current Claude parent process, not the newest marker from another tab",
);

assert.equal(
  selectClaudeChannelMarkerForParent([newerOtherSession, disabledCurrentSession], 9002),
  null,
  "must not bind through a marker from another Claude parent or a non-channel marker",
);

console.log("claude-channel-marker-binding.test.js: all assertions passed");
