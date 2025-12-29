// ASCII Banner with colors and screen rendering

const WHITE = '\x1b[97m';
const ORANGE = '\x1b[38;5;208m';
const GREEN = '\x1b[32m';
const RESET = '\x1b[0m';
const DIM = '\x1b[2m';

const MENU_WIDTH = 50;

function centerText(text, width) {
  const visibleLength = text.replace(/\x1b\[[0-9;]*m/g, '').length;
  const padding = Math.max(0, Math.floor((width - visibleLength) / 2));
  return ' '.repeat(padding) + text;
}

function getBanner() {
  const mr = ['╔╦╗╦═╗', '║║║╠╦╝', '╩ ╩╩╚═'];
  const claude = [' ┌─┐┬  ┌─┐┬ ┬┌┬┐┌─┐', ' │  │  ├─┤│ │ ││├┤ ', ' └─┘┴─┘┴ ┴└─┘─┴┘└─┘'];

  let output = '\n';
  for (let i = 0; i < 3; i++) {
    const line = `${WHITE}${mr[i]}${RESET}${ORANGE}${claude[i]}${RESET}`;
    output += centerText(line, MENU_WIDTH) + '\n';
  }
  output += '\n' + centerText(`${DIM}OpenRouter wrapper for Claude Code${RESET}`, MENU_WIDTH) + '\n';
  return output;
}

function getSeparator() {
  return `${DIM}${'─'.repeat(MENU_WIDTH)}${RESET}`;
}

function renderChoices(choices) {
  if (choices.length === 0) return '';

  let output = '\n';
  choices.forEach(choice => {
    output += `  ${GREEN}✓${RESET} ${DIM}${choice.label}:${RESET} ${ORANGE}${choice.value}${RESET}\n`;
  });
  return output;
}

function renderScreen(choices) {
  console.clear();
  process.stdout.write(getBanner());

  if (choices.length > 0) {
    process.stdout.write('\n' + getSeparator());
    process.stdout.write(renderChoices(choices));
    process.stdout.write(getSeparator() + '\n');
  }

  console.log('');
}

function showBanner() {
  process.stdout.write(getBanner());
}

module.exports = { showBanner, renderScreen, getBanner, getSeparator, centerText, WHITE, ORANGE, RESET, DIM, MENU_WIDTH };
