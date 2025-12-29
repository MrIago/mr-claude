// ASCII Banner with colors
// MR in white, CLAUDE in orange
// Centered relative to menu width

const WHITE = '\x1b[97m';
const ORANGE = '\x1b[38;5;208m';
const RESET = '\x1b[0m';
const DIM = '\x1b[2m';

// Menu width reference (longest line in selector)
const MENU_WIDTH = 50;

function centerText(text, width) {
  const visibleLength = text.replace(/\x1b\[[0-9;]*m/g, '').length;
  const padding = Math.max(0, Math.floor((width - visibleLength) / 2));
  return ' '.repeat(padding) + text;
}

function showBanner() {
  const mr = [
    '╔╦╗╦═╗',
    '║║║╠╦╝',
    '╩ ╩╩╚═'
  ];

  const claude = [
    ' ┌─┐┬  ┌─┐┬ ┬┌┬┐┌─┐',
    ' │  │  ├─┤│ │ ││├┤ ',
    ' └─┘┴─┘┴ ┴└─┘─┴┘└─┘'
  ];

  console.log('');
  for (let i = 0; i < 3; i++) {
    const line = `${WHITE}${mr[i]}${RESET}${ORANGE}${claude[i]}${RESET}`;
    console.log(centerText(line, MENU_WIDTH));
  }

  const subtitle = `${DIM}OpenRouter wrapper for Claude Code${RESET}`;
  console.log('');
  console.log(centerText(subtitle, MENU_WIDTH));
}

module.exports = { showBanner, centerText, WHITE, ORANGE, RESET, DIM, MENU_WIDTH };
