// Popup script for managing the extension UI

let currentVariables = null;
let currentUrl = null;

// DOM elements
const extractBtn = document.getElementById('extractBtn');
const generateBtn = document.getElementById('generateBtn');
const themeDescription = document.getElementById('themeDescription');
const themeName = document.getElementById('themeName');
const apiKeyInput = document.getElementById('apiKey');
const autoSaveApiKey = document.getElementById('autoSaveApiKey');
const extractStatus = document.getElementById('extractStatus');
const generateStatus = document.getElementById('generateStatus');
const variableCount = document.getElementById('variableCount');
const themesList = document.getElementById('themesList');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  // Get current tab URL
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentUrl = tab.url;

  // Load saved API key if user wants it saved
  chrome.storage.local.get(['apiKey', 'autoSaveApiKey'], (result) => {
    if (result.autoSaveApiKey) {
      apiKeyInput.value = result.apiKey || '';
      autoSaveApiKey.checked = true;
    }
  });

  // Load themes for current site
  loadThemes();
});

// Extract CSS variables from current page
extractBtn.addEventListener('click', async () => {
  extractBtn.disabled = true;
  extractBtn.textContent = '🔄 Extracting...';
  showStatus(extractStatus, '', 'info');

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    try {
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'extractVariables' });
      
      if (response && response.success) {
        currentVariables = response.variables;
        const count = response.count;
        
        showStatus(extractStatus, `✅ Successfully extracted ${count} CSS variables!`, 'success');
        variableCount.textContent = `Found ${count} CSS variable${count !== 1 ? 's' : ''}`;
        variableCount.classList.add('show');
        
        // Enable generate button
        generateBtn.disabled = false;
      } else {
        showStatus(extractStatus, '❌ Failed to extract variables', 'error');
      }
    } catch (msgError) {
      // Content script not loaded, try to inject it
      console.log('Content script not loaded, injecting...');
      
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
        
        // Wait a bit for the script to initialize
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Try again
        const retryResponse = await chrome.tabs.sendMessage(tab.id, { action: 'extractVariables' });
        
        if (retryResponse && retryResponse.success) {
          currentVariables = retryResponse.variables;
          const count = retryResponse.count;
          
          showStatus(extractStatus, `✅ Successfully extracted ${count} CSS variables!`, 'success');
          variableCount.textContent = `Found ${count} CSS variable${count !== 1 ? 's' : ''}`;
          variableCount.classList.add('show');
          
          // Enable generate button
          generateBtn.disabled = false;
        } else {
          showStatus(extractStatus, '❌ Failed to extract variables', 'error');
        }
      } catch (injectError) {
        showStatus(extractStatus, `❌ Could not access page: ${injectError.message}`, 'error');
      }
    }
  } catch (error) {
    showStatus(extractStatus, `❌ Error: ${error.message}`, 'error');
  } finally {
    extractBtn.disabled = false;
    extractBtn.textContent = '🔍 Extract CSS Variables';
  }
});

// Generate theme
generateBtn.addEventListener('click', async () => {
  const description = themeDescription.value.trim();
  const name = themeName.value.trim();
  
  if (!description) {
    showStatus(generateStatus, '❌ Please enter a theme description', 'error');
    return;
  }
  
  if (!name) {
    showStatus(generateStatus, '❌ Please enter a theme name', 'error');
    return;
  }
  
  if (!currentVariables) {
    showStatus(generateStatus, '❌ Please extract CSS variables first', 'error');
    return;
  }
  
  generateBtn.disabled = true;
  generateBtn.textContent = '⏳ Generating...';
  showStatus(generateStatus, 'Generating theme...', 'info');
  
  try {
    const apiKey = apiKeyInput.value.trim();
    
    // Save API key if requested
    if (autoSaveApiKey.checked && apiKey) {
      await chrome.runtime.sendMessage({ 
        action: 'saveApiKey', 
        apiKey: apiKey 
      });
    }
    
    // Generate theme
    const themedVariables = await generateTheme(currentVariables, description, apiKey);
    
    // Save theme
    const theme = {
      name: name,
      description: description,
      url: currentUrl,
      variables: themedVariables,
      originalVariables: currentVariables
    };
    
    const saveResult = await chrome.runtime.sendMessage({
      action: 'saveTheme',
      theme: theme
    });
    
    if (saveResult.success) {
      showStatus(generateStatus, `✅ Theme "${name}" created successfully!`, 'success');
      
      // Clear form
      themeDescription.value = '';
      themeName.value = '';
      
      // Reload themes list
      await loadThemes();
    } else {
      showStatus(generateStatus, `❌ Failed to save theme: ${saveResult.error}`, 'error');
    }
  } catch (error) {
    showStatus(generateStatus, `❌ Error: ${error.message}`, 'error');
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = '✨ Generate Theme';
  }
});

// Save auto-save preference
autoSaveApiKey.addEventListener('change', () => {
  chrome.storage.local.set({ autoSaveApiKey: autoSaveApiKey.checked });
});

