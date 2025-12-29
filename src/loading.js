const ORANGE = '\x1b[38;5;208m';
const RESET = '\x1b[0m';

const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

async function showLoading(duration = 1000) {
  const startTime = Date.now();
  let frameIndex = 0;

  process.stdout.write(`${ORANGE}${frames[0]}${RESET} Starting Claude...`);

  return new Promise((resolve) => {
    const interval = setInterval(() => {
      frameIndex = (frameIndex + 1) % frames.length;
      process.stdout.write(`\r${ORANGE}${frames[frameIndex]}${RESET} Starting Claude...`);

      if (Date.now() - startTime >= duration) {
        clearInterval(interval);
        process.stdout.write('\r\x1b[2K'); // Clear line
        resolve();
      }
    }, 80);
  });
}

module.exports = { showLoading };
