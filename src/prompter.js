// Generic options prompter

const ORANGE = '\x1b[38;5;208m';
const WHITE = '\x1b[97m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';
const CYAN = '\x1b[36m';
const HIDE_CURSOR = '\x1b[?25l';
const SHOW_CURSOR = '\x1b[?25h';

function clearLines(count) {
  for (let i = 0; i < count; i++) {
    process.stdout.write('\x1b[1A\x1b[2K');
  }
}

function renderOptions(title, options, selectedIndex) {
  let output = `${DIM}  ${title}${RESET}\n\n`;

  options.forEach((option, index) => {
    const isSelected = index === selectedIndex;
    const prefix = isSelected ? `${ORANGE}❯${RESET}` : ' ';
    const labelColor = isSelected ? WHITE : DIM;
    const descColor = isSelected ? CYAN : DIM;
    output += `${prefix} ${labelColor}${option.label}${RESET} ${descColor}(${option.desc})${RESET}\n`;
  });

  return output;
}

async function promptOptions(title, options, choices = []) {
  const stdin = process.stdin;
  let selectedIndex = 0;
  const totalLines = options.length + 2;

  process.stdout.write(HIDE_CURSOR);
  process.stdout.write(renderOptions(title, options, selectedIndex));

  return new Promise((resolve) => {
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');

    const cleanup = () => {
      stdin.setRawMode(false);
      stdin.removeAllListeners('data');
      process.stdout.write(SHOW_CURSOR);
    };

    const onKey = (key) => {
      if (key === '\x1b[A' && selectedIndex > 0) {
        selectedIndex--;
        clearLines(totalLines);
        process.stdout.write(renderOptions(title, options, selectedIndex));
      } else if (key === '\x1b[B' && selectedIndex < options.length - 1) {
        selectedIndex++;
        clearLines(totalLines);
        process.stdout.write(renderOptions(title, options, selectedIndex));
      } else if (key === '\r' || key === '\n') {
        cleanup();
        resolve(options[selectedIndex].value);
      } else if (key === '\x03') {
        cleanup();
        console.log('\n');
        process.exit();
      }
    };

    stdin.on('data', onKey);
  });
}

module.exports = { promptOptions };
