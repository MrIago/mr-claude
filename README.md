# mr-claude

OpenRouter wrapper for Claude Code - Use any model with Claude Code CLI.

```
╔╦╗╦═╗ ┌─┐┬  ┌─┐┬ ┬┌┬┐┌─┐
║║║╠╦╝ │  │  ├─┤│ │ ││├┤
╩ ╩╩╚═ └─┘┴─┘┴ ┴└─┘─┴┘└─┘
```

## Installation

```bash
npm install -g mr-claude
```

## Requirements

- Node.js 18+
- [Claude Code](https://www.npmjs.com/package/@anthropic-ai/claude-code) installed
- [OpenRouter](https://openrouter.ai) API key

## Usage

### Interactive Mode

Just run without arguments:

```bash
mr-claude
```

On first run, you'll be prompted for your OpenRouter token. Then select a model from the interactive menu:

```
╔╦╗╦═╗ ┌─┐┬  ┌─┐┬ ┬┌┬┐┌─┐
║║║╠╦╝ │  │  ├─┤│ │ ││├┤
╩ ╩╩╚═ └─┘┴─┘┴ ┴└─┘─┴┘└─┘

OpenRouter wrapper for Claude Code

Select model (↑↓ to navigate, Enter to select)

❯ Claude Opus 4 (Most capable)
  Claude Sonnet 4 (Balanced)
  Claude Haiku 4 (Fast)
  GLM 4.7 (ZhipuAI)
```

### Headless Mode

For scripts, CI/CD, or programmatic use:

```bash
# Basic usage
mr-claude <model> [claude-code args...]

# Examples
mr-claude anthropic/claude-sonnet-4 --help
mr-claude z-ai/glm-4.7 -p "Hello world"
mr-claude anthropic/claude-opus-4 --dangerously-skip-permissions
```

### With Claude Agent SDK

Perfect for sandbox environments:

```typescript
import { spawn } from 'child_process';

// Run mr-claude as a proxy
const claude = spawn('mr-claude', ['anthropic/claude-sonnet-4', '-p', prompt], {
  stdio: 'pipe'
});
```

## Configuration

Config is stored in `~/.mr-claude/config.json` with secure permissions (600).

### Reset token

Delete the config file to re-enter your token:

```bash
rm ~/.mr-claude/config.json
```

## Available Models

| Model | ID | Description |
|-------|-----|-------------|
| Claude Opus 4 | `anthropic/claude-opus-4` | Most capable |
| Claude Sonnet 4 | `anthropic/claude-sonnet-4` | Balanced |
| Claude Haiku 4 | `anthropic/claude-haiku-4` | Fast |
| GLM 4.7 | `z-ai/glm-4.7` | ZhipuAI |

More models coming soon! PRs welcome.

## How It Works

`mr-claude` sets these environment variables before spawning Claude Code:

```bash
ANTHROPIC_BASE_URL="https://openrouter.ai/api"
ANTHROPIC_AUTH_TOKEN="<your-token>"
ANTHROPIC_API_KEY=""
ANTHROPIC_MODEL="<selected-model>"
```

This makes Claude Code use OpenRouter instead of Anthropic's API.

## License

MIT

## Author

[@MrIago](https://github.com/MrIago)
