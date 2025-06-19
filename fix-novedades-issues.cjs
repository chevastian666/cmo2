const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Function to fix novedades specific issues
async function fixNovedadesIssues() {
  console.log('Fixing novedades section issues...\n');
  
  const files = await glob('src/features/novedades/**/*.{ts,tsx}', {
    ignore: ['node_modules/**', 'dist/**', 'build/**']
  });
  
  let totalFixed = 0;
  
  for (const file of files) {
    try {
      let content = fs.readFileSync(file, 'utf8');
      let newContent = content;
      let modified = false;
      const fixes = [];
      
      // Fix 1: Remove unnecessary underscore prefixes
      const unnecessaryUnderscores = [
        { from: /_novedad\b/g, to: 'novedad' },
        { from: /_error\b/g, to: 'error' },
        { from: /_filtros\b/g, to: 'filtros' },
      ];
      
      unnecessaryUnderscores.forEach(({ from, to }) => {
        if (from.test(newContent)) {
          newContent = newContent.replace(from, to);
          modified = true;
          fixes.push(`Fixed: ${from} → ${to}`);
        }
      });
      
      // Fix 2: Fix specific patterns
      // Fix notificationService.success with _novedad
      if (newContent.includes("'La _novedad")) {
        newContent = newContent.replace(/'La _novedad/g, "'La novedad");
        modified = true;
        fixes.push("Fixed: 'La _novedad' → 'La novedad'");
      }
      
      // Fix 3: Fix prop name mismatches
      if (newContent.includes('_filtros={_filtros}')) {
        newContent = newContent.replace(/_filtros=\{_filtros\}/g, 'filtros={filtros}');
        modified = true;
        fixes.push('Fixed: _filtros={_filtros} → filtros={filtros}');
      }
      
      if (modified) {
        fs.writeFileSync(file, newContent, 'utf8');
        console.log(`Fixed ${file}:`);
        fixes.forEach(fix => console.log(`  - ${fix}`));
        totalFixed++;
      }
    } catch (error) {
      console.error(`Error processing ${file}:`, error.message);
    }
  }
  
  console.log(`\nTotal files fixed: ${totalFixed}`);
  
  // Check for any remaining issues
  console.log('\nChecking for remaining issues...');
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for common problems
      if (content.includes('data is not defined') || 
          content.includes('_data') && !content.includes('const _data') ||
          content.includes('_error') && !content.includes('catch (_error)')) {
        console.log(`  Potential issue in ${file}`);
      }
    } catch (error) {
      // Skip
    }
  }
}

fixNovedadesIssues().catch(console.error);