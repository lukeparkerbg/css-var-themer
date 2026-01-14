#!/usr/bin/env node

import { Command } from 'commander';
import { extractCSSVariables } from './src/extractor.js';
import { generateThemes } from './src/themeGenerator.js';
import { saveToFile } from './src/fileUtils.js';
import fs from 'fs';
import path from 'path';

const program = new Command();

program
  .name('css-var-themer')
  .description('Extract CSS variables from websites and generate themed variants')
  .version('1.0.0');

program
  .command('extract')
  .description('Extract CSS variables from a website and generate themes using AI')
  .requiredOption('-u, --url <url>', 'Website URL to extract CSS variables from')
  .option('-t, --themes <themes>', 'Comma-separated theme descriptions (e.g., "dark,light,vibrant and energetic,calm and professional")', 'dark,light')
  .option('-o, --output <directory>', 'Output directory for generated files', './output')
  .action(async (options) => {
    try {
      console.log('🚀 CSS Var Themer Starting...\n');
      
      // Check for AI availability
      if (process.env.OPENAI_API_KEY) {
        console.log('🤖 AI-powered theme generation enabled (OpenAI GPT)\n');
      } else {
        console.log('📋 Using rule-based theme generation (set OPENAI_API_KEY for AI mode)\n');
      }
      
      console.log(`📍 Target URL: ${options.url}`);
      
      // Parse theme descriptions
      const themeDescriptions = options.themes.split(',').map(t => t.trim()).filter(t => t);
      console.log(`🎨 Generating ${themeDescriptions.length} theme(s): ${themeDescriptions.join(', ')}\n`);
      
      // Create output directory
      const outputDir = path.resolve(options.output);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Step 1: Extract CSS variables
      console.log('🔍 Extracting CSS variables from website...');
      const cssVariables = await extractCSSVariables(options.url);
      
      if (!cssVariables || Object.keys(cssVariables).length === 0) {
        console.error('❌ No CSS variables found on the website');
        process.exit(1);
      }
      
      console.log(`✅ Found ${Object.keys(cssVariables).length} CSS variables\n`);
      
      // Step 2: Save original CSS variables
      const originalFile = path.join(outputDir, 'original-variables.json');
      saveToFile(originalFile, cssVariables);
      console.log(`💾 Original variables saved to: ${originalFile}\n`);
      
      // Step 3: Generate themed variants
      console.log('🎨 Generating theme variants using AI...');
      const themes = await generateThemes(cssVariables, themeDescriptions);
      
      // Step 4: Save each theme
      for (const [themeName, themeVariables] of Object.entries(themes)) {
        const themeFile = path.join(outputDir, `theme-${themeName}.json`);
        saveToFile(themeFile, themeVariables);
        console.log(`💾 Theme "${themeName}" saved to: ${themeFile}`);
      }
      
      // Step 5: Generate CSS files for easy use
      console.log('\n📝 Generating CSS files...');
      const originalCSSFile = path.join(outputDir, 'original-variables.css');
      saveToFile(originalCSSFile, generateCSSFromVariables(cssVariables, 'original'));
      console.log(`💾 Original CSS saved to: ${originalCSSFile}`);
      
      for (const [themeName, themeVariables] of Object.entries(themes)) {
        const themeCSSFile = path.join(outputDir, `theme-${themeName}.css`);
        saveToFile(themeCSSFile, generateCSSFromVariables(themeVariables, themeName));
        console.log(`💾 Theme "${themeName}" CSS saved to: ${themeCSSFile}`);
      }
      
      console.log('\n✨ All done! Your themes are ready.\n');
      console.log(`📂 Output directory: ${outputDir}`);
      console.log(`📊 Total themes generated: ${Object.keys(themes).length}`);
      
    } catch (error) {
      console.error('❌ Error:', error.message);
      if (process.env.DEBUG) {
        console.error(error);
      }
      process.exit(1);
    }
  });

function generateCSSFromVariables(variables, themeName) {
  const lines = [
    `/* CSS Variables - ${themeName} theme */`,
    ':root {',
  ];
  
  for (const [key, value] of Object.entries(variables)) {
    lines.push(`  ${key}: ${value};`);
  }
  
  lines.push('}');
  return lines.join('\n');
}

program.parse();
