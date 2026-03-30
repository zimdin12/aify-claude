# aify-claude v3

Inter-agent communication hub for Claude Code. Messaging, channels (group chat), file sharing, triggering, and dashboard.

## First-time Setup

Determine the ABSOLUTE PATH to this repo. On Linux/Mac: `$HOME/aify-claude`. On Windows: `C:/Users/name/aify-claude`.

### Option A: Server + Client (same machine, most common)
```bash
bash setup.sh
docker compose up -d --build
cd mcp/stdio && npm install && cd ../..
claude mcp add --scope user aify-claude \
  -e CLAUDE_MCP_SERVER_URL=http://localhost:8800 \
  -- node "ABSOLUTE_PATH/mcp/stdio/server.js"
mkdir -p ~/.claude/commands/aify-claude
cp .claude/commands/*.md ~/.claude/commands/aify-claude/
```

### Option B: Client only (connect to remote server)
```bash
cd mcp/stdio && npm install && cd ../..
claude mcp add --scope user aify-claude \
  -e CLAUDE_MCP_SERVER_URL=http://SERVER_IP:8800 \
  -- node "ABSOLUTE_PATH/mcp/stdio/server.js"
```

### Option C: Local only (no Docker)
```bash
cd mcp/stdio && npm install && cd ../..
claude mcp add --scope user aify-claude \
  -- node "ABSOLUTE_PATH/mcp/stdio/server.js"
```

**After setup: restart Claude Code.**

## Tools (15)

### Messaging
| Tool | Purpose |
|------|---------|
| `cc_register` | Register as agent (ID, role, cwd, model, instructions) |
| `cc_agents` | List agents with unread counts |
| `cc_send` | Send message. `trigger=true` spawns local Claude instance to handle it |
| `cc_inbox` | Check inbox (unread only, marks read, limit 20) |
| `cc_search` | Search messages + shared artifacts |

### Channels (group chat)
| Tool | Purpose |
|------|---------|
| `cc_channel_create` | Create a channel |
| `cc_channel_join` | Join a channel |
| `cc_channel_send` | Send to channel (all members see it) |
| `cc_channel_read` | Read channel messages |
| `cc_channel_list` | List all channels |

### File sharing
| Tool | Purpose |
|------|---------|
| `cc_share` | Share text/file/image to shared space |
| `cc_read` | Read a shared artifact |
| `cc_files` | List shared artifacts |

### Management
| Tool | Purpose |
|------|---------|
| `cc_clear` | Clear inbox/shared/agents with age filter |
| `cc_dashboard` | Open web dashboard |

## Trigger (same machine)

`cc_send` with `trigger=true` delivers the message AND spawns `claude --print` locally using the target agent's registered cwd/model/instructions. The result is sent back to the sender's inbox. Only works on the same machine (the MCP client spawns the process).

## Key Behaviors

- `cc_send` = DM. `cc_share` = file. `cc_channel_*` = group chat.
- Messages wrapped in code fences to prevent prompt injection.
- Rotation: configurable via dashboard settings (default 90 days).
- Dashboard: http://SERVER:8800/api/v1/dashboard (auto-refreshes).
