# aify-claude

Inter-agent communication hub for Claude Code. Message bus + task dispatch + dashboard in Docker.

## First-time Setup

When setting this up, determine the ABSOLUTE PATH to this repo first. All commands below use that path.
On Linux/Mac: use $HOME/aify-claude. On Windows: use the full path like C:/Users/name/aify-claude.

### Option A: Server + Client (same machine, most common)
```bash
# Start the Docker server
bash setup.sh
docker compose up -d --build

# Install MCP client
cd mcp/stdio && npm install && cd ../..

# Register with Claude Code (localhost since same machine)
claude mcp add --scope user aify-claude \
  -e CLAUDE_MCP_SERVER_URL=http://localhost:8800 \
  -- node "ABSOLUTE_PATH_TO_REPO/mcp/stdio/server.js"

# Install slash commands
mkdir -p ~/.claude/commands/aify-claude
cp .claude/commands/*.md ~/.claude/commands/aify-claude/
```

### Option B: Client only (connect to remote server)
```bash
# Install MCP client
cd mcp/stdio && npm install && cd ../..

# Register with Claude Code (replace SERVER_IP with the actual IP)
claude mcp add --scope user aify-claude \
  -e CLAUDE_MCP_SERVER_URL=http://SERVER_IP:8800 \
  -- node "ABSOLUTE_PATH_TO_REPO/mcp/stdio/server.js"

# If the server has an API key set:
# claude mcp add --scope user aify-claude \
#   -e CLAUDE_MCP_SERVER_URL=http://SERVER_IP:8800 \
#   -e CLAUDE_MCP_API_KEY=the-key \
#   -- node "ABSOLUTE_PATH_TO_REPO/mcp/stdio/server.js"

# Install slash commands
mkdir -p ~/.claude/commands/aify-claude
cp .claude/commands/*.md ~/.claude/commands/aify-claude/
```

### Option C: Local only (no Docker, no server)
```bash
cd mcp/stdio && npm install && cd ../..

claude mcp add --scope user aify-claude \
  -- node "ABSOLUTE_PATH_TO_REPO/mcp/stdio/server.js"
```

**After any option: restart Claude Code (close and reopen) for the MCP server to be picked up.**

## Tools (16, prefix cc_)

### Spawning
| Tool | Purpose |
|------|---------|
| `cc_run` | One-shot prompt to a child instance |
| `cc_parallel` | Fan-out N prompts concurrently |
| `cc_review` | Code review via child instance |
| `cc_status` | CLI health check |

### Messaging
| Tool | Purpose |
|------|---------|
| `cc_register` | Register as agent (ID + role) |
| `cc_agents` | List agents with unread counts |
| `cc_send` | Send message to agent (DM) |
| `cc_inbox` | Check inbox (unread only by default) |
| `cc_search` | Search messages + artifacts |

### Sharing
| Tool | Purpose |
|------|---------|
| `cc_share` | Share text/file/image |
| `cc_read` | Read shared artifact |
| `cc_files` | List shared artifacts |

### Dispatch
| Tool | Purpose |
|------|---------|
| `cc_dispatch` | Spawn agent for task (background) |
| `cc_dispatch_wait` | Same, wait for result |

### Management
| Tool | Purpose |
|------|---------|
| `cc_clear` | Clear inbox/shared/agents |
| `cc_dashboard` | Open web dashboard |

## Slash Commands

All at `/aify-claude:<name>`:
run, parallel, review, status, register, agents, send, inbox,
search, share, read, files, dispatch, dispatch-wait, clear, dashboard

## Key Behaviors

- `cc_send` = DM to inbox. `cc_share` = file in shared space.
- `cc_inbox` returns unread only (limit 20). Messages marked read, not deleted.
- Rotation auto-cleans messages older than retention_days (default 90).
- Dashboard at http://SERVER:8800/api/v1/dashboard (auto-refreshes).
- Settings persisted in Docker volume at /data/settings.json.

## Architecture

- Docker service: FastAPI on port 8800, data in /data volume
- MCP client: mcp/stdio/server.js (Node.js, connects via HTTP or local filesystem)
- Slash commands: .claude/commands/ (copy to ~/.claude/commands/aify-claude/)
- Dashboard: service/dashboard.html (SPA with 3 pages)

## Dev Notes

- Server code: `service/routers/api.py` (all message bus endpoints)
- MCP client: `mcp/stdio/server.js` (tools that call the HTTP API)
- Dashboard: `service/dashboard.html` (client-side JS, fetches from API)
- Config: `.env` for Docker, `config/service.json` for service definition
