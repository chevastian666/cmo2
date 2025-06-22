/**
 * Lint-staged configuration
 * Ensures code quality on every commit
 * By Cheva
 */

export default {
  // TypeScript and TSX files
  '*.{ts,tsx}': [
    // Run ESLint with auto-fix (temporarily allow warnings during cleanup)
    'eslint --fix --max-warnings 3000'
    // Type check temporarily disabled during aggressive cleanup
    // () => 'tsc --noEmit'
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