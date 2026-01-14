// Background service worker for the extension

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('CSS Var Themer extension installed');
});

// Message handler
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveTheme') {
    saveTheme(request.theme).then(result => {
      sendResponse(result);
    });
    return true;
  } else if (request.action === 'getThemes') {
    getThemes(request.url).then(themes => {
      sendResponse({ success: true, themes: themes });
    });
    return true;
  } else if (request.action === 'deleteTheme') {
    deleteTheme(request.themeId).then(result => {
      sendResponse(result);
    });
    return true;
  } else if (request.action === 'saveApiKey') {
    saveApiKey(request.apiKey).then(result => {
      sendResponse(result);
    });
    return true;
  } else if (request.action === 'getApiKey') {
    getApiKey().then(apiKey => {
      sendResponse({ success: true, apiKey: apiKey });
    });
    return true;
  }
  
  return true;
});

// Storage functions
async function saveTheme(theme) {
  try {
    const { themes = {} } = await chrome.storage.local.get('themes');
    const themeId = Date.now().toString();
    theme.id = themeId;
    theme.createdAt = new Date().toISOString();
    themes[themeId] = theme;
    await chrome.storage.local.set({ themes });
    return { success: true, themeId: themeId };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function getThemes(url) {
  try {
    const { themes = {} } = await chrome.storage.local.get('themes');
    // Filter themes by URL if provided
    if (url) {
      const hostname = new URL(url).hostname;
      return Object.values(themes).filter(theme => {
        try {
          return new URL(theme.url).hostname === hostname;
        } catch {
          return false;
        }
      });
    }
    return Object.values(themes);
  } catch (error) {
    console.error('Error getting themes:', error);
    return [];
  }
}

async function deleteTheme(themeId) {
  try {
    const { themes = {} } = await chrome.storage.local.get('themes');
    delete themes[themeId];
    await chrome.storage.local.set({ themes });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function saveApiKey(apiKey) {
  try {
    await chrome.storage.local.set({ apiKey });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function getApiKey() {
  try {
    const { apiKey = '' } = await chrome.storage.local.get('apiKey');
    return apiKey;
  } catch (error) {
    console.error('Error getting API key:', error);
    return '';
  }
}
