# aify-claude

Inter-agent communication hub for Claude Code. Message bus + task dispatch + dashboard in Docker.

## First-time Setup (run these commands)

### Option A: Server mode (Docker — run on the machine hosting the message bus)
```bash
cd <this-repo>
bash setup.sh
docker compose up -d --build
# Verify: curl http://localhost:8800/health
```

### Option B: Client mode (connect Claude Code to an existing server)
```bash
cd <this-repo>/mcp/stdio
npm install

# Register MCP server — replace YOUR_SERVER with the actual IP/hostname
claude mcp add --scope user aify-claude \
  -e CLAUDE_MCP_SERVER_URL=http://YOUR_SERVER:8800 \
  -- node "<absolute-path-to-this-repo>/mcp/stdio/server.js"

# Copy slash commands globally
mkdir -p ~/.claude/commands/aify-claude
cp <this-repo>/.claude/commands/*.md ~/.claude/commands/aify-claude/

# Restart Claude Code
```

### Option C: Local mode (no Docker, same-machine only)
```bash
cd <this-repo>/mcp/stdio
npm install

# Register without server URL — uses local filesystem
claude mcp add --scope user aify-claude \
  -- node "<absolute-path-to-this-repo>/mcp/stdio/server.js"
```

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
