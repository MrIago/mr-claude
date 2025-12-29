const readline = require('readline');
const { updateLastModel } = require('./config');
const { renderScreen } = require('./banner');

const ORANGE = '\x1b[38;5;208m';
const WHITE = '\x1b[97m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';
const HIDE_CURSOR = '\x1b[?25l';
const SHOW_CURSOR = '\x1b[?25h';

const MODELS = [
  { id: 'anthropic/claude-opus-4', name: 'Claude Opus 4', desc: 'Most capable' },
  { id: 'anthropic/claude-sonnet-4', name: 'Claude Sonnet 4', desc: 'Balanced' },
  { id: 'anthropic/claude-haiku-4', name: 'Claude Haiku 4', desc: 'Fast' },
  { id: 'z-ai/glm-4.7', name: 'GLM 4.7', desc: 'ZhipuAI' },
  { id: 'custom', name: 'Custom model...', desc: 'Enter manually' },
];

const WARNING = `${YELLOW}  ⚠ Models above are tested. Custom may have issues.${RESET}`;

function clearLines(count) {
  for (let i = 0; i < count; i++) {
    process.stdout.write('\x1b[1A\x1b[2K');
  }
}

function renderModels(models, selectedIndex, showWarning) {
  let output = `${DIM}  Select model (↑↓ navigate, Enter select)${RESET}\n\n`;

  models.forEach((model, index) => {
    const isSelected = index === selectedIndex;
    const prefix = isSelected ? `${ORANGE}❯${RESET}` : ' ';
    const nameColor = isSelected ? WHITE : DIM;
    const descColor = isSelected ? CYAN : DIM;
    output += `${prefix} ${nameColor}${model.name}${RESET} ${descColor}(${model.desc})${RESET}\n`;
  });

  if (showWarning) {
    output += '\n' + WARNING + '\n';
  } else {
    output += '\n\n';
  }

  return output;
}

async function promptCustomModel() {
  process.stdout.write(SHOW_CURSOR);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(`${ORANGE}  Model ID: ${RESET}`, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function selectModel(lastModel, choices = []) {
  const stdin = process.stdin;

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
      stdin.setRawMode(false);
      stdin.removeAllListeners('data');
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
            updateLastModel(MODELS[0].id);
            resolve(MODELS[0].id);
          }
        } else {
          updateLastModel(selected.id);
          resolve(selected.id);
        }
      } else if (key === '\x03') {
        cleanup();
        console.log('\n');
        process.exit();
      }
    };

    stdin.on('data', onKey);
  });
}

module.exports = { selectModel, MODELS };
