#!/bin/bash
# Unified installer for aify-claude on Claude Code or Codex.
#
# Usage:
#   bash install.sh --client claude
#   bash install.sh --client codex
#   bash install.sh --client codex http://localhost:8800 --with-hook

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CLIENT="claude"
SERVER_URL=""
WITH_HOOK=false

usage() {
  cat <<EOF
Usage:
  bash install.sh --client <claude|codex> [SERVER_URL] [--with-hook]

Examples:
  bash install.sh --client claude
  bash install.sh --client claude http://localhost:8800 --with-hook
  bash install.sh --client codex http://localhost:8800
EOF
}

while [ $# -gt 0 ]; do
  case "$1" in
    --client)
      CLIENT="${2:-}"
      shift 2
      ;;
    --with-hook)
      WITH_HOOK=true
      shift
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    http*)
      SERVER_URL="$1"
      shift
      ;;
    *)
      echo "Unknown argument: $1"
      usage
      exit 1
      ;;
  esac
done

if [ "$CLIENT" != "claude" ] && [ "$CLIENT" != "codex" ]; then
  echo "Unsupported client: $CLIENT"
  usage
  exit 1
fi

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1"
    exit 1
  fi
}

copy_claude_assets() {
  local skill_dst="$HOME/.claude/skills/aify-claude"
  local commands_dst="$HOME/.claude/commands/aify-claude"
  mkdir -p "$(dirname "$skill_dst")" "$commands_dst"
  rm -rf "$skill_dst"
  cp -R "$SCRIPT_DIR/.claude/skills/aify-claude" "$skill_dst"
  cp -R "$SCRIPT_DIR/.claude/commands/." "$commands_dst/"
}

copy_codex_assets() {
  local codex_home="${CODEX_HOME:-$HOME/.codex}"
  local skill_dst="$codex_home/skills/aify-claude"
  mkdir -p "$(dirname "$skill_dst")"
  rm -rf "$skill_dst"
  cp -R "$SCRIPT_DIR/.agents/skills/aify-claude" "$skill_dst"
}

install_claude_hook() {
  local settings_file="$HOME/.claude/settings.json"
  mkdir -p "$(dirname "$settings_file")"
  if [ ! -f "$settings_file" ]; then
    echo '{}' > "$settings_file"
  fi

  node -e "
    const fs = require('fs');
    const settings = JSON.parse(fs.readFileSync('$settings_file', 'utf-8'));
    if (!settings.hooks) settings.hooks = {};
    if (!settings.hooks.PostToolUse) settings.hooks.PostToolUse = [];
    settings.hooks.PostToolUse = settings.hooks.PostToolUse.filter(
      h => !JSON.stringify(h).includes('notify-check')
    );
    settings.hooks.PostToolUse.push({
      hooks: [{
        type: 'command',
        command: 'node \"$SCRIPT_DIR/mcp/stdio/notify-check.js\"'
      }]
    });
    fs.writeFileSync('$settings_file', JSON.stringify(settings, null, 2));
  "
}

register_stdio_server() {
  local cli="$1"
  local server_name="aify-claude"
  local api_key="${CLAUDE_MCP_API_KEY:-${AIFY_API_KEY:-}}"

  "$cli" mcp remove "$server_name" >/dev/null 2>&1 || true

  if [ -n "$SERVER_URL" ] && [ -n "$api_key" ]; then
    "$cli" mcp add --scope user "$server_name" \
      -e CLAUDE_MCP_SERVER_URL="$SERVER_URL" \
      -e CLAUDE_MCP_API_KEY="$api_key" \
      -- node "$SCRIPT_DIR/mcp/stdio/server.js"
  elif [ -n "$SERVER_URL" ]; then
    "$cli" mcp add --scope user "$server_name" \
      -e CLAUDE_MCP_SERVER_URL="$SERVER_URL" \
      -- node "$SCRIPT_DIR/mcp/stdio/server.js"
  else
    "$cli" mcp add --scope user "$server_name" \
      -- node "$SCRIPT_DIR/mcp/stdio/server.js"
  fi
}

echo "=== aify-claude installer ==="
echo "Repo: $SCRIPT_DIR"
echo "Client: $CLIENT"
echo "Server: ${SERVER_URL:-local mode (no shared server)}"
echo ""

require_cmd node
require_cmd npm
require_cmd "$CLIENT"

echo "[1/4] Installing MCP dependencies..."
cd "$SCRIPT_DIR/mcp/stdio"
npm install --silent
cd "$SCRIPT_DIR"
echo "  Done."

echo "[2/4] Installing agent guidance..."
if [ "$CLIENT" = "claude" ]; then
  copy_claude_assets
else
  copy_codex_assets
fi
echo "  Done."

echo "[3/4] Registering MCP server..."
register_stdio_server "$CLIENT"
echo "  Done."

if [ "$WITH_HOOK" = true ]; then
  echo "[4/4] Installing notification hook..."
  if [ "$CLIENT" = "claude" ]; then
    install_claude_hook
  else
    "$CLIENT" settings set-hook PostToolUse "node \"$SCRIPT_DIR/mcp/stdio/notify-check.js\""
  fi
  echo "  Done."
else
  echo "[4/4] Notification hook skipped (use --with-hook to enable)."
fi

echo ""
echo "=== Installation complete ==="
if [ "$CLIENT" = "claude" ]; then
  echo "Restart Claude Code for changes to take effect."
else
  echo "Restart Codex for changes to take effect."
fi
echo ""
echo "Quick start:"
echo "  cc_register(agentId=\"my-agent\", role=\"coder\")"
echo "  cc_agents()"
echo "  cc_send(from=\"my-agent\", to=\"other-agent\", type=\"info\", subject=\"Hello\", body=\"Hi there\")"
echo "  cc_inbox(agentId=\"my-agent\")"
