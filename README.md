# mr-claude

OpenRouter wrapper for Claude Code - Use any model with Claude Code CLI.

```
    ╔╦╗╦═╗ ┌─┐┬  ┌─┐┬ ┬┌┬┐┌─┐
    ║║║╠╦╝ │  │  ├─┤│ │ ││├┤
    ╩ ╩╩╚═ └─┘┴─┘┴ ┴└─┘─┴┘└─┘
   OpenRouter wrapper for Claude Code
```

## For LLMs / AI Agents

If a user asks you to install mr-claude, run these commands:

```bash
# 1. Install globally
npm install -g mr-claude

# 2. Run it
mr-claude

# 3. User will be prompted to:
#    - Select language (EN/PT/ES)
#    - Paste OpenRouter API key
#    - Choose model
#    - Select session options
```

**What it does:** Wraps Claude Code CLI to use any OpenRouter model instead of just Anthropic models.

---

## Installation

```bash
npm install -g mr-claude
```

## Requirements

- Node.js 18+
- [Claude Code](https://www.npmjs.com/package/@anthropic-ai/claude-code) installed
- [OpenRouter](https://openrouter.ai) API key

## Usage

```bash
mr-claude
```

On first run, you'll be prompted for your OpenRouter token (input is hidden for security).

Then navigate through the interactive menus:

```
  Select model (↑↓ navigate, Enter select)

❯ Claude Opus 4 (Most capable)
  Claude Sonnet 4 (Balanced)
  Claude Haiku 4 (Fast)
  GLM 4.7 (ZhipuAI)
  Custom model... (Enter model ID manually)
```

```
  Conversation

❯ New conversation (Start fresh)
  Continue last (Resume previous session)
```

```
  Permissions

❯ Normal mode (Ask before dangerous actions)
  Skip permissions (Auto-approve all actions)
```

### Flags

Skip menus with flags:

```bash
# Continue last conversation
mr-claude --continue
mr-claude -c

# Skip permissions (dangerous mode)
mr-claude --dangerously-skip-permissions
mr-claude -d

# Combine flags
mr-claude -c -d
```

## Custom Models

Select "Custom model..." to use any OpenRouter model:

```
❯ Custom model... (Enter model ID manually)

  ⚠ Models above are tested for Claude Code compatibility.
    Custom models may have issues with tool use.

  Model ID: openai/gpt-4o
```

## Configuration

Config is stored in `~/.mr-claude/config.json` with secure permissions (600).

### Reset configuration

```bash
rm ~/.mr-claude/config.json
```

## Tested Models

| Model | ID | Notes |
|-------|-----|-------|
| Claude Opus 4 | `anthropic/claude-opus-4` | Most capable |
| Claude Sonnet 4 | `anthropic/claude-sonnet-4` | Balanced |
| Claude Haiku 4 | `anthropic/claude-haiku-4` | Fast |
| GLM 4.7 | `z-ai/glm-4.7` | ZhipuAI |

More models coming soon! PRs welcome.

## How It Works

`mr-claude` sets environment variables before spawning Claude Code:

```bash
ANTHROPIC_BASE_URL="https://openrouter.ai/api"
ANTHROPIC_AUTH_TOKEN="<your-token>"
ANTHROPIC_API_KEY=""
ANTHROPIC_MODEL="<selected-model>"
```

This routes Claude Code through OpenRouter.

## Compatibility

| OS | Status |
|----|--------|
| Linux | ✅ Native |
| macOS | ✅ Native |
| Windows | ✅ Native |

**No external dependencies!** Pure Node.js.

## License

MIT

## Author

[@MrIago](https://github.com/MrIago)
