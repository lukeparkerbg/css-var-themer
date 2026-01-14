# CSS Var Themer - Chrome Extension

A Chrome extension that allows you to extract CSS variables from any website, generate AI-powered theme variants, and manage your custom themes.

## Features

- 🔍 **Extract CSS Variables**: Extract all CSS custom properties from any website with one click
- 🤖 **AI-Powered Theme Generation**: Use OpenAI GPT to generate themes based on natural language descriptions
- 💾 **Save & Manage Themes**: Save unlimited theme variants per website
- 🎨 **Apply Themes**: Instantly apply any saved theme to the current page
- 📤 **Export Themes**: Export your themes as JSON files to share or backup
- 🔒 **Privacy First**: All data stored locally in your browser

## Installation

### From Source (Development)

1. Clone this repository or download the `extension` folder
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in the top right)
4. Click "Load unpacked"
5. Select the `extension` folder
6. The extension icon should appear in your toolbar

### Generate Icons (Optional)

The extension needs icon files to work properly. You can:

1. Open `extension/icons/generate-icons.html` in your browser
2. Click each download button to get the icon files
3. Save them in the `extension/icons/` folder
4. Reload the extension in Chrome

Alternatively, create your own icons (16x16, 48x48, and 128x128 pixels).

## Usage

### 1. Extract CSS Variables

1. Navigate to any website
2. Click the CSS Var Themer extension icon
3. Click "Extract CSS Variables"
4. The extension will scan the page and show you how many variables were found

### 2. Generate a Theme

1. After extracting variables, enter a theme description (e.g., "dark mode", "cyberpunk neon", "warm and cozy")
2. Give your theme a name
3. (Optional) Enter your OpenAI API key for AI-powered generation
4. Click "Generate Theme"

### 3. Manage Themes

- **Apply**: Click "Apply" on any saved theme to instantly apply it to the current page
- **Export**: Click "Export" to download the theme as a JSON file
- **Delete**: Click "Delete" to remove a theme from your collection

## AI-Powered Themes

For the best results, use your OpenAI API key:

1. Get an API key from [OpenAI](https://platform.openai.com/api-keys)
2. Enter it in the "OpenAI API Key" field
3. Check "Remember API Key" to save it for future use

Without an API key, the extension uses rule-based theme generation for common keywords like "dark", "light", "ocean", etc.

## Theme Descriptions

With AI, you can use any natural language description:

- Simple: "dark", "light", "blue"
- Descriptive: "warm and welcoming", "professional corporate"
- Creative: "cyberpunk neon", "vintage newspaper", "retro 80s"
- Seasonal: "spring garden", "winter wonderland"
- Mood-based: "energetic and bold", "calm and peaceful"

## Storage

All themes are stored locally in your browser using Chrome's storage API. Your data:
- Never leaves your computer (except API calls to OpenAI if you use AI generation)
- Is private to you
- Persists across browser sessions
- Can be exported as JSON files

## File Structure

```
extension/
├── manifest.json          # Extension configuration
├── popup.html            # Extension popup UI
├── popup.css             # Popup styling
├── popup.js              # Popup logic and event handlers
├── content.js            # Content script for CSS extraction/application
├── background.js         # Background service worker for storage
├── themeGenerator.js     # Theme generation logic (AI + rule-based)
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md            # This file
```

## Development

### Testing Locally

1. Make changes to the extension files
2. Go to `chrome://extensions/`
3. Click the reload icon on the CSS Var Themer card
4. Test your changes

### Debugging

- **Popup**: Right-click the extension icon > "Inspect popup"
- **Content Script**: Open DevTools on any page > Console tab
- **Background**: Go to `chrome://extensions/` > Click "service worker" under CSS Var Themer

## Privacy & Security

- No data is collected or sent to external servers (except OpenAI when using AI features)
- API keys are stored locally and encrypted by Chrome
- All theme data stays in your browser
- No tracking or analytics

## Troubleshooting

### "No CSS variables found"
- Some websites don't use CSS variables
- Try a different website like GitHub, Tailwind CSS docs, or modern web apps
- Open `extension/test-page.html` in your browser as a test

### "Failed to extract variables"
- Refresh the page and try again
- Check if the website has Content Security Policy restrictions
- The extension will automatically inject the content script if needed

### Theme not applying correctly
- **Fixed in latest version**: The extension now uses `!important` CSS rules to ensure themes override page styles
- Look for a green notification in the top-right corner when theme is applied
- Check browser console (F12) for "CSS Var Themer: Applied X variables" message
- If still not working, reload the extension and try again
- Some pages with very strict CSP policies may block theme application

### "AI generation failed"
- Check your API key is valid
- Ensure you have API credits available
- The extension will fall back to rule-based generation

### Testing the Extension
1. Open `extension/test-page.html` in Chrome
2. Use the extension to extract variables and create themes
3. Apply themes to see immediate visual changes

## Related

This extension is part of the CSS Var Themer project. Check out the CLI version for batch processing and automation:
- GitHub: [lukeparkerbg/css-var-themer](https://github.com/lukeparkerbg/css-var-themer)

## Changelog

### Latest Update
- **Fixed**: Theme application now works correctly with `!important` CSS injection
- **Added**: Visual notification when theme is applied
- **Improved**: Better error handling and content script injection
- **Added**: Test page for trying the extension

## License

ISC License - See main project repository for details
