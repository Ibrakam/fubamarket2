const fs = require('fs');
const path = require('path');

function fixJSXOnlyApostrophes(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Only fix apostrophes in JSX text content between > and <
    // This pattern matches text content inside JSX elements
    content = content.replace(/>([^<]*[^&]'[^;][^<]*)</g, (match, text) => {
      // Only fix if it's not inside a string literal or template literal
      if (text.includes('"') || text.includes('`') || text.includes('${')) {
        return match; // Skip if it contains string delimiters
      }
      const fixedText = text.replace(/([^&])'([^;])/g, '$1'$2');
      return '>' + fixedText + '<';
    });
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed JSX-only apostrophes in: ${filePath}`);
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
      fixJSXOnlyApostrophes(filePath);
    }
  }
}

// Start fixing from current directory
walkDirectory('.');
console.log('JSX-only apostrophe fixing completed!');
