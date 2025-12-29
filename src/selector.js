const readline = require('readline');
const { updateLastModel } = require('./config');

const ORANGE = '\x1b[38;5;208m';
const WHITE = '\x1b[97m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';
const CYAN = '\x1b[36m';

// Curated list of models that work well with Claude Code
const MODELS = [
  { id: 'anthropic/claude-opus-4', name: 'Claude Opus 4', desc: 'Most capable' },
  { id: 'anthropic/claude-sonnet-4', name: 'Claude Sonnet 4', desc: 'Balanced' },
  { id: 'anthropic/claude-haiku-4', name: 'Claude Haiku 4', desc: 'Fast' },
  { id: 'z-ai/glm-4.7', name: 'GLM 4.7', desc: 'ZhipuAI' },
];

function renderSelector(models, selectedIndex) {
  // Move cursor up to redraw
  process.stdout.write(`\x1b[${models.length + 2}A`);

  console.log(`${DIM}Select model (↑↓ to navigate, Enter to select)${RESET}\n`);

  models.forEach((model, index) => {
    const isSelected = index === selectedIndex;
    const prefix = isSelected ? `${ORANGE}❯${RESET}` : ' ';
    const nameColor = isSelected ? WHITE : DIM;
    const descColor = isSelected ? CYAN : DIM;

    // Clear line and print
    process.stdout.write('\x1b[2K');
    console.log(`${prefix} ${nameColor}${model.name}${RESET} ${descColor}(${model.desc})${RESET}`);
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

  // Initial render
  console.log(`${DIM}Select model (↑↓ to navigate, Enter to select)${RESET}\n`);
  MODELS.forEach((model, index) => {
    const isSelected = index === selectedIndex;
    const prefix = isSelected ? `${ORANGE}❯${RESET}` : ' ';
    const nameColor = isSelected ? WHITE : DIM;
    const descColor = isSelected ? CYAN : DIM;
    console.log(`${prefix} ${nameColor}${model.name}${RESET} ${descColor}(${model.desc})${RESET}`);
  });

  return new Promise((resolve) => {
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');

    const onKey = (key) => {
      // Arrow up
      if (key === '\x1b[A') {
        selectedIndex = Math.max(0, selectedIndex - 1);
        renderSelector(MODELS, selectedIndex);
      }
      // Arrow down
      else if (key === '\x1b[B') {
        selectedIndex = Math.min(MODELS.length - 1, selectedIndex + 1);
        renderSelector(MODELS, selectedIndex);
      }
      // Enter
      else if (key === '\r' || key === '\n') {
        stdin.setRawMode(false);
        stdin.removeListener('data', onKey);

        const model = MODELS[selectedIndex];
        updateLastModel(model.id);

        console.log(`\n${DIM}Selected:${RESET} ${ORANGE}${model.name}${RESET}\n`);
        resolve(model.id);
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
