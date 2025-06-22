# Lint Fixing Guide for CMO Project

## Overview

This guide documents common lint errors and their fixes in the CMO project. The project uses ESLint with TypeScript rules to maintain code quality.

## Automated Tools

### 1. Auto-Fix Script

Run the automated lint fixer to handle common patterns:

```bash
node scripts/fix-lint-errors.js src
```

This script automatically fixes:
- Unused imports
- `any` types → `unknown`
- Case declarations without block scope
- Unexpected multiline formatting

### 2. ESLint Auto-Fix

For simpler fixes:

```bash
npm run lint:fix
```

## Common Lint Errors and Fixes

### 1. @typescript-eslint/no-explicit-any

**Error**: Unexpected any. Specify a different type

**Fixes**:

```typescript
// ❌ Bad
const data: any = fetchData();
const items: any[] = [];
function process(input: any): any { }

// ✅ Good
const data: unknown = fetchData();
const items: Item[] = [];
function process(input: string | number): ProcessResult { }

// For truly dynamic data, use unknown and type guards
const data: unknown = fetchData();
if (typeof data === 'object' && data !== null) {
  // Safe to use data as object
}
```

### 2. @typescript-eslint/no-unused-vars

**Error**: Variable is defined but never used

**Fixes**:

```typescript
// ❌ Bad
import { useState, useEffect, useMemo } from 'react';
const [data, setData] = useState();  // data never used

// ✅ Good - Remove if truly unused
import { useState } from 'react';

// ✅ Good - Prefix with underscore for intentionally unused
const [_data, setData] = useState();

// ✅ Good - Use underscore in destructuring
const { active, ...rest } = props; // If active is unused
const { _active, ...rest } = props; // Or prefix with underscore
```

### 3. react-hooks/rules-of-hooks

**Error**: React Hook called conditionally

**Fixes**:

```typescript
// ❌ Bad
if (!data) {
  return <div>No data</div>;
}
const [state, setState] = useState(); // Hook after conditional

// ✅ Good
const [state, setState] = useState();
if (!data) {
  return <div>No data</div>;
}
```

### 4. no-case-declarations

**Error**: Unexpected lexical declaration in case block

**Fixes**:

```typescript
// ❌ Bad
switch (action.type) {
  case 'ADD':
    const item = action.payload;
    return [...state, item];
}

// ✅ Good
switch (action.type) {
  case 'ADD': {
    const item = action.payload;
    return [...state, item];
  }
}
```

### 5. react-refresh/only-export-components

**Warning**: Fast refresh only works when a file only exports components

**Fixes**:

```typescript
// ❌ Bad - Mixed exports
export const MyComponent = () => <div />;
export const helperFunction = () => { };

// ✅ Good - Separate files
// components/MyComponent.tsx
export const MyComponent = () => <div />;

// utils/helpers.ts
export const helperFunction = () => { };
```

## Type Safety Best Practices

### 1. Use Specific Types

```typescript
// Instead of any or unknown, create interfaces
interface ApiResponse {
  data: {
    id: string;
    name: string;
    value: number;
  }[];
  status: 'success' | 'error';
}
```

### 2. Use Generics for Reusable Code

```typescript
// Generic hook
function useData<T>(initialValue: T): [T, (value: T) => void] {
  const [data, setData] = useState<T>(initialValue);
  return [data, setData];
}
```

### 3. Type Guards

```typescript
// Type guard function
function isError(value: unknown): value is Error {
  return value instanceof Error;
}

// Usage
try {
  // ...
} catch (error) {
  if (isError(error)) {
    console.error(error.message);
  }
}
```

## Pre-commit Hooks

The project uses Husky and lint-staged to prevent bad code from being committed:

1. **Automatic Fixes**: ESLint will auto-fix simple issues
2. **Type Checking**: TypeScript compiler checks all files
3. **Commit Message**: Must follow conventional commits format

### Commit Message Format

```
<type>(<scope>): <subject>

Types: feat, fix, docs, style, refactor, test, chore, perf, ci, build, revert
```

Examples:
- `feat(auth): add login functionality`
- `fix(api): resolve connection timeout issue`
- `docs: update README with installation steps`

## Running Checks Manually

```bash
# Lint check
npm run lint

# Type check
npm run typecheck

# Fix what can be auto-fixed
npm run lint:fix

# Run all checks
npm run test:all
```

## Tips for Clean Code

1. **Enable VSCode ESLint Extension**: Get real-time feedback
2. **Fix as You Code**: Don't let errors accumulate
3. **Use Type Inference**: Let TypeScript infer types when obvious
4. **Prefer `unknown` over `any`**: Forces type checking
5. **Use Strict Mode**: Catches more potential issues

## Troubleshooting

### ESLint Not Working

```bash
# Clear cache
rm -rf node_modules/.cache
npm run lint
```

### Type Errors After Fix

```bash
# Restart TypeScript server in VSCode
Cmd+Shift+P → "TypeScript: Restart TS Server"
```

### Pre-commit Hook Failing

```bash
# Bypass hook (use sparingly!)
git commit --no-verify -m "emergency fix"
```

---

By Cheva