# css-var-themer

A powerful toolkit to extract CSS variables from websites and generate themed variants using **real AI-powered transformations**.

## 🚀 Two Ways to Use

### 1. CLI Tool (Command Line)
Extract CSS variables and generate themes from the command line. Perfect for automation and batch processing.

### 2. Chrome Extension
Browser extension with a visual interface to extract, create, and manage themes for any website you visit.

## Features

### CLI Features
- 🌐 **Extract CSS Variables**: Visit any website with a headless browser and extract all CSS custom properties
- 🤖 **True AI-Powered Theme Generation**: Use OpenAI GPT to interpret any theme description and generate appropriate CSS variables
- 💬 **Natural Language Themes**: Describe themes in plain English (e.g., "vibrant and energetic", "calm corporate blue", "retro 80s neon")
- 💾 **Multiple Output Formats**: Get both JSON and ready-to-use CSS files
- ⚡ **Fast & Efficient**: Built with modern tools like Playwright for reliable extraction
- 🔄 **Fallback Mode**: Works with rule-based generation when AI is not available
- 📦 **Zero Configuration**: Works out of the box with sensible defaults

### Chrome Extension Features
- 🔍 **One-Click Extraction**: Extract CSS variables from any website instantly
- 🎨 **Visual Theme Manager**: Create, apply, and manage themes through an intuitive UI
- 💾 **Save & Organize**: Keep unlimited themes per website, stored locally
- 📤 **Export Themes**: Download themes as JSON files to share or backup
- 🔒 **Privacy First**: All data stored locally in your browser

## Installation

### CLI Tool

```bash
# Clone the repository
git clone https://github.com/lukeparkerbg/css-var-themer.git
cd css-var-themer

# Install dependencies
npm install

# (Optional) Install globally to use the 'css-var-themer' command anywhere
npm install -g .
```

### Chrome Extension

1. Navigate to the `extension` folder in this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `extension` folder
5. See `extension/README.md` for detailed installation and usage instructions

## AI Setup (Recommended)

To enable AI-powered theme generation, set your OpenAI API key:

```bash
export OPENAI_API_KEY='your-api-key-here'
```

Or create a `.env` file (remember to add it to `.gitignore`):
```bash
echo "OPENAI_API_KEY=your-api-key-here" > .env
```

**Without an API key**, the tool falls back to rule-based theme generation with predefined transformations.

After global installation, you can use:
```bash
css-var-themer extract --url https://example.com --themes "dark,light"
```

Otherwise, use:
```bash
node cli.js extract --url https://example.com --themes "dark,light"
```

## Usage

### Basic Usage

Extract CSS variables and generate themes with AI:

```bash
# With AI (when OPENAI_API_KEY is set)
OPENAI_API_KEY=your-key node cli.js extract --url https://example.com --themes "dark,light,ocean"
```

### Options

- `-u, --url <url>` (required): Website URL to extract CSS variables from
- `-t, --themes <themes>` (optional): Comma-separated theme descriptions in natural language (default: "dark,light")
- `-o, --output <directory>` (optional): Output directory for generated files (default: "./output")

### Examples with AI-Powered Themes

The beauty of AI-powered theme generation is that you can use **any description**:

```bash
# Simple color-based themes
node cli.js extract --url https://example.com --themes "dark,light,midnight blue"

# Descriptive mood-based themes
node cli.js extract --url https://example.com --themes "professional and clean,warm and welcoming,energetic and bold"

# Style-based themes
node cli.js extract --url https://example.com --themes "retro 80s neon,minimalist nordic,vintage newspaper"

# Seasonal themes
node cli.js extract --url https://example.com --themes "spring garden,summer beach,autumn forest,winter wonderland"

# Brand-inspired themes
node cli.js extract --url https://example.com --themes "tech startup vibrant,corporate conservative,creative agency playful"

# Custom output directory
node cli.js extract --url https://example.com --themes "dark,light" --output ./my-themes
```

### Fallback Mode (Without AI)

If `OPENAI_API_KEY` is not set, the tool uses rule-based transformations for these keywords:
- `dark`, `night` - Dark color schemes
- `light`, `bright` - Light color schemes
- `ocean`, `blue` - Blue-tinted themes
- `forest`, `green` - Green-tinted themes
- `sunset`, `warm` - Warm color tones
- `purple`, `violet` - Purple color schemes
- `grayscale`, `mono` - Monochromatic themes
- `compact`, `dense` - Reduced spacing
- `spacious`, `comfortable` - Increased spacing

## Quick Start Demo

Try the tool with the included example HTML file:

```bash
# 1. Start a local server (in one terminal)
python3 -m http.server 8080

# 2. Run the CLI with AI (in another terminal)
OPENAI_API_KEY=your-key node cli.js extract --url http://localhost:8080/example.html --themes "cyberpunk neon,elegant minimalist,warm cozy cafe"

# 3. Check the output directory
ls -la output/
```

## Output

The tool generates the following files in the output directory:

1. **original-variables.json** - All extracted CSS variables in JSON format
2. **original-variables.css** - Ready-to-use CSS file with original variables
3. **theme-{name}.json** - JSON file for each generated theme
4. **theme-{name}.css** - Ready-to-use CSS file for each theme

### Output Structure

```
output/
├── original-variables.json    # Original CSS variables in JSON
├── original-variables.css     # Original variables as CSS
├── theme-dark.json           # Dark theme in JSON
├── theme-dark.css            # Dark theme as CSS
├── theme-light.json          # Light theme in JSON
└── theme-light.css           # Light theme as CSS
```

### Using Generated CSS Files

Simply include the generated CSS file in your HTML:

