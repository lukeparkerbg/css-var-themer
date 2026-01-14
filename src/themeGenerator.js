import OpenAI from 'openai';

/**
 * Generate themed variants of CSS variables using AI-powered transformations
 * @param {Object} originalVariables - Original CSS variables
 * @param {Array<string>} themeDescriptions - Array of theme names/descriptions
 * @returns {Promise<Object>} - Object with theme names as keys and their CSS variables as values
 */
export async function generateThemes(originalVariables, themeDescriptions) {
  const themes = {};
  
  // Check if OpenAI API key is available
  const useAI = !!process.env.OPENAI_API_KEY;
  
  if (!useAI) {
    console.warn('⚠️  OPENAI_API_KEY not found. Using fallback rule-based generation.');
    console.warn('   Set OPENAI_API_KEY environment variable to use AI-powered theme generation.\n');
  }
  
  for (const themeName of themeDescriptions) {
    console.log(`  🎨 Generating "${themeName}" theme...`);
    
    if (useAI) {
      try {
        themes[themeName] = await generateThemeWithAI(originalVariables, themeName);
      } catch (error) {
        console.warn(`   ⚠️  AI generation failed for "${themeName}": ${error.message}`);
        console.warn(`   Falling back to rule-based generation...`);
        themes[themeName] = generateThemeVariant(originalVariables, themeName);
      }
    } else {
      themes[themeName] = generateThemeVariant(originalVariables, themeName);
    }
  }
  
  return themes;
}

/**
 * Generate a theme variant using AI (OpenAI GPT)
 * @param {Object} originalVariables - Original CSS variables
 * @param {string} themeDescription - Natural language description of the theme
 * @returns {Promise<Object>} - Themed CSS variables
 */
async function generateThemeWithAI(originalVariables, themeDescription) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  
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

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a CSS theming expert. You generate themed CSS variable values based on theme descriptions. Always respond with valid JSON only, no additional text."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 4096, // Increased to handle larger responses with many CSS variables
  });
  
  const responseText = completion.choices[0].message.content.trim();
  
  // Check if response was truncated due to token limit
  const finishReason = completion.choices[0].finish_reason;
  if (finishReason === 'length') {
    console.warn('Warning: AI response was truncated due to token limit. Some variables may use original values.');
  }
  
  // Extract JSON from the response (in case AI adds markdown code blocks)
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
    // If JSON parsing fails, try to repair incomplete JSON (common when truncated)
    try {
      // Try to close the JSON object if it's incomplete
      let repairedJson = jsonText.trim();
      
      // Remove any incomplete property (anything after the last complete key-value pair)
      if (!repairedJson.endsWith('}')) {
        // Find the last complete property by looking for ," or ,\n patterns
        const lastCompleteProperty = repairedJson.lastIndexOf('",');
        const lastCompletePropertyNewline = repairedJson.lastIndexOf('",\n');
        const lastComplete = Math.max(lastCompleteProperty, lastCompletePropertyNewline);
        
        if (lastComplete !== -1) {
          // Keep everything up to and including the closing quote and comma
          repairedJson = repairedJson.substring(0, lastComplete + 1);
        } else {
          // If no complete property found, try removing content after last comma
          const lastComma = repairedJson.lastIndexOf(',');
          if (lastComma !== -1) {
            repairedJson = repairedJson.substring(0, lastComma);
          }
        }
        
        // Close the JSON object
        repairedJson += '\n}';
      }
      
      themedVariables = JSON.parse(repairedJson);
      console.warn('Repaired incomplete JSON response from AI');
    } catch (repairError) {
      throw new Error(`Failed to parse AI response as JSON: ${error.message}. Response: ${jsonText.substring(0, 200)}`);
    }
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
 * Generate a single theme variant based on the theme description
 * This simulates AI by applying transformations based on theme keywords
 */
function generateThemeVariant(originalVariables, themeName) {
  const themeVariables = {};
  const lowerThemeName = themeName.toLowerCase();
  
  for (const [varName, varValue] of Object.entries(originalVariables)) {
    let newValue = varValue;
    
    // Apply theme-specific transformations based on variable type
    if (isColorValue(varValue)) {
      newValue = transformColorForTheme(varValue, lowerThemeName);
    } else if (isSpacingValue(varValue)) {
      newValue = transformSpacingForTheme(varValue, lowerThemeName);
    } else if (isFontValue(varValue)) {
      newValue = transformFontForTheme(varValue, lowerThemeName);
    }
    
    themeVariables[varName] = newValue;
  }
  
  return themeVariables;
}

/**
 * Check if a value is a color
 */
