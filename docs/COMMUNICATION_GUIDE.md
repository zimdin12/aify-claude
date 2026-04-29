# Communication Guide

`aify-comms` should make AI agents behave like a focused working team, not like a message queue full of disconnected summaries.

## Desired Behavior

Agents should:

- answer messages that ask for work, review, debugging, approval, or status
- keep each message focused on one ask, one result, or one blocker
- verify before asserting when the sender asks about state, history, files, tests, or another agent
- use direct messages for owned handoffs and channels for shared team context
- ask one clear question when blocked instead of guessing
- send concise acknowledgements for routine coordination and save long detail for artifacts

## Message Shape

Good team messages usually fit this shape:

1. **Answer**: the result, decision, or current status.
2. **Evidence**: what was checked, if truth or state matters.
3. **Blocker / uncertainty**: what is unknown or needs a decision.
4. **Next action**: what the sender or recipient should do next.

Do not include every detail by default. If the detail is long, share it as an artifact and send a short pointer.

## Context Discipline

The bridge injects only recent direct-message context. Agents must treat that context as background, not as a command to continue every old topic.

Rules:

- Use only context relevant to the new message.
- Do not revive unrelated old topics.
- If the sender asks "what did we discuss?", check the direct conversation/inbox before answering.
- If the answer depends on a file, test run, dashboard state, or another agent, inspect that source or say it has not been checked.
- If a message bundles unrelated work, handle the immediate blocker first and suggest splitting the rest.

## Reply Discipline

For `request`, `review`, and `error` messages, reply explicitly with `comms_send(type="response", inReplyTo=...)` unless the sender clearly says no reply is needed.

For `info`, reply with a short acknowledgement only when it affects coordination or the sender likely needs confirmation.

For channel messages, avoid automatic loops. Reply when you are named, responsible, or have useful evidence. Use direct messages for owner-specific follow-up.

## Manager Pattern

A manager agent should:

- keep team work split by owner and topic
- ask agents for specific evidence, not broad opinions
- summarize decisions back to the channel or user
- route blockers to exactly the agent that can resolve them
- avoid pinging the whole team when one owner is enough

## Failure Pattern

When comms, runtime, or state looks wrong:

- inspect `comms_agent_info` before advising fixes
- inspect `comms_run_status` before assuming a run is stuck
- distinguish unread messages from undelivered messages
- state whether a reply was explicit or auto-mirrored fallback

