# css-var-themer

A powerful CLI tool to extract CSS variables from websites and generate themed variants using AI-powered transformations.

## Features

- 🌐 **Extract CSS Variables**: Visit any website with a headless browser and extract all CSS custom properties
- 🎨 **AI-Powered Theme Generation**: Automatically generate theme variants based on your descriptions
- 💾 **Multiple Output Formats**: Get both JSON and ready-to-use CSS files
- ⚡ **Fast & Efficient**: Built with modern tools like Playwright for reliable extraction
- 🎯 **Smart Color Transformations**: Intelligent color modifications based on theme type (dark, light, ocean, etc.)
- 📦 **Zero Configuration**: Works out of the box with sensible defaults

## Installation

```bash
# Clone the repository
git clone https://github.com/lukeparkerbg/css-var-themer.git
cd css-var-themer

# Install dependencies
npm install

# (Optional) Install globally to use the 'css-var-themer' command anywhere
npm install -g .
```

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

Extract CSS variables and generate themes:

```bash
node cli.js extract --url https://example.com --themes "dark,light,ocean"
```

### Options

- `-u, --url <url>` (required): Website URL to extract CSS variables from
- `-t, --themes <themes>` (optional): Comma-separated list of theme names/descriptions (default: "dark,light")
- `-o, --output <directory>` (optional): Output directory for generated files (default: "./output")

### Examples

```bash
# Generate dark and light themes (default)
node cli.js extract --url https://example.com

# Generate multiple custom themes
node cli.js extract --url https://example.com --themes "dark,light,ocean,sunset,forest"

# Specify custom output directory
node cli.js extract --url https://example.com --themes "dark,light" --output ./my-themes

# Test with the included example HTML file
node cli.js extract --url file:///path/to/css-var-themer/example.html --themes "dark,light,purple"
```

## Quick Start Demo

Try the tool with the included example HTML file:

```bash
# 1. Start a local server (in one terminal)
python3 -m http.server 8080

# 2. Run the CLI (in another terminal)
node cli.js extract --url http://localhost:8080/example.html --themes "dark,light,ocean,sunset"

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

## Theme Types

The AI recognizes various theme keywords and applies appropriate transformations:

- **dark/night**: Dark color schemes with inverted brightness
- **light/bright**: Lighter, brighter color schemes
- **ocean/blue**: Blue-tinted themes
- **forest/green**: Green-tinted themes
- **sunset/warm**: Warm color tones (orange/red bias)
- **purple/violet**: Purple color schemes
- **mono/grayscale**: Monochromatic themes
- **compact/dense**: Reduced spacing (75% of original)
- **spacious/comfortable**: Increased spacing (125% of original)

You can combine keywords for unique effects (e.g., "dark-ocean", "light-purple")!

## How It Works

1. **Extraction**: The tool uses Playwright (headless Chromium) to visit the target website and extract all CSS variables defined in `:root` and throughout stylesheets
2. **Analysis**: CSS variables are analyzed to determine their type (color, spacing, font, etc.)
3. **Transformation**: Based on the theme description, intelligent transformations are applied:
   - Colors are adjusted using HSV color space manipulation
   - Spacing values are scaled appropriately
   - Font choices are modified for theme consistency
4. **Output**: Results are saved as both JSON (for programmatic use) and CSS files (for immediate use)

## Examples

### Input Website Variables
```css
:root {
  --primary-color: #3b82f6;
  --background-color: #ffffff;
  --text-color: #1f2937;
  --spacing: 1rem;
}
```

### Generated Dark Theme
```css
/* CSS Variables - dark theme */
:root {
  --primary-color: #0b1a31;
  --background-color: #333333;
  --text-color: #bbbec3;
  --spacing: 1rem;
}
```

### Generated Ocean Theme
```css
/* CSS Variables - ocean theme */
:root {
  --primary-color: #2782ff;
  --background-color: #ebffff;
  --text-color: #0b2969;
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

// Extract variables
const variables = await extractCSSVariables('https://example.com');

// Generate themes
const themes = await generateThemes(variables, ['dark', 'light', 'ocean']);

// Save to files
saveToFile('./output/themes.json', themes);
```

### Environment Variables

- `CHROME_PATH`: Custom path to Chrome/Chromium executable
- `DEBUG`: Set to any value to enable detailed error messages

```bash
CHROME_PATH=/usr/bin/chromium-browser node cli.js extract --url https://example.com
```

## Requirements

- Node.js 14 or higher
- A Chromium-based browser (automatically used if available)
  - The tool will use system Chrome/Chromium if found
  - Falls back to mock data if browser is unavailable (for demonstration)

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

## Development

```bash
# Install dependencies
npm install

# Run the CLI
node cli.js extract --url <your-url>

# Run with debug output
DEBUG=1 node cli.js extract --url <your-url>
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC
