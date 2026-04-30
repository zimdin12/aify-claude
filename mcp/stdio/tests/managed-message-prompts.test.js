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
assert.match(dashboardSystem, /final plain text is the chat reply/);
assert.match(dashboardSystem, /stores that final answer in dashboard chat/);
assert.doesNotMatch(dashboardSystem, /comms_send\(from="sc-coder", to="dashboard"/);
assert.match(dashboardUser, /Reply to the dashboard user in final plain text/);

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
assert.match(channelSystem, /Final plain text is the current reply/);
assert.match(channelSystem, /Use comms_send only for separate out-of-band messages/);
assert.match(channelUser, /answer in final plain text/);
assert.match(channelUser, /Reply delivery: final plain text is threaded and delivered/);
assert.match(channelUser, /Do not create broad acknowledgement loops/);
assert.match(channelUser, /Use comms_send only for separate out-of-band updates/);

const directSystem = buildSystemPrompt("sc-coder", agentInfo, {
  from: "sc-manager",
  subject: "Review this",
  requireReply: true,
});
assert.match(directSystem, /put the reply in final plain text/);
assert.match(directSystem, /do not call comms_send for this current reply/);

console.log("managed-message-prompts.test.js: all assertions passed");
