const readline = require('readline');
const { updateLastModel } = require('./config');
const { renderScreen } = require('./banner');
const { t } = require('./i18n');

const ORANGE = '\x1b[38;5;208m';
const WHITE = '\x1b[97m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';
const HIDE_CURSOR = '\x1b[?25l';
const SHOW_CURSOR = '\x1b[?25h';

function getModels() {
  return [
    { id: 'anthropic/claude-opus-4', name: 'Claude Opus 4', desc: t('mostCapable') },
    { id: 'anthropic/claude-sonnet-4', name: 'Claude Sonnet 4', desc: t('balanced') },
    { id: 'anthropic/claude-haiku-4', name: 'Claude Haiku 4', desc: t('fast') },
    { id: 'z-ai/glm-4.7', name: 'GLM 4.7', desc: 'ZhipuAI' },
    { id: 'custom', name: t('customModel'), desc: t('enterManually') },
  ];
}

function getWarning() {
  return `${YELLOW}  ${t('modelWarning')}${RESET}`;
}

function clearLines(count) {
  for (let i = 0; i < count; i++) {
    process.stdout.write('\x1b[1A\x1b[2K');
  }
}

function renderModels(models, selectedIndex, showWarning) {
  let output = `${DIM}  ${t('selectModel')} (${t('navigate')}, Enter ${t('select')})${RESET}\n\n`;

  models.forEach((model, index) => {
    const isSelected = index === selectedIndex;
    const prefix = isSelected ? `${ORANGE}❯${RESET}` : ' ';
    const nameColor = isSelected ? WHITE : DIM;
    const descColor = isSelected ? CYAN : DIM;
    output += `${prefix} ${nameColor}${model.name}${RESET} ${descColor}(${model.desc})${RESET}\n`;
  });

  if (showWarning) {
    output += '\n' + getWarning() + '\n';
  } else {
    output += '\n\n';
  }

  return output;
}

async function promptCustomModel() {
  const stdin = process.stdin;
  const stdout = process.stdout;

  return new Promise((resolve) => {
    stdout.write(`${ORANGE}  ${t('modelId')} ${RESET}`);
    stdout.write(SHOW_CURSOR);

    let input = '';
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');

    const cleanup = () => {
      if (stdin.isTTY) {
        stdin.setRawMode(false);
      }
      stdin.removeAllListeners('data');
      stdin.pause();
    };

    const onData = (char) => {
      if (char === '\r' || char === '\n') {
        cleanup();
        console.log('');
        resolve(input.trim() || null);
      } else if (char === '\x1b' && char.length === 1) {
        // ESC - go back
        cleanup();
        stdout.write('\r\x1b[2K');
        resolve(null);
      } else if (char === '\x03') {
        cleanup();
        console.log('');
        process.exit();
      } else if (char === '\u007F' || char === '\b') {
        if (input.length > 0) {
          input = input.slice(0, -1);
          stdout.write('\b \b');
        }
      } else if (char >= ' ' && !char.startsWith('\x1b')) {
        input += char;
        stdout.write(char);
      }
    };

    stdin.on('data', onData);
  });
}

async function selectModel(lastModel, choices = []) {
  const stdin = process.stdin;
  const MODELS = getModels();

  let selectedIndex = 0;
  if (lastModel) {
    const idx = MODELS.findIndex(m => m.id === lastModel);
    if (idx !== -1) selectedIndex = idx;
  }

  const isOnCustom = () => MODELS[selectedIndex].id === 'custom';
  const totalLines = MODELS.length + 4;

  process.stdout.write(HIDE_CURSOR);
  process.stdout.write(renderModels(MODELS, selectedIndex, isOnCustom()));

  return new Promise((resolve) => {
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');

    const cleanup = () => {
      if (stdin.isTTY) {
        stdin.setRawMode(false);
      }
      stdin.removeAllListeners('data');
      stdin.pause();
      process.stdout.write(SHOW_CURSOR);
    };

    const onKey = async (key) => {
      if (key === '\x1b[A' && selectedIndex > 0) {
        selectedIndex--;
        clearLines(totalLines);
        process.stdout.write(renderModels(MODELS, selectedIndex, isOnCustom()));
      } else if (key === '\x1b[B' && selectedIndex < MODELS.length - 1) {
        selectedIndex++;
        clearLines(totalLines);
        process.stdout.write(renderModels(MODELS, selectedIndex, isOnCustom()));
      } else if (key === '\r' || key === '\n') {
        cleanup();

        const selected = MODELS[selectedIndex];

        if (selected.id === 'custom') {
          clearLines(totalLines);
          const customModel = await promptCustomModel();
          if (customModel) {
            updateLastModel(customModel);
            resolve(customModel);
          } else {
            // User pressed ESC or empty input - go back to model selection
            resolve(null);
          }
        } else {
          updateLastModel(selected.id);
          resolve(selected.id);
        }
      } else if (key === '\x1b' && key.length === 1) {
        // ESC key pressed (go back)
        cleanup();
        resolve(null);
      } else if (key === '\x03') {
        cleanup();
        console.log('\n');
        process.exit();
      }
    };

    stdin.on('data', onKey);
  });
}

module.exports = { selectModel, getModels };
