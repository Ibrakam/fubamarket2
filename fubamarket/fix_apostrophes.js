const fs = require('fs');
const path = require('path');

function fixApostrophesInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix unescaped apostrophes in JSX text content
    // Pattern: ' followed by non-& character (not already escaped)
    content = content.replace(/([^&])'([^;])/g, '$1&apos;$2');
    
    // Fix unescaped apostrophes at start of text content
    content = content.replace(/^'([^;])/gm, '&apos;$1');
    
    // Fix unescaped apostrophes in string literals that are not already escaped
    content = content.replace(/([^&])'([^;])/g, '$1&apos;$2');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed apostrophes in: ${filePath}`);
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
  }
}

function walkDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      walkDirectory(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fixApostrophesInFile(filePath);
    }
  }
}

// Start fixing from current directory
walkDirectory('.');
console.log('Apostrophe fixing completed!');
