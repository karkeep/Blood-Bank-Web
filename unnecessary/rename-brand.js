import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

// Function to recursively find all files in a directory
function findFiles(dir, ext, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('node_modules') && !file.startsWith('.git')) {
      fileList = findFiles(filePath, ext, fileList);
    } else if (stat.isFile() && (file.endsWith(ext) || ext === '*')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Main directory to start from
const rootDir = '/Users/prabeshkarkee/Desktop/blood-bank';

// Find all TypeScript, JavaScript, and TSX files
const allFiles = [
  ...findFiles(rootDir, '.tsx'),
  ...findFiles(rootDir, '.ts'),
  ...findFiles(rootDir, '.jsx'),
  ...findFiles(rootDir, '.js'),
  ...findFiles(rootDir, '.json'),
  ...findFiles(rootDir, '.html'),
  ...findFiles(rootDir, '.md'),
];

console.log(`Found ${allFiles.length} files to process.`);

// Process each file to replace "Jiwandan" with "Jiwandan"
let replacedCount = 0;

allFiles.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Case-sensitive replacement
    content = content.replace(/Jiwandan/g, 'Jiwandan');
    
    // Case-insensitive replacement for lowercase variants
    content = content.replace(/jiwandan/gi, (match) => {
      if (match === 'jiwandan') return 'jiwandan';
      if (match === 'JIWANDAN') return 'JIWANDAN';
      if (match === 'Jiwandan') return 'Jiwandan';
      return match;
    });
    
    // Only write the file if changes were made
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      replacedCount++;
      console.log(`Updated: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
});

console.log(`Replaced "Jiwandan" with "Jiwandan" in ${replacedCount} files.`);
