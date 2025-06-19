const fs = require('fs');
const path = require('path');

console.log('=== Diagnosing Novedades Page Loading Issue ===\n');

// Check if the component file exists
const componentPath = 'src/features/novedades/pages/LibroNovedadesPageV2.tsx';
if (fs.existsSync(componentPath)) {
  console.log('✅ Component file exists:', componentPath);
  
  // Check for syntax errors
  const content = fs.readFileSync(componentPath, 'utf8');
  
  // Check for export
  if (content.includes('export default LibroNovedadesPageV2')) {
    console.log('✅ Default export found');
  } else {
    console.log('❌ Missing default export');
  }
  
  // Check for console.log
  if (content.includes('console.log(\'LibroNovedadesPageV2: Componente renderizando\')')) {
    console.log('✅ Debug console.log is present');
  }
  
  // Check imports
  const importIssues = [];
  
  if (content.includes('@/components/ui/Card')) {
    importIssues.push('Incorrect Card import (should be lowercase)');
  }
  
  if (content.includes('import type') && content.includes('FiltrosNovedades')) {
    console.log('✅ Type imports look correct');
  }
  
  if (importIssues.length > 0) {
    console.log('⚠️  Import issues:', importIssues);
  } else {
    console.log('✅ Imports look correct');
  }
} else {
  console.log('❌ Component file not found');
}

// Check App.tsx import
const appPath = 'src/App.tsx';
if (fs.existsSync(appPath)) {
  const appContent = fs.readFileSync(appPath, 'utf8');
  
  if (appContent.includes('LibroNovedadesPageV2')) {
    console.log('✅ Component is imported in App.tsx');
    
    if (appContent.includes('path="/novedades"') && appContent.includes('<LibroNovedadesPageV2')) {
      console.log('✅ Route is configured correctly');
    } else {
      console.log('❌ Route configuration issue');
    }
  } else {
    console.log('❌ Component not imported in App.tsx');
  }
}

// Check store
const storePath = 'src/store/novedadesStore.ts';
if (fs.existsSync(storePath)) {
  console.log('✅ Novedades store exists');
  const storeContent = fs.readFileSync(storePath, 'utf8');
  
  if (storeContent.includes('export const useNovedadesStore')) {
    console.log('✅ Store is exported correctly');
  }
} else {
  console.log('❌ Novedades store not found');
}

// Check for common TypeScript errors
console.log('\n=== Checking for Common Issues ===');

const filesToCheck = [
  'src/features/novedades/pages/LibroNovedadesPageV2.tsx',
  'src/features/novedades/components/LibroNovedades.tsx',
  'src/store/novedadesStore.ts'
];

filesToCheck.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    const issues = [];
    
    // Check for undefined variables
    if (content.includes('data)') && !content.includes('const data') && !content.includes('function(data')) {
      issues.push('Possible undefined "data" variable');
    }
    
    // Check for _variable mismatches
    const underscoreVars = content.match(/_\w+/g) || [];
    underscoreVars.forEach(varName => {
      const nonUnderscore = varName.substring(1);
      if (content.includes(nonUnderscore + ')') || content.includes(nonUnderscore + '.')) {
        issues.push(`Possible mismatch: ${varName} vs ${nonUnderscore}`);
      }
    });
    
    if (issues.length > 0) {
      console.log(`\n${file}:`);
      issues.forEach(issue => console.log(`  - ${issue}`));
    }
  }
});

console.log('\n=== Recommendations ===');
console.log('1. Check browser console for specific error messages');
console.log('2. Try accessing http://localhost:5174/novedades directly');
console.log('3. Check Network tab for failed requests');
console.log('4. Verify all imports are using correct paths');