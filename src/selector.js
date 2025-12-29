const readline = require('readline');
const { updateLastModel } = require('./config');

const ORANGE = '\x1b[38;5;208m';
const WHITE = '\x1b[97m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';

// Curated list of models that work well with Claude Code
const MODELS = [
  { id: 'anthropic/claude-opus-4', name: 'Claude Opus 4', desc: 'Most capable', tested: true },
  { id: 'anthropic/claude-sonnet-4', name: 'Claude Sonnet 4', desc: 'Balanced', tested: true },
  { id: 'anthropic/claude-haiku-4', name: 'Claude Haiku 4', desc: 'Fast', tested: true },
  { id: 'z-ai/glm-4.7', name: 'GLM 4.7', desc: 'ZhipuAI', tested: true },
  { id: 'custom', name: 'Custom model...', desc: 'Enter model ID manually', tested: false },
];

const WARNING_MESSAGE = `${YELLOW}  ⚠ Models above are tested for Claude Code compatibility.${RESET}
${DIM}    Custom models may have issues with tool use.${RESET}`;

function renderSelector(models, selectedIndex, showWarning = false) {
  // Move cursor up to redraw
  const linesToClear = models.length + 3 + (showWarning ? 2 : 0);
  process.stdout.write(`\x1b[${linesToClear}A`);

  console.log(`${DIM}  Select model (↑↓ navigate, Enter select)${RESET}\n`);

  models.forEach((model, index) => {
    const isSelected = index === selectedIndex;
    const prefix = isSelected ? `${ORANGE}❯${RESET}` : ' ';
    const nameColor = isSelected ? WHITE : DIM;
    const descColor = isSelected ? CYAN : DIM;

    // Clear line and print
    process.stdout.write('\x1b[2K');
    console.log(`${prefix} ${nameColor}${model.name}${RESET} ${descColor}(${model.desc})${RESET}`);
  });

  // Show warning when on custom
  process.stdout.write('\x1b[2K');
  if (showWarning) {
    console.log('');
    console.log(WARNING_MESSAGE);
  } else {
    console.log('');
    console.log('');
  }
}

async function promptCustomModel() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    process.stdout.write(`\n${ORANGE}  Model ID: ${RESET}`);

    // Need to disable raw mode for readline to work
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(false);
    }

    rl.question('', (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function selectModel(lastModel) {
  const stdin = process.stdin;

  // Find last model index or default to 0
  let selectedIndex = 0;
  if (lastModel) {
    const idx = MODELS.findIndex(m => m.id === lastModel);
    if (idx !== -1) selectedIndex = idx;
  }

  // Check if on custom
  const isOnCustom = () => MODELS[selectedIndex].id === 'custom';

  // Initial render
  console.log(`${DIM}  Select model (↑↓ navigate, Enter select)${RESET}\n`);
  MODELS.forEach((model, index) => {
    const isSelected = index === selectedIndex;
    const prefix = isSelected ? `${ORANGE}❯${RESET}` : ' ';
    const nameColor = isSelected ? WHITE : DIM;
    const descColor = isSelected ? CYAN : DIM;
    console.log(`${prefix} ${nameColor}${model.name}${RESET} ${descColor}(${model.desc})${RESET}`);
  });
  console.log('');
  if (isOnCustom()) {
    console.log(WARNING_MESSAGE);
  } else {
    console.log('');
  }

  return new Promise((resolve) => {
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');

    const onKey = async (key) => {
      // Arrow up
      if (key === '\x1b[A') {
        selectedIndex = Math.max(0, selectedIndex - 1);
        renderSelector(MODELS, selectedIndex, isOnCustom());
      }
      // Arrow down
      else if (key === '\x1b[B') {
        selectedIndex = Math.min(MODELS.length - 1, selectedIndex + 1);
        renderSelector(MODELS, selectedIndex, isOnCustom());
      }
      // Enter
      else if (key === '\r' || key === '\n') {
        stdin.setRawMode(false);
        stdin.removeListener('data', onKey);

        const selected = MODELS[selectedIndex];

        if (selected.id === 'custom') {
          const customModel = await promptCustomModel();
          if (customModel) {
            updateLastModel(customModel);
            console.log(`\n${DIM}  Selected:${RESET} ${ORANGE}${customModel}${RESET}\n`);
            resolve(customModel);
          } else {
            // Empty input, default to first model
            const defaultModel = MODELS[0];
            updateLastModel(defaultModel.id);
            console.log(`\n${DIM}  Selected:${RESET} ${ORANGE}${defaultModel.name}${RESET}\n`);
            resolve(defaultModel.id);
          }
        } else {
          updateLastModel(selected.id);
          console.log(`\n${DIM}  Selected:${RESET} ${ORANGE}${selected.name}${RESET}\n`);
          resolve(selected.id);
        }
      }
      // Ctrl+C
      else if (key === '\x03') {
        console.log('\n');
        process.exit();
      }
    };

    stdin.on('data', onKey);
  });
}

module.exports = { selectModel, MODELS };
