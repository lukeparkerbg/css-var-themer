# css-var-themer

A powerful CLI tool to extract CSS variables from websites and generate themed variants using AI-powered transformations.

## Features

- 🌐 **Extract CSS Variables**: Visit any website with a headless browser and extract all CSS custom properties
- 🎨 **AI-Powered Theme Generation**: Automatically generate theme variants based on your descriptions
- 💾 **Multiple Output Formats**: Get both JSON and ready-to-use CSS files
- ⚡ **Fast & Efficient**: Built with modern tools like Playwright for reliable extraction

## Installation

```bash
npm install
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
# Generate dark and light themes
node cli.js extract --url https://example.com

# Generate multiple custom themes
node cli.js extract --url https://example.com --themes "dark,light,ocean,sunset,forest"

# Specify custom output directory
node cli.js extract --url https://example.com --themes "dark,light" --output ./my-themes
```

## Output

The tool generates the following files in the output directory:

1. **original-variables.json** - All extracted CSS variables in JSON format
2. **original-variables.css** - Ready-to-use CSS file with original variables
3. **theme-{name}.json** - JSON file for each generated theme
4. **theme-{name}.css** - Ready-to-use CSS file for each theme

### Theme Types

The AI recognizes various theme keywords and applies appropriate transformations:

- **dark/night**: Dark color schemes with inverted brightness
- **light/bright**: Lighter, brighter color schemes
- **ocean/blue**: Blue-tinted themes
- **forest/green**: Green-tinted themes
- **sunset/warm**: Warm color tones
- **purple/violet**: Purple color schemes
- **mono/grayscale**: Monochromatic themes
- **compact/dense**: Reduced spacing
- **spacious/comfortable**: Increased spacing

## How It Works

1. **Extraction**: The tool uses Playwright to visit the target website and extract all CSS variables defined in `:root` and throughout stylesheets
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
:root {
  --primary-color: #93c5fd;
  --background-color: #0a0a0a;
  --text-color: #e5e7eb;
  --spacing: 1rem;
}
```

## Requirements

- Node.js 14 or higher
- A Chromium-based browser (for headless extraction)

## Development

```bash
# Install dependencies
npm install

# Run the CLI
node cli.js extract --url <your-url>
```

## License

ISC
