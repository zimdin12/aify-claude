import assert from "node:assert/strict";

const { buildSystemPrompt, buildUserPrompt } = await import("../runtimes.js");

const agentInfo = { role: "coder", instructions: "Own frontend polish." };

const dashboardSystem = buildSystemPrompt("sc-coder", agentInfo, {
  from: "dashboard",
  subject: "Can you check this?",
  requireReply: true,
});
const dashboardUser = buildUserPrompt({
  from: "dashboard",
  type: "request",
  subject: "Can you check this?",
  body: "What is broken?",
  requireReply: true,
});
assert.match(dashboardSystem, /human\/operator/);
assert.match(dashboardSystem, /comms_send\(from="sc-coder", to="dashboard"/);
assert.match(dashboardSystem, /Dashboard is store-only/);
assert.match(dashboardUser, /Reply to the dashboard user with comms_send\(to="dashboard"/);

const channelSystem = buildSystemPrompt("sc-coder", agentInfo, {
  from: "sc-manager",
  subject: "#sand-castle: Who can verify the dashboard?",
  requireReply: false,
});
const channelUser = buildUserPrompt({
  from: "sc-manager",
  type: "request",
  subject: "#sand-castle: Who can verify the dashboard?",
  body: "@sc-coder please verify the chat polish.",
  requireReply: false,
});
assert.match(channelSystem, /channel\/group message/);
assert.match(channelSystem, /Reply in the channel only when you are named/);
assert.match(channelSystem, /managed background run/);
assert.match(channelSystem, /Use comms_send for the current reply/);
assert.match(channelSystem, /proactive status message with comms_send\(to="dashboard"/);
assert.match(channelUser, /Reply with comms_send\(type="response"\) if this message asks/);
assert.match(channelUser, /Reply delivery: send the current reply with comms_send/);
assert.match(channelUser, /Do not create broad acknowledgement loops/);
assert.match(channelUser, /send the dashboard\/human a concise status message/);

const directSystem = buildSystemPrompt("sc-coder", agentInfo, {
  from: "sc-manager",
  subject: "Review this",
  requireReply: true,
});
assert.match(directSystem, /reply with comms_send/);

console.log("managed-message-prompts.test.js: all assertions passed");
