const fs = require('fs');
const path = require('path');

function fixJSXApostrophesInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Only fix apostrophes in JSX text content, not in imports or string literals
    // Pattern: > followed by text with unescaped apostrophe, then <
    content = content.replace(/>([^<]*[^&]'[^;][^<]*)</g, (match, text) => {
      const fixedText = text.replace(/([^&])'([^;])/g, '$1'$2');
      return '>' + fixedText + '<';
    });
    
    // Fix apostrophes in JSX attributes (but not in string literals)
    content = content.replace(/className="([^"]*[^&]'[^;][^"]*)"/g, (match, className) => {
      const fixedClassName = className.replace(/([^&])'([^;])/g, '$1'$2');
      return `className="${fixedClassName}"`;
    });
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed JSX apostrophes in: ${filePath}`);
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
    } else if (file.endsWith('.tsx')) {
      fixJSXApostrophesInFile(filePath);
    }
  }
}

// Start fixing from current directory
walkDirectory('.');
console.log('JSX apostrophe fixing completed!');
