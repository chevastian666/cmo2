const fs = require('fs');
const path = require('path');

// Fix specific parsing errors
const SPECIFIC_PARSING_FIXES = [
  // Fix D3VisualizationWidget.tsx
  {
    file: 'src/components/charts/d3/D3VisualizationWidget.tsx',
    fixes: [
      { pattern: /136:6\s*error\s*Parsing error: Declaration or statement expected/, replacement: '' },
      { pattern: /case\s+(['"][^'"]*['"]):\s*([^{]*)\{([^}]*)\}/g, replacement: 'case $1: {\n  $2\n  break;\n}' }
    ]
  },
  
  // Fix SankeyChart.tsx
  {
    file: 'src/components/charts/sankey/SankeyChart.tsx',
    fixes: [
      { pattern: /305:4\s*error\s*Parsing error: Declaration or statement expected/, replacement: '' },
      { pattern: /case\s+(['"][^'"]*['"]):\s*([^{]*)\{([^}]*)\}/g, replacement: 'case $1: {\n  $2\n  break;\n}' }
    ]
  },
  
  // Fix missing braces and switch statements
  {
    pattern: /switch\s*\([^)]+\)\s*\{([^}]*case[^}]+)\}/g,
    replacement: (match, cases) => {
      // Ensure each case is properly wrapped in braces
      const fixedCases = cases.replace(/case\s+([^:]+):\s*([^b]+)break;/g, 'case $1: {\n  $2\n  break;\n}');
      return match.replace(cases, fixedCases);
    }
  },
  
  // Fix case statements without proper braces
  {
    pattern: /case\s+([^:]+):\s*([^{][^b]*?)break;/g,
    replacement: 'case $1: {\n  $2\n  break;\n}'
  }
];

function fixSpecificFile(filePath, fixes) {
  try {
    if (!fs.existsSync(filePath)) return false;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    fixes.forEach(fix => {
      const newContent = content.replace(fix.pattern, fix.replacement);
      if (newContent !== content) {
        content = newContent;
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      fs.writeFileSync(filePath, content);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

function fixWebSocketFiles() {
  // Fix the WebSocket files that have parsing errors
  const webSocketFile = path.join(__dirname, '..', 'src/services/websocket/useWebSocket.ts');
  
  if (fs.existsSync(webSocketFile)) {
    let content = fs.readFileSync(webSocketFile, 'utf8');
    
    // Fix the switch statement structure
    content = content.replace(
      /case\s+'update':\s*\{\s*\{\s*store\.updatePrecinto/g,
      'case \'update\': {\n          store.updatePrecinto'
    );
    
    content = content.replace(
      /case\s+'update':\s*store\.updateTransito/g,
      'case \'update\': {\n          store.updateTransito'
    );
    
    // Fix missing braces
    content = content.replace(
      /case\s+'([^']+)':\s*([^{])/g,
      'case \'$1\': {\n          $2'
    );
    
    fs.writeFileSync(webSocketFile, content);
    console.log('✅ Fixed WebSocket parsing errors');
  }
  
  // Fix the hooks WebSocket file
  const hooksWebSocketFile = path.join(__dirname, '..', 'src/hooks/useWebSocket.ts');
  
  if (fs.existsSync(hooksWebSocketFile)) {
    let content = fs.readFileSync(hooksWebSocketFile, 'utf8');
    
    // Fix missing destructuring
    content = content.replace(
      /const \{ autoConnect \} = options/g,
      'const { onConnect, onDisconnect, onReconnect, autoConnect } = options'
    );
    
    // Add missing autoConnect
    if (!content.includes('const { onConnect, onDisconnect, onReconnect, autoConnect }')) {
      content = content.replace(
        /export function useWebSocket\(options: UseWebSocketOptions = \{\}\) \{/,
        'export function useWebSocket(options: UseWebSocketOptions = {}) {\n  const { onConnect, onDisconnect, onReconnect, autoConnect } = options'
      );
    }
    
    // Fix switch statement
    content = content.replace(
      /case 'connected': \{\s*if \(previousStatus\.current === 'reconnecting'\) \{\s*onReconnect\?\.\(\)\s*\} else \{\s*onConnect\?\.\(\)\s*\}\s*break\s*\}/g,
      `case 'connected': {
          if (previousStatus.current === 'reconnecting') {
            onReconnect?.();
          } else {
            onConnect?.();
          }
          break;
        }`
    );
    
    // Fix disconnected case
    content = content.replace(
      /case 'disconnected':\s*onDisconnect\?\.\(\)\s*break/g,
      `case 'disconnected': {
          onDisconnect?.();
          break;
        }`
    );
    
    // Fix dependency arrays
    content = content.replace(
      /\}, \[\]\)/g,
      '}, [connectionStatus, onConnect, onDisconnect, onReconnect])'
    );
    
    content = content.replace(
      /\}, \[autoConnect\]\)/g,
      '}, [autoConnect])'
    );
    
    fs.writeFileSync(hooksWebSocketFile, content);
    console.log('✅ Fixed hooks WebSocket parsing errors');
  }
}

// Main execution
console.log('🔧 Fixing remaining parsing errors...');

// Fix specific files
SPECIFIC_PARSING_FIXES.forEach(fix => {
  if (fix.file) {
    const filePath = path.join(__dirname, '..', fix.file);
    if (fixSpecificFile(filePath, fix.fixes)) {
      console.log(`✅ Fixed: ${fix.file}`);
    }
  }
});

// Fix WebSocket files specifically
fixWebSocketFiles();

console.log('\n✅ Remaining parsing error fixes completed!');