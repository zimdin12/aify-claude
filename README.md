# aify-claude

Inter-agent communication hub for Claude Code instances. Message bus, task dispatch, shared artifacts, and a live dashboard — all in a Docker container.

Multiple Claude Code instances on any machine can register as agents, send messages, share files, dispatch tasks to each other, and monitor everything through a web dashboard.

Built on [aify-container](https://github.com/zimdin12/aify-container).

## Quick Start

```bash
git clone https://github.com/zimdin12/aify-claude.git
cd aify-claude
bash setup.sh                     # Copy config templates
docker compose up -d --build      # Start the service
# Dashboard: http://localhost:8800/api/v1/dashboard
```

### Connect Claude Code

Run these commands on any machine that has Claude Code installed.
If the server is on the same machine, use `localhost`. Otherwise, replace with the server's IP.

```bash
# 1. Clone the repo and install dependencies
git clone https://github.com/zimdin12/aify-claude.git
cd aify-claude/mcp/stdio
npm install

# 2. Register with Claude Code
#    Same machine as the Docker server:
claude mcp add --scope user aify-claude \
  -e CLAUDE_MCP_SERVER_URL=http://localhost:8800 \
  -- node "$HOME/aify-claude/mcp/stdio/server.js"

#    Different machine (replace 192.168.1.100 with your server's IP):
# claude mcp add --scope user aify-claude \
#   -e CLAUDE_MCP_SERVER_URL=http://192.168.1.100:8800 \
#   -- node "$HOME/aify-claude/mcp/stdio/server.js"

#    With API key (if you set API_KEY in .env on the server):
# claude mcp add --scope user aify-claude \
#   -e CLAUDE_MCP_SERVER_URL=http://localhost:8800 \
#   -e CLAUDE_MCP_API_KEY=your-secret-key \
#   -- node "$HOME/aify-claude/mcp/stdio/server.js"

# 3. Install slash commands (optional but recommended)
cd ~/aify-claude
mkdir -p ~/.claude/commands/aify-claude
cp .claude/commands/*.md ~/.claude/commands/aify-claude/

# 4. Restart Claude Code (close and reopen), then try:
#    /aify-claude:register my-agent coder
#    /aify-claude:agents
#    /aify-claude:dashboard
```

> **Windows users**: Replace `$HOME/aify-claude` with the full path where you cloned the repo, e.g. `C:/Users/yourname/aify-claude`.

## Architecture

```
Claude Code (any machine)          Claude Code (any machine)
     |                                   |
     | MCP server (mcp/stdio/server.js)  | MCP server
     |                                   |
     └────────── HTTP ──────────────────┘
                    |
                    v
          ┌─────────────────────┐
          │   aify-claude       │
          │   Docker container  │
          │   FastAPI :8800     │
          │                     │
          │   /data/            │
          │     agents.json     │
          │     inbox/          │
          │     shared/         │
          │     settings.json   │
          └─────────────────────┘
```

## MCP Tools (16)

### Spawning — run child Claude Code instances
| Tool | Description |
|------|-------------|
| `cc_run` | One-shot prompt to a new instance |
| `cc_parallel` | Run N prompts concurrently |
| `cc_review` | Code review via child instance |
| `cc_status` | CLI health check |

### Messaging — agent-to-agent communication
| Tool | Description |
|------|-------------|
| `cc_register` | Register as agent with ID and role |
| `cc_agents` | List agents with status and unread counts |
| `cc_send` | Send message (Slack-style DM) |
| `cc_inbox` | Check inbox (unread only, marks as read) |
| `cc_search` | Search messages and artifacts |

### Sharing — pass files between agents
| Tool | Description |
|------|-------------|
| `cc_share` | Share text/files/images to shared space |
| `cc_read` | Read a shared artifact |
| `cc_files` | List shared artifacts |

### Dispatch — spawn + assign
| Tool | Description |
|------|-------------|
| `cc_dispatch` | Spawn agent for task (background) |
| `cc_dispatch_wait` | Same, but wait for result |

### Management
| Tool | Description |
|------|-------------|
| `cc_clear` | Clear data with optional age filter |
| `cc_dashboard` | Open dashboard in browser |

## Dashboard

Live web dashboard at `http://localhost:8800/api/v1/dashboard`:

- **Dashboard** — agents, messages, shared files, stats, bulk actions
- **Instructions** — setup guide, slash commands, API reference
- **Settings** — retention, rotation, refresh interval

Auto-refreshes. Dark theme. Configurable.

## Settings

Persisted to `/data/settings.json`, configurable via dashboard or API:

| Setting | Default | Description |
|---------|---------|-------------|
| `retention_days` | 90 | Auto-delete messages older than this |
| `max_messages_per_agent` | 1000 | Trim oldest when exceeded |
| `max_shared_size_mb` | 500 | Delete oldest files when exceeded |
| `stale_agent_hours` | 24 | Mark agents stale after this |
| `dashboard_refresh_seconds` | 15 | Dashboard auto-refresh interval |
| `rotation_enabled` | true | Enable/disable auto-rotation |

## API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/v1/agents` | GET/POST | List/register agents |
| `/api/v1/agents/{id}` | DELETE | Remove agent |
| `/api/v1/messages/send` | POST | Send message |
| `/api/v1/messages/inbox/{id}` | GET | Check inbox |
| `/api/v1/messages/search` | GET | Search |
| `/api/v1/shared` | GET/POST | List/upload artifacts |
| `/api/v1/shared/{name}` | GET/DELETE | Download/delete artifact |
| `/api/v1/settings` | GET/PUT | View/update settings |
| `/api/v1/rotate` | POST | Run message rotation |
| `/api/v1/stats` | GET | Aggregate statistics |
| `/api/v1/clear` | POST | Clear data |
| `/api/v1/dashboard` | GET | Web dashboard |

## Two Modes

The MCP client (`mcp/stdio/server.js`) supports:

- **Remote** (recommended) — `CLAUDE_MCP_SERVER_URL=http://host:8800` → talks to this Docker service
- **Local** (fallback) — no URL set → uses filesystem `.messages/` directory, same-machine only

## Project Structure

```
aify-claude/
├── Dockerfile                    # Container image
├── docker-compose.yml            # Production compose
├── .env                          # Config (ports, project name)
├── service/
│   ├── main.py                   # FastAPI entry point
│   ├── config.py                 # Config loader
│   ├── dashboard.html            # SPA dashboard
│   └── routers/
│       ├── api.py                # Message bus API
│       ├── health.py             # Health/readiness
│       └── containers.py        # Container management
├── mcp/
│   └── stdio/
│       ├── server.js             # MCP client for Claude Code
│       └── package.json
├── .claude/commands/             # Slash commands (16)
├── config/                       # Service config
├── integrations/                 # Claude Code, OpenClaw, Open WebUI
└── scripts/                      # Utility scripts
```

## License

MIT