function isColorValue(value) {
  const colorPatterns = [
    /^#[0-9a-fA-F]{3,8}$/,  // hex colors
    /^rgb\(/,                // rgb
    /^rgba\(/,               // rgba
    /^hsl\(/,                // hsl
    /^hsla\(/,               // hsla
    /^(red|blue|green|white|black|gray|grey|yellow|orange|purple|pink|brown)/i
  ];
  
  return colorPatterns.some(pattern => pattern.test(value.trim()));
}

/**
 * Check if a value is spacing-related
 */
function isSpacingValue(value) {
  return /^[\d.]+(?:px|rem|em|%|vh|vw)$/.test(value.trim()) && 
         !value.includes('font') && 
         !value.includes('weight');
}

/**
 * Check if a value is font-related
 */
function isFontValue(value) {
  return value.includes('font') || 
         /system-ui|sans-serif|serif|monospace|arial|helvetica|courier/i.test(value);
}

/**
 * Transform color based on theme type
 */
function transformColorForTheme(color, themeName) {
  const rgb = parseColorToRGB(color);
  if (!rgb) return color;
  
  let { r, g, b } = rgb;
  
  // Theme-specific color transformations
  if (themeName.includes('dark') || themeName.includes('night')) {
    // Dark theme: invert brightness, increase contrast
    const brightness = (r + g + b) / 3;
    if (brightness > 128) {
      // Light colors become dark
      r = Math.max(0, Math.floor(r * 0.2));
      g = Math.max(0, Math.floor(g * 0.2));
      b = Math.max(0, Math.floor(b * 0.2));
    } else {
      // Dark colors become lighter
      r = Math.min(255, Math.floor(r + (255 - r) * 0.7));
      g = Math.min(255, Math.floor(g + (255 - g) * 0.7));
      b = Math.min(255, Math.floor(b + (255 - b) * 0.7));
    }
  } else if (themeName.includes('light') || themeName.includes('bright')) {
    // Light theme: increase brightness
    const factor = 1.2;
    r = Math.min(255, Math.floor(r * factor));
    g = Math.min(255, Math.floor(g * factor));
    b = Math.min(255, Math.floor(b * factor));
  } else if (themeName.includes('ocean') || themeName.includes('blue')) {
    // Ocean theme: add blue tint
    b = Math.min(255, b + 50);
    r = Math.max(0, r - 20);
  } else if (themeName.includes('forest') || themeName.includes('green')) {
    // Forest theme: add green tint
    g = Math.min(255, g + 50);
    r = Math.max(0, r - 20);
  } else if (themeName.includes('sunset') || themeName.includes('warm')) {
    // Sunset theme: add warm tones
    r = Math.min(255, r + 30);
    g = Math.min(255, g + 10);
    b = Math.max(0, b - 20);
  } else if (themeName.includes('purple') || themeName.includes('violet')) {
    // Purple theme
    r = Math.min(255, r + 40);
    b = Math.min(255, b + 60);
    g = Math.max(0, g - 20);
  } else if (themeName.includes('mono') || themeName.includes('grayscale')) {
    // Monochrome theme
    const gray = Math.floor((r + g + b) / 3);
    r = g = b = gray;
  } else {
    // Default: slight color shift for variety
    const hueShift = Math.floor(Math.random() * 30) - 15;
    const hsv = rgbToHsv(r, g, b);
    hsv.h = (hsv.h + hueShift + 360) % 360;
    const newRgb = hsvToRgb(hsv.h, hsv.s, hsv.v);
    r = newRgb.r;
    g = newRgb.g;
    b = newRgb.b;
  }
  
  return rgbToHex(r, g, b);
}

/**
 * Transform spacing based on theme type
 */
function transformSpacingForTheme(spacing, themeName) {
  if (themeName.includes('compact') || themeName.includes('dense')) {
    return multiplySpacing(spacing, 0.75);
  } else if (themeName.includes('spacious') || themeName.includes('comfortable')) {
    return multiplySpacing(spacing, 1.25);
  }
  return spacing;
}

/**
 * Transform font based on theme type
 */
function transformFontForTheme(font, themeName) {
  if (themeName.includes('modern')) {
    return font.replace(/serif/g, 'sans-serif');
  } else if (themeName.includes('classic') || themeName.includes('traditional')) {
    return font.replace(/sans-serif/g, 'serif');
  } else if (themeName.includes('mono') || themeName.includes('code')) {
    return 'monospace';
  }
  return font;
}

/**
 * Parse color string to RGB values
 */
function parseColorToRGB(color) {
  color = color.trim();
  
  // Hex color
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
  
  // RGB/RGBA
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1]),
      g: parseInt(rgbMatch[2]),
      b: parseInt(rgbMatch[3])
    };
  }
  
  // Named colors (basic set)
  const namedColors = {
    'white': { r: 255, g: 255, b: 255 },
    'black': { r: 0, g: 0, b: 0 },
    'red': { r: 255, g: 0, b: 0 },
    'green': { r: 0, g: 128, b: 0 },
    'blue': { r: 0, g: 0, b: 255 },
    'yellow': { r: 255, g: 255, b: 0 },
    'gray': { r: 128, g: 128, b: 128 },
    'grey': { r: 128, g: 128, b: 128 },
  };
  
  return namedColors[color.toLowerCase()] || null;
}

/**
 * Convert RGB to hex color
 */
function rgbToHex(r, g, b) {
  const toHex = (n) => {
    const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Convert RGB to HSV
 */
function rgbToHsv(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  
  let h = 0;
  const s = max === 0 ? 0 : diff / max;
  const v = max;
  
  if (diff !== 0) {
    if (max === r) {
      h = 60 * ((g - b) / diff + (g < b ? 6 : 0));
    } else if (max === g) {
      h = 60 * ((b - r) / diff + 2);
    } else {
      h = 60 * ((r - g) / diff + 4);
    }
  }
  
  return { h, s, v };
}

/**
 * Convert HSV to RGB
 */
function hsvToRgb(h, s, v) {
  const c = v * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = v - c;
  
  let r, g, b;
  
  if (h < 60) {
    [r, g, b] = [c, x, 0];
  } else if (h < 120) {
    [r, g, b] = [x, c, 0];
  } else if (h < 180) {
    [r, g, b] = [0, c, x];
  } else if (h < 240) {
    [r, g, b] = [0, x, c];
  } else if (h < 300) {
    [r, g, b] = [x, 0, c];
  } else {
    [r, g, b] = [c, 0, x];
  }
  
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255)
  };
}

/**
 * Multiply spacing value by a factor
 */
function multiplySpacing(spacing, factor) {
  const match = spacing.match(/^([\d.]+)(.+)$/);
  if (match) {
    const value = parseFloat(match[1]) * factor;
    const unit = match[2];
    // Format with up to 3 decimal places, removing trailing zeros
    const formatted = parseFloat(value.toFixed(3));
    return `${formatted}${unit}`;
  }
  return spacing;
}
