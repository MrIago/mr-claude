#!/usr/bin/env node

const { showBanner } = require('./banner');
const { getConfig, promptForToken, hasValidConfig } = require('./config');
const { selectModel } = require('./selector');
const { promptOptions } = require('./prompter');
const { runClaude } = require('./claude');
const { showLoading } = require('./loading');

async function main() {
  const args = process.argv.slice(2);

  // Parse flags
  let continueFlag = false;
  let dangerousFlag = false;

  for (const arg of args) {
    if (arg === '--continue' || arg === '-c') {
      continueFlag = true;
    }
    if (arg === '--dangerously-skip-permissions' || arg === '-d') {
      dangerousFlag = true;
    }
  }

  // Clear and show banner
  console.clear();
  showBanner();

  // Check/prompt for token
  let config = getConfig();
  if (!config.token) {
    console.log('');
    const token = await promptForToken();
    config = { ...config, token };
  }

  let model = config.lastModel;
  let shouldContinue = continueFlag;
  let skipPermissions = dangerousFlag;

  // If flags were passed, use them directly
  if (continueFlag || dangerousFlag) {
    // If no model saved, must select one
    if (!model) {
      console.log('');
      model = await selectModel(null);
    }
  } else {
    // Interactive flow
    console.log('');

    // If has previous model, ask to keep or change
    if (config.lastModel) {
      const modelChoice = await promptOptions('Model', [
        { label: `Same model`, desc: config.lastModel, value: 'same' },
        { label: 'Change model', desc: 'Select a different model', value: 'change' }
      ]);

      if (modelChoice === 'change') {
        model = await selectModel(config.lastModel);
      }
    } else {
      model = await selectModel(null);
    }

    // Continue conversation?
    const continueChoice = await promptOptions('Conversation', [
      { label: 'New conversation', desc: 'Start fresh', value: 'new' },
      { label: 'Continue last', desc: 'Resume previous session', value: 'continue' }
    ]);
    shouldContinue = continueChoice === 'continue';

    // Dangerous mode?
    const dangerousChoice = await promptOptions('Permissions', [
      { label: 'Normal mode', desc: 'Ask before dangerous actions', value: 'normal' },
      { label: 'Skip permissions', desc: 'Auto-approve all actions', value: 'dangerous' }
    ]);
    skipPermissions = dangerousChoice === 'dangerous';
  }

  // Show loading animation
  await showLoading();

  // Build claude args
  const claudeArgs = [];
  if (shouldContinue) claudeArgs.push('--continue');
  if (skipPermissions) claudeArgs.push('--dangerously-skip-permissions');

  // Run Claude
  runClaude(model, config.token, claudeArgs);
}

main().catch(err => {
  console.error('\x1b[31mError:\x1b[0m', err.message);
  process.exit(1);
});
