import fs from 'fs';
import path from 'path';

/**
 * Save data to a file (JSON or text)
 * @param {string} filepath - The path to save the file to
 * @param {*} data - The data to save (will be stringified if object)
 */
export function saveToFile(filepath, data) {
  try {
    // Ensure directory exists
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Determine content based on file extension
    let content;
    const ext = path.extname(filepath).toLowerCase();
    
    if (ext === '.json') {
      content = JSON.stringify(data, null, 2);
    } else {
      content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    }
    
    // Write file
    fs.writeFileSync(filepath, content, 'utf8');
    
  } catch (error) {
    throw new Error(`Failed to save file ${filepath}: ${error.message}`);
  }
}

/**
 * Read data from a file
 * @param {string} filepath - The path to read from
 * @returns {*} - The parsed data (JSON if .json file, otherwise string)
 */
export function readFromFile(filepath) {
  try {
    const content = fs.readFileSync(filepath, 'utf8');
    const ext = path.extname(filepath).toLowerCase();
    
    if (ext === '.json') {
      return JSON.parse(content);
    }
    
    return content;
    
  } catch (error) {
    throw new Error(`Failed to read file ${filepath}: ${error.message}`);
  }
}

/**
 * Check if a file exists
 * @param {string} filepath - The path to check
 * @returns {boolean} - True if file exists
 */
export function fileExists(filepath) {
  return fs.existsSync(filepath);
}
