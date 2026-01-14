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
  const root = document.documentElement;
  
  for (const [name, value] of Object.entries(variables)) {
    root.style.setProperty(name, value);
  }
  
  return true;
}

/**
 * Remove applied CSS variables
 */
function removeCSSVariables(variables) {
  const root = document.documentElement;
  
  for (const name of Object.keys(variables)) {
    root.style.removeProperty(name);
  }
  
  return true;
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
