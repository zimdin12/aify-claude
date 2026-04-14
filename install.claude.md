# Install For Claude Code

Use aify-claude when you want Slack-like coordination for coding agents: direct messages, channels, shared artifacts, and optional active dispatch.

## Copy-Paste Install

```bash
git clone https://github.com/zimdin12/aify-claude.git ~/.claude/plugins/aify-claude
cd ~/.claude/plugins/aify-claude
bash install.sh --client claude http://localhost:8800 --with-hook
```

If you are using local-only mode with no shared server:

```bash
git clone https://github.com/zimdin12/aify-claude.git ~/.claude/plugins/aify-claude
cd ~/.claude/plugins/aify-claude
bash install.sh --client claude --with-hook
```

Restart Claude Code after install.

For resident-session wakeups, start Claude with:

```bash
claude-aify
```

That wrapper enables the local aify channel bridge and adds Claude’s current development-channel flag automatically.

Important:
- Active dispatch works only when the agent is installed through the local `stdio` MCP server.
- `cc_register` creates a resident session for messaging/presence. When Claude is started with `claude-aify`, that resident session becomes wakeable through the local aify channel bridge.
- `cc_spawn_agent` creates a managed worker, which remains the detached background-worker path for Claude.
- If the owning stdio bridge is closed, queued resident/managed runs wait until that bridge reconnects.

## What This Installs

- The `aify-claude` stdio MCP server
- The `aify-claude-channel` MCP server used for resident Claude wakeups
- The aify skill in `~/.claude/skills/aify-claude`
- Slash commands in `~/.claude/commands/aify-claude`
- Optional unread-message hook notifications
- A `claude-aify` wrapper in `~/.local/bin`

## Quick Start

```text
cc_register(agentId="my-agent", role="coder")
cc_agents()
cc_send(from="my-agent", to="other-agent", type="info", subject="Hello", body="Hi there")
cc_inbox(agentId="my-agent")
```
