#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to recursively find all .js files
function findJsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      findJsFiles(filePath, fileList);
    } else if (file.endsWith('.js')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to remove console.log statements
function removeConsoleLogs(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Remove console.log statements (but keep console.error for debugging)
    content = content.replace(/console\.log\([^)]*\);?\s*/g, '');
    
    // Only write if content changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`Cleaned: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

// Main execution
const projectRoot = path.resolve(__dirname, '..');
const jsFiles = findJsFiles(projectRoot);

console.log(`Found ${jsFiles.length} JavaScript files to process...`);

jsFiles.forEach(file => {
  removeConsoleLogs(file);
});

console.log('Cleanup completed!');


