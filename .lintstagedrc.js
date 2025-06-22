/**
 * Lint-staged configuration
 * Ensures code quality on every commit
 * By Cheva
 */

export default {
  // TypeScript and TSX files
  '*.{ts,tsx}': [
    // Run ESLint with auto-fix
    'eslint --fix --max-warnings 0',
    // Type check (this will run on all files, not just staged)
    () => 'tsc --noEmit'
  ],
  
  // JSON files
  '*.json': [
    'prettier --write'
  ],
  
  // Markdown files
  '*.md': [
    'prettier --write'
  ]
};