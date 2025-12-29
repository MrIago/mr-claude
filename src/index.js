#!/usr/bin/env node

const { showBanner } = require('./banner');
const { getConfig, promptForToken, hasConfig } = require('./config');
const { selectModel } = require('./selector');
const { runClaude } = require('./claude');
const { showLoading } = require('./loading');

async function main() {
  const args = process.argv.slice(2);

  // Headless mode: mr-claude <model> [claude args...]
  if (args.length > 0 && !args[0].startsWith('-')) {
    const model = args[0];
    const claudeArgs = args.slice(1);

    // Check for token
    const config = getConfig();
    if (!config.token) {
      console.error('\x1b[31mError: OpenRouter token not configured.\x1b[0m');
      console.error('Run \x1b[33mmr-claude\x1b[0m without arguments to configure.');
      process.exit(1);
    }

    // Run claude directly with model
    runClaude(model, config.token, claudeArgs);
    return;
  }

  // Interactive mode
  console.clear();
  showBanner();

  // Check/prompt for token
  let config = getConfig();
  if (!config.token) {
    console.log('\n\x1b[90mFirst time setup\x1b[0m\n');
    const token = await promptForToken();
    config = { ...config, token };
  }

  // Select model
  console.log('');
  const model = await selectModel(config.lastModel);

  // Show loading animation
  await showLoading();

  // Run Claude
  runClaude(model, config.token, args);
}

main().catch(err => {
  console.error('\x1b[31mError:\x1b[0m', err.message);
  process.exit(1);
});
