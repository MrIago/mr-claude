const fs = require('fs');
const path = require('path');
const { t } = require('./i18n');

const ORANGE = '\x1b[38;5;208m';
const GREEN = '\x1b[32m';
const RESET = '\x1b[0m';
const HIDE_CURSOR = '\x1b[?25l';
const SHOW_CURSOR = '\x1b[?25h';

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
  } catch (e) {}
  return { token: null, lastModel: null, language: null };
}

function resetConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      fs.unlinkSync(CONFIG_FILE);
    }
  } catch (e) {}
}

function saveConfig(config) {
  ensureConfigDir();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), { mode: 0o600 });
}

function hasValidConfig() {
  return !!getConfig().token;
}

async function promptForToken() {
  const stdin = process.stdin;
  const stdout = process.stdout;

  return new Promise((resolve) => {
    stdout.write(`  ${ORANGE}${t('openrouterToken')}${RESET} `);
    stdout.write(SHOW_CURSOR);

    let token = '';
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');

    const cleanup = () => {
      if (stdin.isTTY) {
        stdin.setRawMode(false);
      }
      stdin.removeListener('data', onData);
      stdin.pause();
      stdout.write(SHOW_CURSOR);
    };

    const onData = (char) => {
      if (char === '\n' || char === '\r') {
        cleanup();
        console.log('');

        if (token) {
          const config = getConfig();
          config.token = token;
          saveConfig(config);
          console.log(`  ${GREEN}✓${RESET} ${t('tokenSaved')}\n`);
        }
        resolve(token || null);
      } else if (char === '\x1b' && char.length === 1) {
        // ESC - go back
        cleanup();
        stdout.write('\r\x1b[2K');
        resolve(null);
      } else if (char === '\u0003') {
        cleanup();
        console.log('');
        process.exit();
      } else if (char === '\u007F' || char === '\b') {
        if (token.length > 0) token = token.slice(0, -1);
      } else if (char >= ' ' && !char.startsWith('\x1b')) {
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

function updateLanguage(language) {
  const config = getConfig();
  config.language = language;
  saveConfig(config);
}

module.exports = { getConfig, saveConfig, hasValidConfig, promptForToken, updateLastModel, updateLanguage, resetConfig };
