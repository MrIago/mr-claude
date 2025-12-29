const ORANGE = '\x1b[38;5;208m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';
const HIDE_CURSOR = '\x1b[?25l';
const SHOW_CURSOR = '\x1b[?25h';

const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

async function showLoading(duration = 800) {
  const startTime = Date.now();
  let frameIndex = 0;

  process.stdout.write(HIDE_CURSOR);
  process.stdout.write(`  ${ORANGE}${frames[0]}${RESET} ${DIM}Starting Claude...${RESET}`);

  return new Promise((resolve) => {
    const interval = setInterval(() => {
      frameIndex = (frameIndex + 1) % frames.length;
      process.stdout.write(`\r  ${ORANGE}${frames[frameIndex]}${RESET} ${DIM}Starting Claude...${RESET}`);

      if (Date.now() - startTime >= duration) {
        clearInterval(interval);
        process.stdout.write('\r\x1b[2K');
        process.stdout.write(SHOW_CURSOR);
        resolve();
      }
    }, 80);
  });
}

module.exports = { showLoading };
