#!/usr/bin/env node

const { showBanner, renderScreen } = require('./banner');
const { getConfig, promptForToken, updateLanguage, resetConfig, saveConfig } = require('./config');
const { selectModel } = require('./selector');
const { promptOptions } = require('./prompter');
const { runClaude } = require('./claude');
const { showLoading } = require('./loading');
const { t, setLanguage } = require('./i18n');

const SHOW_CURSOR = '\x1b[?25h';

function resetTerminal() {
  process.stdout.write(SHOW_CURSOR);
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(false);
    process.stdin.pause();
    process.stdin.removeAllListeners('data');
  }
}

async function main() {
  const args = process.argv.slice(2);

  // Parse flags
  let continueFlag = false;
  let dangerousFlag = false;

  for (const arg of args) {
    if (arg === '--continue' || arg === '-c') continueFlag = true;
    if (arg === '--dangerously-skip-permissions' || arg === '-d') dangerousFlag = true;
  }

  // State
  let config = getConfig();
  let step = 0;
  let choices = [];
  let model = config.lastModel;
  let shouldContinue = continueFlag;
  let skipPermissions = dangerousFlag;

  // Determine starting step
  const isFirstRun = !config.language;
  const needsToken = !config.token;
  const hasLastModel = !!config.lastModel;

  // Steps for first run: language(0) -> token(1) -> model(2) -> session(3) -> permissions(4)
  // Steps for returning user with model: modelMenu(0) -> [model(1)] -> session(2) -> permissions(3)
  // Steps for returning user without model: model(0) -> session(1) -> permissions(2)

  if (isFirstRun) {
    step = 0; // Start with language
  } else {
    setLanguage(config.language);
    if (needsToken) {
      step = 1; // Start with token
    } else if (hasLastModel) {
      step = 10; // Model menu (use 10+ for returning user flow)
    } else {
      step = 12; // Direct model selection
    }
  }

  // If flags were passed, skip to execution
  if ((continueFlag || dangerousFlag) && config.token && config.lastModel) {
    model = config.lastModel;
    step = 100; // Skip to execution
  }

  // Main loop
  while (step < 100) {
    renderScreen(choices);

    switch (step) {
      // === FIRST RUN FLOW ===
      case 0: { // Language selection
        const languages = [
          { label: 'English', desc: 'Default', value: 'en' },
          { label: 'Portugues', desc: 'Brasil', value: 'pt' },
          { label: 'Espanol', desc: 'Latinoamerica', value: 'es' },
        ];
        const lang = await promptOptions('Language', languages, choices);
        if (lang === null) {
          // Can't go back from first step
          continue;
        }
        setLanguage(lang);
        updateLanguage(lang);
        config = getConfig();
        step = 1;
        break;
      }

      case 1: { // Token input
        const token = await promptForToken();
        if (token === null) {
          // Go back to language
          step = 0;
          continue;
        }
        config = getConfig();
        step = 2;
        break;
      }

      case 2: { // Model selection (first run)
        const selectedModel = await selectModel(null, choices);
        if (selectedModel === null) {
          step = 1;
          continue;
        }
        model = selectedModel;
        choices = [{ label: 'Model', value: model.split('/').pop() }];
        step = 3;
        break;
      }

      case 3: { // Session selection (first run)
        const sessionChoice = await promptOptions(t('session'), [
          { label: t('newConversation'), desc: t('startFresh'), value: 'new' },
          { label: t('continueLast'), desc: t('resumePrevious'), value: 'continue' }
        ], choices);
        if (sessionChoice === null) {
          choices = [];
          step = 2;
          continue;
        }
        shouldContinue = sessionChoice === 'continue';
        choices.push({ label: t('session'), value: shouldContinue ? 'continue' : 'new' });
        step = 4;
        break;
      }

      case 4: { // Permissions selection (first run)
        const permChoice = await promptOptions(t('permissions'), [
          { label: t('normalMode'), desc: t('askBeforeActions'), value: 'normal' },
          { label: t('skipPermissions'), desc: t('autoApproveAll'), value: 'dangerous' }
        ], choices);
        if (permChoice === null) {
          choices.pop(); // Remove session choice
          step = 3;
          continue;
        }
        skipPermissions = permChoice === 'dangerous';
        choices.push({ label: t('permissions'), value: skipPermissions ? 'skip' : 'normal' });
        step = 100; // Done
        break;
      }

      // === RETURNING USER FLOW ===
      case 10: { // Model menu (same/change/reset)
        const modelChoice = await promptOptions('Model', [
          { label: t('sameModel'), desc: config.lastModel.split('/').pop(), value: 'same' },
          { label: t('changeModel'), desc: t('selectDifferent'), value: 'change' },
          { label: t('resetConfig'), desc: t('clearKeysRestart'), value: 'reset' }
        ], choices);

        if (modelChoice === null) {
          // Can't go back from first step of returning user
          continue;
        }

        if (modelChoice === 'reset') {
          resetConfig();
          resetTerminal();
          console.clear();
          const { spawn } = require('child_process');
          spawn(process.argv[0], process.argv.slice(1), {
            stdio: 'inherit',
            shell: false
          });
          return;
        } else if (modelChoice === 'change') {
          step = 11; // Go to model selection
        } else {
          model = config.lastModel;
          choices = [{ label: 'Model', value: model.split('/').pop() }];
          step = 13; // Go to session
        }
        break;
      }

      case 11: { // Model selection (change)
        const selectedModel = await selectModel(config.lastModel, choices);
        if (selectedModel === null) {
          step = 10; // Back to model menu
          continue;
        }
        model = selectedModel;
        choices = [{ label: 'Model', value: model.split('/').pop() }];
        step = 13; // Go to session
        break;
      }

      case 12: { // Model selection (no previous model)
        const selectedModel = await selectModel(null, choices);
        if (selectedModel === null) {
          // Can't go back
          continue;
        }
        model = selectedModel;
        choices = [{ label: 'Model', value: model.split('/').pop() }];
        step = 13;
        break;
      }

      case 13: { // Session selection (returning user)
        const sessionChoice = await promptOptions(t('session'), [
          { label: t('newConversation'), desc: t('startFresh'), value: 'new' },
          { label: t('continueLast'), desc: t('resumePrevious'), value: 'continue' }
        ], choices);
        if (sessionChoice === null) {
          choices = [];
          step = config.lastModel ? 10 : 12;
          continue;
        }
        shouldContinue = sessionChoice === 'continue';
        choices.push({ label: t('session'), value: shouldContinue ? 'continue' : 'new' });
        step = 14;
        break;
      }

      case 14: { // Permissions selection (returning user)
        const permChoice = await promptOptions(t('permissions'), [
          { label: t('normalMode'), desc: t('askBeforeActions'), value: 'normal' },
          { label: t('skipPermissions'), desc: t('autoApproveAll'), value: 'dangerous' }
        ], choices);
        if (permChoice === null) {
          choices.pop();
          step = 13;
          continue;
        }
        skipPermissions = permChoice === 'dangerous';
        choices.push({ label: t('permissions'), value: skipPermissions ? 'skip' : 'normal' });
        step = 100;
        break;
      }

      default:
        step = 100;
    }
  }

  // Final screen with loading
  renderScreen(choices);
  await showLoading();

  // Build claude args
  const claudeArgs = [];
  if (shouldContinue) claudeArgs.push('--continue');
  if (skipPermissions) claudeArgs.push('--dangerously-skip-permissions');

  // Reset terminal before spawning Claude
  resetTerminal();

  // Run Claude
  runClaude(model, config.token, claudeArgs);
}

main().catch(err => {
  console.error('\x1b[31mError:\x1b[0m', err.message);
  process.exit(1);
});
