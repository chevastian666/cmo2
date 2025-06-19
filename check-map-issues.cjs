const fs = require('fs');
const path = require('path');

// Check for map-related issues
const issues = [];

// Check if Google Maps API key is configured
const envExample = fs.readFileSync('.env.example', 'utf8');
if (!envExample.includes('VITE_GOOGLE_MAPS_API_KEY')) {
  issues.push('Missing VITE_GOOGLE_MAPS_API_KEY in .env.example');
}

// Check if .env exists
if (fs.existsSync('.env')) {
  const env = fs.readFileSync('.env', 'utf8');
  if (!env.includes('VITE_GOOGLE_MAPS_API_KEY')) {
    issues.push('Missing VITE_GOOGLE_MAPS_API_KEY in .env file');
  }
} else {
  issues.push('No .env file found - create one from .env.example');
}

// Check map components
const mapComponents = [
  'src/features/torre-control/components/MapWidget.tsx',
  'src/features/torre-control/components/MapVisualization.tsx',
  'src/features/torre-control/components/TorreControlV2.tsx'
];

mapComponents.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check for common issues
    if (content.includes('_data') && !content.includes('const _data')) {
      issues.push(`${file}: Uses _data without declaration`);
    }
    
    if (content.includes('console.error') || content.includes('console.log')) {
      console.log(`${file}: Contains console statements (not an issue, just info)`);
    }
  } else {
    issues.push(`${file}: File not found`);
  }
});

// Check CSS imports
const mainCss = fs.readFileSync('src/index.css', 'utf8');
if (!mainCss.includes('react-grid-layout')) {
  issues.push('Missing react-grid-layout CSS imports in index.css');
}

console.log('\n=== Map Component Check Results ===\n');

if (issues.length === 0) {
  console.log('✅ No issues found with map components');
} else {
  console.log('Issues found:');
  issues.forEach(issue => console.log(`  - ${issue}`));
}

console.log('\n=== Recommendations ===');
console.log('1. The map is currently showing a visualization with tabs (Routes, Status, Timeline)');
console.log('2. This is NOT using Google Maps - it\'s a custom visualization');
console.log('3. If you want to use Google Maps:');
console.log('   - Add VITE_GOOGLE_MAPS_API_KEY to your .env file');
console.log('   - Implement a real Google Maps component');
console.log('4. The current implementation works without an API key\n');