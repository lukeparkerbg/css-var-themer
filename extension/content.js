// Content script for extracting and applying CSS variables

/**
 * Extract all CSS variables from the current page
 */
function extractCSSVariables() {
  const variables = {};
  
  // Function to get computed styles from an element
  function getCSSVariables(element) {
    const styles = window.getComputedStyle(element);
    
    // Iterate through all CSS properties
    for (let i = 0; i < styles.length; i++) {
      const propertyName = styles[i];
      
      // Check if it's a CSS variable (starts with --)
      if (propertyName.startsWith('--')) {
        const value = styles.getPropertyValue(propertyName).trim();
        if (value) {
          variables[propertyName] = value;
        }
      }
    }
  }
  
  // Get variables from :root and document element
  getCSSVariables(document.documentElement);
  
  // Also check all stylesheets for CSS variable definitions
  try {
    for (const sheet of document.styleSheets) {
      try {
        const rules = sheet.cssRules || sheet.rules;
        if (rules) {
          for (const rule of rules) {
            if (rule.style) {
              for (let i = 0; i < rule.style.length; i++) {
                const propertyName = rule.style[i];
                if (propertyName.startsWith('--')) {
                  const value = rule.style.getPropertyValue(propertyName).trim();
                  if (value && !variables[propertyName]) {
                    variables[propertyName] = value;
                  }
                }
              }
            }
          }
        }
      } catch (e) {
        // Skip cross-origin stylesheets and other access errors
        if (e.name !== 'SecurityError') {
          console.warn('Stylesheet access error:', e);
        }
      }
    }
  } catch (e) {
    // Silently handle stylesheet access errors
  }
  
  return variables;
}

/**
 * Apply CSS variables to the current page
 */
function applyCSSVariables(variables) {
  try {
    const root = document.documentElement;
    
    // First, create a style element to ensure our variables take precedence
    let styleEl = document.getElementById('css-var-themer-override');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'css-var-themer-override';
      document.head.appendChild(styleEl);
    }
    
    // Build CSS rules with !important to ensure they override existing styles
    const cssRules = [':root {'];
    for (const [name, value] of Object.entries(variables)) {
      // Apply inline for immediate effect
      root.style.setProperty(name, value);
      // Also add to style element with !important for persistence
      cssRules.push(`  ${name}: ${value} !important;`);
    }
    cssRules.push('}');
    
    styleEl.textContent = cssRules.join('\n');
    
    // Add a visual indicator that theme is applied
    console.log('CSS Var Themer: Applied', Object.keys(variables).length, 'variables');
    showNotification('Theme applied successfully! ✓');
    
    return true;
  } catch (error) {
    console.error('CSS Var Themer: Error applying variables', error);
    return false;
  }
}

/**
 * Show a temporary notification on the page
 */
function showNotification(message) {
  // Remove existing notification if any
  const existing = document.getElementById('css-var-themer-notification');
  if (existing) {
    existing.remove();
  }
  
  // Add animation styles once if not already present
  if (!document.getElementById('css-var-themer-styles')) {
    const style = document.createElement('style');
    style.id = 'css-var-themer-styles';
    style.textContent = `
      @keyframes cssVarThemerSlideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes cssVarThemerSlideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Create notification element
  const notification = document.createElement('div');
  notification.id = 'css-var-themer-notification';
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #10b981;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 14px;
    font-weight: 500;
    animation: cssVarThemerSlideIn 0.3s ease-out;
  `;
  
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'cssVarThemerSlideOut 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

/**
 * Remove applied CSS variables
 */
function removeCSSVariables(variables) {
  try {
    const root = document.documentElement;
    
    // Remove inline styles
    for (const name of Object.keys(variables)) {
      root.style.removeProperty(name);
    }
    
    // Remove style element
    const styleEl = document.getElementById('css-var-themer-override');
    if (styleEl) {
      styleEl.remove();
    }
    
    console.log('CSS Var Themer: Removed theme');
    
    return true;
  } catch (error) {
    console.error('CSS Var Themer: Error removing variables', error);
    return false;
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractVariables') {
    const variables = extractCSSVariables();
    sendResponse({ success: true, variables: variables, count: Object.keys(variables).length });
  } else if (request.action === 'applyTheme') {
    const success = applyCSSVariables(request.variables);
    sendResponse({ success: success });
  } else if (request.action === 'removeTheme') {
    const success = removeCSSVariables(request.variables);
    sendResponse({ success: success });
  }
  
  return true; // Keep the message channel open for async response
});
