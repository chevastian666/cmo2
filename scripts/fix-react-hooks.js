#!/usr/bin/env node

/**
 * Fix React Hooks rules violations
 * By Cheva
 */

import { promises as fs } from 'fs';
import path from 'path';

async function fixReactHooks() {
  const filePath = '/Users/cheva/Coding/cmo3/src/components/charts/treemap/InteractiveTreemap.tsx';
  
  try {
    let content = await fs.readFile(filePath, 'utf8');
    
    // Find the early return and move it after all hooks
    const earlyReturnRegex = /(\s*\/\/ Validate data[\s\S]*?return[\s\S]*?\);\s*}\s*)/;
    const earlyReturnMatch = content.match(earlyReturnRegex);
    
    if (earlyReturnMatch) {
      const earlyReturnBlock = earlyReturnMatch[0];
      
      // Remove the early return from its current position
      content = content.replace(earlyReturnRegex, '');
      
      // Find where to insert it (after the last useEffect before the return statement)
      const lastUseEffectRegex = /(useEffect\(\(\) => {[\s\S]*?}, \[[^\]]*\]\);)/g;
      let lastMatch;
      let lastIndex = 0;
      
      while ((lastMatch = lastUseEffectRegex.exec(content)) !== null) {
        lastIndex = lastMatch.index + lastMatch[0].length;
      }
      
      if (lastIndex > 0) {
        // Insert the early return after the last useEffect
        content = content.slice(0, lastIndex) + '\n' + earlyReturnBlock + '\n' + content.slice(lastIndex);
        
        await fs.writeFile(filePath, content);
        console.log('✅ Fixed React Hooks order in InteractiveTreemap.tsx');
      }
    }
  } catch (error) {
    console.error('Error fixing React hooks:', error);
  }
}

fixReactHooks();