// Load themes for current site
async function loadThemes() {
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'getThemes',
      url: currentUrl
    });
    
    if (response.success && response.themes.length > 0) {
      renderThemes(response.themes);
    } else {
      themesList.innerHTML = '<p class="empty-state">No themes saved yet. Extract variables and generate a theme to get started!</p>';
    }
  } catch (error) {
    console.error('Error loading themes:', error);
  }
}

// Render themes list
function renderThemes(themes) {
  if (themes.length === 0) {
    themesList.innerHTML = '<p class="empty-state">No themes saved for this site yet.</p>';
    return;
  }
  
  themesList.innerHTML = themes.map(theme => {
    // Get color preview - use more comprehensive color detection
    const colors = Object.entries(theme.variables)
      .filter(([key, value]) => {
        const lowerKey = key.toLowerCase();
        const lowerValue = (value || '').toString().toLowerCase();
        return (lowerKey.includes('color') || lowerKey.includes('bg') || lowerKey.includes('background')) &&
               (value.startsWith('#') || 
                value.startsWith('rgb') || 
                value.startsWith('hsl') ||
                /^(red|blue|green|white|black|gray|grey|yellow|orange|purple|pink|brown)$/i.test(value));
      })
      .slice(0, 5)
      .map(([key, value]) => value);
    
    return `
      <div class="theme-card" data-theme-id="${theme.id}">
        <div class="theme-card-header">
          <span class="theme-name">${escapeHtml(theme.name)}</span>
        </div>
        <div class="theme-description">${escapeHtml(theme.description)}</div>
        ${colors.length > 0 ? `
          <div class="theme-preview">
            ${colors.map(color => `<div class="color-swatch" style="background-color: ${color};"></div>`).join('')}
          </div>
        ` : ''}
        <div class="theme-actions">
          <button class="btn btn-success apply-theme" data-theme-id="${theme.id}">Apply</button>
          <button class="btn btn-secondary export-theme" data-theme-id="${theme.id}">Export</button>
          <button class="btn btn-danger delete-theme" data-theme-id="${theme.id}">Delete</button>
        </div>
      </div>
    `;
  }).join('');
  
  // Add event listeners
  document.querySelectorAll('.apply-theme').forEach(btn => {
    btn.addEventListener('click', () => applyTheme(btn.dataset.themeId, themes));
  });
  
  document.querySelectorAll('.export-theme').forEach(btn => {
    btn.addEventListener('click', () => exportTheme(btn.dataset.themeId, themes));
  });
  
  document.querySelectorAll('.delete-theme').forEach(btn => {
    btn.addEventListener('click', () => deleteTheme(btn.dataset.themeId));
  });
}

// Apply theme to current page
async function applyTheme(themeId, themes) {
  const theme = themes.find(t => t.id === themeId);
  if (!theme) return;
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Ensure content script is loaded by injecting it if needed
    try {
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'applyTheme',
        variables: theme.variables
      });
      
      if (response && response.success) {
        showStatus(extractStatus, `✅ Theme "${theme.name}" applied!`, 'success');
      } else {
        showStatus(extractStatus, `❌ Failed to apply theme`, 'error');
      }
    } catch (msgError) {
      // If sendMessage fails, the content script might not be loaded
      // Try to inject it and then apply
      console.log('Content script not loaded, injecting...');
      
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
        
        // Wait a bit for the script to initialize
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Try again
        const retryResponse = await chrome.tabs.sendMessage(tab.id, {
          action: 'applyTheme',
          variables: theme.variables
        });
        
        if (retryResponse && retryResponse.success) {
          showStatus(extractStatus, `✅ Theme "${theme.name}" applied!`, 'success');
        } else {
          showStatus(extractStatus, `❌ Failed to apply theme`, 'error');
        }
      } catch (injectError) {
        showStatus(extractStatus, `❌ Could not inject content script: ${injectError.message}`, 'error');
      }
    }
  } catch (error) {
    showStatus(extractStatus, `❌ Error applying theme: ${error.message}`, 'error');
  }
}

// Export theme as JSON
function exportTheme(themeId, themes) {
  const theme = themes.find(t => t.id === themeId);
  if (!theme) return;
  
  const dataStr = JSON.stringify(theme, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `theme-${theme.name.replace(/\s+/g, '-').toLowerCase()}.json`;
  link.click();
  
  URL.revokeObjectURL(url);
  showStatus(extractStatus, `✅ Theme exported!`, 'success');
}

// Delete theme
async function deleteTheme(themeId) {
  if (!confirm('Are you sure you want to delete this theme?')) {
    return;
  }
  
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'deleteTheme',
      themeId: themeId
    });
    
    if (response.success) {
      showStatus(extractStatus, '✅ Theme deleted', 'success');
      await loadThemes();
    }
  } catch (error) {
    showStatus(extractStatus, `❌ Error deleting theme: ${error.message}`, 'error');
  }
}

// Helper functions
function showStatus(element, message, type) {
  element.textContent = message;
  element.className = `status show ${type}`;
  
  if (type === 'success' || type === 'error') {
    setTimeout(() => {
      element.classList.remove('show');
    }, 5000);
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
