// Generic options prompter for Yes/No and multiple choice questions

const ORANGE = '\x1b[38;5;208m';
const WHITE = '\x1b[97m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';
const CYAN = '\x1b[36m';

function renderOptions(title, options, selectedIndex) {
  // Move cursor up to redraw
  const linesToClear = options.length + 2;
  process.stdout.write(`\x1b[${linesToClear}A`);

  console.log(`${DIM}  ${title}${RESET}\n`);

  options.forEach((option, index) => {
    const isSelected = index === selectedIndex;
    const prefix = isSelected ? `${ORANGE}❯${RESET}` : ' ';
    const labelColor = isSelected ? WHITE : DIM;
    const descColor = isSelected ? CYAN : DIM;

    process.stdout.write('\x1b[2K');
    console.log(`${prefix} ${labelColor}${option.label}${RESET} ${descColor}(${option.desc})${RESET}`);
  });
}

async function promptOptions(title, options) {
  const stdin = process.stdin;
  let selectedIndex = 0;

  // Initial render
  console.log(`${DIM}  ${title}${RESET}\n`);
  options.forEach((option, index) => {
    const isSelected = index === selectedIndex;
    const prefix = isSelected ? `${ORANGE}❯${RESET}` : ' ';
    const labelColor = isSelected ? WHITE : DIM;
    const descColor = isSelected ? CYAN : DIM;
    console.log(`${prefix} ${labelColor}${option.label}${RESET} ${descColor}(${option.desc})${RESET}`);
  });

  return new Promise((resolve) => {
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');

    const onKey = (key) => {
      // Arrow up
      if (key === '\x1b[A') {
        selectedIndex = Math.max(0, selectedIndex - 1);
        renderOptions(title, options, selectedIndex);
      }
      // Arrow down
      else if (key === '\x1b[B') {
        selectedIndex = Math.min(options.length - 1, selectedIndex + 1);
        renderOptions(title, options, selectedIndex);
      }
      // Enter
      else if (key === '\r' || key === '\n') {
        stdin.setRawMode(false);
        stdin.removeListener('data', onKey);

        const selected = options[selectedIndex];
        console.log(''); // Space after selection
        resolve(selected.value);
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

module.exports = { promptOptions };
