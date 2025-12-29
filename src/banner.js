// ASCII Banner with colors
// MR in white, CLAUDE in orange

const WHITE = '\x1b[97m';
const ORANGE = '\x1b[38;5;208m';
const RESET = '\x1b[0m';
const DIM = '\x1b[2m';

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
    console.log(`  ${WHITE}${mr[i]}${RESET}${ORANGE}${claude[i]}${RESET}`);
  }
  console.log(`\n  ${DIM}OpenRouter wrapper for Claude Code${RESET}`);
}

module.exports = { showBanner, WHITE, ORANGE, RESET, DIM };
