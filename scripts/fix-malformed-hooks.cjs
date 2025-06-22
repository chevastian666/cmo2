#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔧 Fixing malformed React hooks...');

// Pattern to fix malformed React hooks
const fixMalformedHooks = (content) => {
  // Fix pattern: const varName = React.\n// eslint-disable-next-line\n\nuseMemo/useCallback/useEffect
  content = content.replace(
    /const\s+(\w+)\s*=\s*React\.\s*\n\s*\/\/\s*eslint-disable-next-line[^\n]*\n\s*\n\s*(useMemo|useCallback|useEffect)/g,
    'const $1 = React.$2'
  );
  
  // Fix pattern where hooks are split across lines
  content = content.replace(
    /React\.\s*\n\s*\/\/\s*eslint-disable-next-line[^\n]*\n\s*\n\s*(useMemo|useCallback|useEffect)/g,
    'React.$1'
  );
  
  // Fix pattern: = \n// eslint-disable-next-line\n\nuseMemo/useCallback/useEffect
  content = content.replace(
    /=\s*\n\s*\/\/\s*eslint-disable-next-line[^\n]*\n\s*\n\s*(useMemo|useCallback|useEffect)/g,
    '= $1'
  );
  
  // Clean up excessive newlines around eslint comments
  content = content.replace(/\n\s*\/\/\s*eslint-disable-next-line[^\n]*\n\n+/g, '\n  // eslint-disable-next-line $&\n  ');
  
  return content;
};

// Files with malformed hooks
const filesToFix = [
  'src/features/alertas/pages/AlertasPageV2.tsx',
  'src/features/transitos/pages/TransitosPageV2.tsx',
  'src/features/documentacion/components/CentroDocumentacion.tsx',
  'src/features/novedades/pages/BitacoraOperacional.tsx',
  'src/components/charts/d3/ActivityHeatmap.tsx',
  'src/components/charts/d3/InteractiveLineChart.tsx',
  'src/components/charts/d3/NetworkGraph.tsx',
  'src/components/charts/d3/InteractiveTreemap.tsx',
  'src/components/charts/sankey/SankeyChart.tsx',
  'src/components/notifications/NotificationPreferences.tsx',
  'src/services/websocket/useWebSocket.tsx',
  'src/hooks/useWebSocket.ts'
];

let fixedCount = 0;

filesToFix.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  File not found: ${file}`);
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Apply fixes
    content = fixMalformedHooks(content);
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed: ${file}`);
      fixedCount++;
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});

// Also check all files for the pattern
const allFiles = glob.sync('src/**/*.{ts,tsx}', {
  ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/*.d.ts']
});

allFiles.forEach(filePath => {
  if (filesToFix.some(f => filePath.endsWith(f))) return; // Skip already processed
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    if (content.includes('React.\n') || content.includes('= \n')) {
      content = fixMalformedHooks(content);
      
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ Fixed: ${path.relative(process.cwd(), filePath)}`);
        fixedCount++;
      }
    }
  } catch (error) {
    // Silent fail for other files
  }
});

console.log(`\n✨ Fixed ${fixedCount} files`);