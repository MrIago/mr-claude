// Internationalization support

const translations = {
  en: {
    // Banner
    tagline: 'OpenRouter wrapper for Claude Code',

    // Language selection
    selectLanguage: 'Select language',

    // Token
    openrouterToken: 'OpenRouter Token:',
    tokenSaved: 'Token saved',
    tokenConfigured: 'configured',

    // Model menu
    sameModel: 'Same model',
    changeModel: 'Change model',
    selectDifferent: 'Select different',
    resetConfig: 'Reset config',
    clearKeysRestart: 'Clear keys & restart',
    selectModel: 'Select model',
    navigate: 'navigate',
    select: 'select',

    // Models
    mostCapable: 'Most capable',
    balanced: 'Balanced',
    fast: 'Fast',
    customModel: 'Custom model...',
    enterManually: 'Enter manually',
    modelWarning: 'Models above are tested. Custom may have issues.',
    modelId: 'Model ID:',

    // Session
    session: 'Session',
    newConversation: 'New conversation',
    startFresh: 'Start fresh',
    continueLast: 'Continue last',
    resumePrevious: 'Resume previous',

    // Permissions
    permissions: 'Permissions',
    normalMode: 'Normal mode',
    askBeforeActions: 'Ask before actions',
    skipPermissions: 'Skip permissions',
    autoApproveAll: 'Auto-approve all',

    // Loading
    startingClaude: 'Starting Claude...',

    // Errors
    errorClaudeNotFound: 'Claude Code not found.',
    installWith: 'Install it with: npm install -g @anthropic-ai/claude-code',
  },

  pt: {
    // Banner
    tagline: 'Wrapper OpenRouter para Claude Code',

    // Language selection
    selectLanguage: 'Selecione o idioma',

    // Token
    openrouterToken: 'Token OpenRouter:',
    tokenSaved: 'Token salvo',
    tokenConfigured: 'configurado',

    // Model menu
    sameModel: 'Mesmo modelo',
    changeModel: 'Trocar modelo',
    selectDifferent: 'Selecionar outro',
    resetConfig: 'Resetar config',
    clearKeysRestart: 'Limpar keys e reiniciar',
    selectModel: 'Selecione o modelo',
    navigate: 'navegar',
    select: 'selecionar',

    // Models
    mostCapable: 'Mais capaz',
    balanced: 'Equilibrado',
    fast: 'Rapido',
    customModel: 'Modelo custom...',
    enterManually: 'Digitar manualmente',
    modelWarning: 'Modelos acima sao testados. Custom pode ter problemas.',
    modelId: 'ID do Modelo:',

    // Session
    session: 'Sessao',
    newConversation: 'Nova conversa',
    startFresh: 'Comecar do zero',
    continueLast: 'Continuar ultima',
    resumePrevious: 'Retomar anterior',

    // Permissions
    permissions: 'Permissoes',
    normalMode: 'Modo normal',
    askBeforeActions: 'Perguntar antes',
    skipPermissions: 'Pular permissoes',
    autoApproveAll: 'Aprovar tudo',

    // Loading
    startingClaude: 'Iniciando Claude...',

    // Errors
    errorClaudeNotFound: 'Claude Code nao encontrado.',
    installWith: 'Instale com: npm install -g @anthropic-ai/claude-code',
  },

  es: {
    // Banner
    tagline: 'Wrapper OpenRouter para Claude Code',

    // Language selection
    selectLanguage: 'Seleccione el idioma',

    // Token
    openrouterToken: 'Token OpenRouter:',
    tokenSaved: 'Token guardado',
    tokenConfigured: 'configurado',

    // Model menu
    sameModel: 'Mismo modelo',
    changeModel: 'Cambiar modelo',
    selectDifferent: 'Seleccionar otro',
    resetConfig: 'Resetear config',
    clearKeysRestart: 'Limpiar keys y reiniciar',
    selectModel: 'Seleccione el modelo',
    navigate: 'navegar',
    select: 'seleccionar',

    // Models
    mostCapable: 'Mas capaz',
    balanced: 'Equilibrado',
    fast: 'Rapido',
    customModel: 'Modelo custom...',
    enterManually: 'Ingresar manualmente',
    modelWarning: 'Modelos arriba son probados. Custom puede tener problemas.',
    modelId: 'ID del Modelo:',

    // Session
    session: 'Sesion',
    newConversation: 'Nueva conversacion',
    startFresh: 'Empezar de cero',
    continueLast: 'Continuar ultima',
    resumePrevious: 'Reanudar anterior',

    // Permissions
    permissions: 'Permisos',
    normalMode: 'Modo normal',
    askBeforeActions: 'Preguntar antes',
    skipPermissions: 'Saltar permisos',
    autoApproveAll: 'Aprobar todo',

    // Loading
    startingClaude: 'Iniciando Claude...',

    // Errors
    errorClaudeNotFound: 'Claude Code no encontrado.',
    installWith: 'Instale con: npm install -g @anthropic-ai/claude-code',
  }
};

let currentLang = 'en';

function setLanguage(lang) {
  if (translations[lang]) {
    currentLang = lang;
  }
}

function t(key) {
  return translations[currentLang][key] || translations['en'][key] || key;
}

function getLanguage() {
  return currentLang;
}

module.exports = { t, setLanguage, getLanguage, translations };
