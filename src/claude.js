const { spawn } = require('child_process');
const path = require('path');

function findClaude() {
  // Try common locations
  const locations = [
    path.join(process.env.HOME || '', '.bun/bin/claude'),
    path.join(process.env.HOME || '', '.local/bin/claude'),
    '/usr/local/bin/claude',
    '/usr/bin/claude',
    'claude' // Fall back to PATH
  ];

  const fs = require('fs');
  for (const loc of locations) {
    if (loc === 'claude' || fs.existsSync(loc)) {
      return loc;
    }
  }

  return 'claude';
}

function runClaude(model, token, args = []) {
  const claudePath = findClaude();

  // Set environment variables for OpenRouter
  const env = {
    ...process.env,
    ANTHROPIC_BASE_URL: 'https://openrouter.ai/api',
    ANTHROPIC_AUTH_TOKEN: token,
    ANTHROPIC_API_KEY: '',
    ANTHROPIC_MODEL: model
  };

  // Spawn Claude with inherited stdio
  const claude = spawn(claudePath, args, {
    env,
    stdio: 'inherit',
    shell: false
  });

  claude.on('error', (err) => {
    if (err.code === 'ENOENT') {
      console.error('\x1b[31mError: Claude Code not found.\x1b[0m');
      console.error('Install it with: npm install -g @anthropic-ai/claude-code');
      process.exit(1);
    }
    throw err;
  });

  claude.on('exit', (code) => {
    process.exit(code || 0);
  });
}

module.exports = { runClaude, findClaude };
