#!/usr/bin/env node

const { showBanner, renderScreen } = require('./banner');
const { getConfig, promptForToken } = require('./config');
const { selectModel } = require('./selector');
const { promptOptions } = require('./prompter');
const { runClaude } = require('./claude');
const { showLoading } = require('./loading');

const ORANGE = '\x1b[38;5;208m';
const GREEN = '\x1b[32m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

async function main() {
  const args = process.argv.slice(2);

  // Parse flags
  let continueFlag = false;
  let dangerousFlag = false;

  for (const arg of args) {
    if (arg === '--continue' || arg === '-c') continueFlag = true;
    if (arg === '--dangerously-skip-permissions' || arg === '-d') dangerousFlag = true;
  }

  // Initial screen
  renderScreen([]);

  // Check/prompt for token
  let config = getConfig();
  if (!config.token) {
    const token = await promptForToken();
    config = { ...config, token };
    renderScreen([{ label: 'Token', value: 'configured' }]);
  }

  const choices = [];
  let model = config.lastModel;
  let shouldContinue = continueFlag;
  let skipPermissions = dangerousFlag;

  // If flags were passed, skip interactive prompts
  if (continueFlag || dangerousFlag) {
    if (!model) {
      model = await selectModel(null, choices);
      choices.push({ label: 'Model', value: model.split('/').pop() });
    }
  } else {
    // Step 1: Model selection
    if (config.lastModel) {
      renderScreen(choices);
      const modelChoice = await promptOptions('Model', [
        { label: 'Same model', desc: config.lastModel.split('/').pop(), value: 'same' },
        { label: 'Change model', desc: 'Select different', value: 'change' }
      ], choices);

      if (modelChoice === 'change') {
        choices.push({ label: 'Model', value: '...' });
        renderScreen(choices);
        model = await selectModel(config.lastModel, choices);
        choices[choices.length - 1].value = model.split('/').pop();
      } else {
        choices.push({ label: 'Model', value: config.lastModel.split('/').pop() });
      }
    } else {
      model = await selectModel(null, choices);
      choices.push({ label: 'Model', value: model.split('/').pop() });
    }

    // Step 2: Conversation
    renderScreen(choices);
    const continueChoice = await promptOptions('Session', [
      { label: 'New conversation', desc: 'Start fresh', value: 'new' },
      { label: 'Continue last', desc: 'Resume previous', value: 'continue' }
    ], choices);
    shouldContinue = continueChoice === 'continue';
    choices.push({ label: 'Session', value: shouldContinue ? 'continue' : 'new' });

    // Step 3: Permissions
    renderScreen(choices);
    const dangerousChoice = await promptOptions('Permissions', [
      { label: 'Normal mode', desc: 'Ask before actions', value: 'normal' },
      { label: 'Skip permissions', desc: 'Auto-approve all', value: 'dangerous' }
    ], choices);
    skipPermissions = dangerousChoice === 'dangerous';
    choices.push({ label: 'Permissions', value: skipPermissions ? 'skip' : 'normal' });
  }

  // Final screen with loading
  renderScreen(choices);
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
