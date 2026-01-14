// Theme generator utility for browser extension

/**
 * Generate themed variants of CSS variables
 */
async function generateTheme(originalVariables, themeDescription, apiKey) {
  // Check if we should use AI
  if (apiKey && apiKey.trim()) {
    try {
      return await generateThemeWithAI(originalVariables, themeDescription, apiKey);
    } catch (error) {
      console.warn('AI generation failed, falling back to rule-based:', error.message);
      return generateThemeRuleBased(originalVariables, themeDescription);
    }
  } else {
    return generateThemeRuleBased(originalVariables, themeDescription);
  }
}

/**
 * Generate theme using OpenAI API
 */
async function generateThemeWithAI(originalVariables, themeDescription, apiKey) {
  const prompt = `You are a CSS theming expert. Given the following original CSS variables and a theme description, generate new values for each variable that match the theme.

Original CSS Variables:
${JSON.stringify(originalVariables, null, 2)}

Theme Description: "${themeDescription}"

Instructions:
1. Analyze each CSS variable and its current value
2. Based on the theme description, generate appropriate new values
3. For colors: adjust colors to match the theme mood, palette, and style
4. For spacing: adjust if the theme implies compact/spacious/comfortable sizing
5. For fonts: adjust if the theme implies different typography style
6. Maintain the same CSS variable names
7. Ensure all values are valid CSS values
8. Return ONLY a valid JSON object with the CSS variable names as keys and new values as values
9. Do not include any explanatory text, only the JSON object

Example output format:
{
  "--primary-color": "#new-value",
  "--background-color": "#new-value",
  ...
}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a CSS theming expert. You generate themed CSS variable values based on theme descriptions. Always respond with valid JSON only, no additional text.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'API request failed');
  }

  const data = await response.json();
  const responseText = data.choices[0].message.content.trim();

  // Extract JSON from the response
  let jsonText = responseText;
  if (responseText.includes('```')) {
    const match = responseText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (match) {
      jsonText = match[1];
    }
  }

  let themedVariables;
  try {
    themedVariables = JSON.parse(jsonText);
  } catch (error) {
    throw new Error(`Failed to parse AI response: ${error.message}`);
  }

  // Validate that all original variables are present
  for (const key of Object.keys(originalVariables)) {
    if (!(key in themedVariables)) {
      themedVariables[key] = originalVariables[key];
    }
  }

  return themedVariables;
}

/**
 * Generate theme using rule-based transformations
 */
function generateThemeRuleBased(originalVariables, themeDescription) {
  const themeVariables = {};
  const lowerTheme = themeDescription.toLowerCase();

  for (const [varName, varValue] of Object.entries(originalVariables)) {
    let newValue = varValue;

    if (isColorValue(varValue)) {
      newValue = transformColorForTheme(varValue, lowerTheme);
    } else if (isSpacingValue(varValue)) {
      newValue = transformSpacingForTheme(varValue, lowerTheme);
    }

    themeVariables[varName] = newValue;
  }

  return themeVariables;
}

// Helper functions
function isColorValue(value) {
  const colorPatterns = [
    /^#[0-9a-fA-F]{3,8}$/,
    /^rgb\(/,
    /^rgba\(/,
    /^hsl\(/,
    /^hsla\(/,
    /^(red|blue|green|white|black|gray|grey|yellow|orange|purple|pink|brown)/i
  ];
  return colorPatterns.some(pattern => pattern.test(value.trim()));
}

function isSpacingValue(value) {
  return /^[\d.]+(?:px|rem|em|%|vh|vw)$/.test(value.trim());
}

function transformColorForTheme(color, themeName) {
  const rgb = parseColorToRGB(color);
  if (!rgb) return color;

  let { r, g, b } = rgb;

  if (themeName.includes('dark') || themeName.includes('night')) {
    const brightness = (r + g + b) / 3;
    if (brightness > 128) {
      r = Math.max(0, Math.floor(r * 0.2));
      g = Math.max(0, Math.floor(g * 0.2));
      b = Math.max(0, Math.floor(b * 0.2));
    } else {
      r = Math.min(255, Math.floor(r + (255 - r) * 0.7));
      g = Math.min(255, Math.floor(g + (255 - g) * 0.7));
      b = Math.min(255, Math.floor(b + (255 - b) * 0.7));
    }
  } else if (themeName.includes('light') || themeName.includes('bright')) {
    const factor = 1.2;
    r = Math.min(255, Math.floor(r * factor));
    g = Math.min(255, Math.floor(g * factor));
    b = Math.min(255, Math.floor(b * factor));
  } else if (themeName.includes('ocean') || themeName.includes('blue')) {
    b = Math.min(255, b + 50);
    r = Math.max(0, r - 20);
  } else if (themeName.includes('forest') || themeName.includes('green')) {
    g = Math.min(255, g + 50);
    r = Math.max(0, r - 20);
  }

  return rgbToHex(r, g, b);
}

function transformSpacingForTheme(spacing, themeName) {
  if (themeName.includes('compact') || themeName.includes('dense')) {
    return multiplySpacing(spacing, 0.75);
  } else if (themeName.includes('spacious') || themeName.includes('comfortable')) {
    return multiplySpacing(spacing, 1.25);
  }
  return spacing;
}

function parseColorToRGB(color) {
  color = color.trim();

  if (color.startsWith('#')) {
    const hex = color.slice(1);
    if (hex.length === 3) {
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16)
      };
    } else if (hex.length === 6) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16)
      };
    }
  }

  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1]),
      g: parseInt(rgbMatch[2]),
      b: parseInt(rgbMatch[3])
    };
  }

  const namedColors = {
    'white': { r: 255, g: 255, b: 255 },
    'black': { r: 0, g: 0, b: 0 },
    'red': { r: 255, g: 0, b: 0 },
    'green': { r: 0, g: 128, b: 0 },
    'blue': { r: 0, g: 0, b: 255 }
  };

  return namedColors[color.toLowerCase()] || null;
}

function rgbToHex(r, g, b) {
  const toHex = (n) => {
    const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function multiplySpacing(spacing, factor) {
  const match = spacing.match(/^([\d.]+)(.+)$/);
  if (match) {
    const value = parseFloat(match[1]) * factor;
    const unit = match[2];
    const formatted = parseFloat(value.toFixed(3));
    return `${formatted}${unit}`;
  }
  return spacing;
}
