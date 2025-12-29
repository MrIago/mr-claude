const fs = require('fs');
const path = require('path');

const CONFIG_DIR = path.join(process.env.HOME || process.env.USERPROFILE, '.mr-claude');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

function ensureConfigDir() {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
  }
}

function getConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    // Ignore errors, return default
  }
  return { token: null, lastModel: null };
}

function saveConfig(config) {
  ensureConfigDir();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), { mode: 0o600 });
}

function hasValidConfig() {
  const config = getConfig();
  return !!config.token;
}

async function promptForToken() {
  const stdin = process.stdin;
  const stdout = process.stdout;

  return new Promise((resolve) => {
    stdout.write('\x1b[33m  OpenRouter Token: \x1b[0m');

    let token = '';
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');

    const onData = (char) => {
      if (char === '\n' || char === '\r') {
        stdin.setRawMode(false);
        stdin.removeListener('data', onData);
        console.log(''); // New line

        // Save token
        const config = getConfig();
        config.token = token;
        saveConfig(config);

        console.log('\x1b[32m  ✓ Token saved securely\x1b[0m');
        resolve(token);
      } else if (char === '\u0003') {
        // Ctrl+C
        console.log('');
        process.exit();
      } else if (char === '\u007F' || char === '\b') {
        // Backspace
        if (token.length > 0) {
          token = token.slice(0, -1);
        }
      } else if (char >= ' ') {
        // Only add printable characters, NO echo at all (silent)
        token += char;
      }
    };

    stdin.on('data', onData);
  });
}

function updateLastModel(model) {
  const config = getConfig();
  config.lastModel = model;
  saveConfig(config);
}

module.exports = { getConfig, saveConfig, hasValidConfig, promptForToken, updateLastModel };