```html
<!-- Use the dark theme -->
<link rel="stylesheet" href="output/theme-dark.css">

<!-- Or use the light theme -->
<link rel="stylesheet" href="output/theme-light.css">
```

## How It Works

### AI-Powered Mode (with OPENAI_API_KEY)

1. **Extraction**: The tool uses Playwright (headless Chromium) to visit the target website and extract all CSS variables defined in `:root` and throughout stylesheets
2. **AI Analysis**: The original CSS variables are sent to OpenAI GPT along with your natural language theme description
3. **AI Generation**: GPT analyzes each variable and generates new values that match your theme description:
   - Interprets the mood, style, and intent of your theme description
   - Adjusts colors to match the theme palette and emotional tone
   - Modifies spacing if the theme implies size changes
   - Updates fonts if the theme suggests different typography
4. **Output**: Results are saved as both JSON (for programmatic use) and CSS files (for immediate use)

### Fallback Mode (without API key)

When no API key is provided, the tool uses rule-based transformations for common theme keywords:
- Colors are adjusted using HSV color space manipulation
- Spacing values are scaled based on keywords like "compact" or "spacious"
- Font choices are modified for keywords like "modern" or "classic"

## Examples

### AI-Generated Theme Examples

With AI, the possibilities are limitless. Here are some examples:

#### Input Website Variables
```css
:root {
  --primary-color: #3b82f6;
  --background-color: #ffffff;
  --text-color: #1f2937;
  --spacing: 1rem;
}
```

#### AI-Generated "Cyberpunk Neon" Theme
```css
/* CSS Variables - cyberpunk neon theme */
:root {
  --primary-color: #ff00ff;
  --background-color: #0a0a0a;
  --text-color: #00ffff;
  --spacing: 1rem;
}
```

#### AI-Generated "Warm Cozy Cafe" Theme
```css
/* CSS Variables - warm cozy cafe theme */
:root {
  --primary-color: #8b5a3c;
  --background-color: #f5e6d3;
  --text-color: #4a3728;
  --spacing: 1.2rem;
}
```

#### Fallback "Dark" Theme (rule-based)
```css
/* CSS Variables - dark theme */
:root {
  --primary-color: #0b1a31;
  --background-color: #333333;
  --text-color: #bbbec3;
  --spacing: 1rem;
}
```

## Advanced Usage

### Programmatic Usage

You can also use the modules programmatically in your Node.js applications:

```javascript
import { extractCSSVariables } from './src/extractor.js';
import { generateThemes } from './src/themeGenerator.js';
import { saveToFile } from './src/fileUtils.js';

// Set API key for AI-powered generation
process.env.OPENAI_API_KEY = 'your-api-key';

// Extract variables
const variables = await extractCSSVariables('https://example.com');

// Generate themes with AI (natural language descriptions)
const themes = await generateThemes(variables, [
  'dark mode with purple accents',
  'light and airy spring theme',
  'professional corporate blue'
]);

// Save to files
saveToFile('./output/themes.json', themes);
```

### Environment Variables

- `OPENAI_API_KEY`: OpenAI API key for AI-powered theme generation (required for AI mode)
- `CHROME_PATH`: Custom path to Chrome/Chromium executable
- `DEBUG`: Set to any value to enable detailed error messages

```bash
# Use AI with custom browser path
OPENAI_API_KEY=sk-... CHROME_PATH=/usr/bin/chromium-browser node cli.js extract --url https://example.com
```

## Requirements

- Node.js 14 or higher
- A Chromium-based browser (automatically used if available)
  - The tool will use system Chrome/Chromium if found
  - Falls back to mock data if browser is unavailable (for demonstration)
- OpenAI API key (optional, for AI-powered theme generation)
  - Get your key at https://platform.openai.com/api-keys
  - Without it, the tool uses rule-based transformations

## Troubleshooting

### Browser not found
If you get browser errors, install Chromium:
```bash
# Ubuntu/Debian
sudo apt-get install chromium-browser

# macOS
brew install chromium
```

Or set a custom browser path:
```bash
CHROME_PATH=/path/to/chrome node cli.js extract --url https://example.com
```

### Network errors
If the tool can't access external websites, it will automatically fall back to using mock data for demonstration purposes. For production use, ensure network access is available.

## Chrome Extension Usage

The Chrome extension provides a visual interface for the same functionality. See the `extension/README.md` for detailed instructions.

**Quick Start:**
1. Install the extension (see Installation section above)
2. Navigate to any website
3. Click the extension icon
4. Click "Extract CSS Variables"
5. Enter a theme description and name
6. Click "Generate Theme"
7. Apply, export, or manage your themes!

## Development

### CLI Development

```bash
# Install dependencies
npm install

# Run the CLI
node cli.js extract --url <your-url>

# Run with debug output
DEBUG=1 node cli.js extract --url <your-url>
```

### Extension Development

```bash
# Make changes in the extension/ folder
# Then reload the extension in chrome://extensions/
```

See `extension/README.md` for debugging tips.

## Project Structure

```
css-var-themer/
├── cli.js                 # CLI entry point
├── src/                   # Shared utilities
│   ├── extractor.js      # CSS variable extraction (Node.js)
│   ├── themeGenerator.js # AI theme generation (Node.js)
│   └── fileUtils.js      # File operations
├── extension/            # Chrome extension
│   ├── manifest.json     # Extension config
│   ├── popup.html/css/js # Extension UI
│   ├── content.js        # Page interaction script
│   ├── background.js     # Storage management
│   ├── themeGenerator.js # Browser-compatible theme generation
│   └── README.md         # Extension documentation
├── example.html          # Example HTML with CSS variables
└── README.md            # This file
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC
