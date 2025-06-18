# Fix Applied: BreadcrumbNav Error

## Error
```
BreadcrumbNav.tsx:139 Uncaught ReferenceError: config is not defined
```

## Cause
In the BreadcrumbNav component, there was a variable naming issue where `config` was being used instead of `_config`.

## Solution
Changed all references from `config` to `_config` in lines 139, 140, 148, and 149.

The variable was defined as:
```typescript
const _config = breadcrumbConfig[path];
```

But was being referenced as `config` instead of `_config`.

## Result
The error should now be resolved and the breadcrumb navigation should work correctly.

By Cheva