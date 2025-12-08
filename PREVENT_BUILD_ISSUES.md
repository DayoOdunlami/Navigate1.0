# How to Prevent Local vs Vercel Build Discrepancies

## The Problem
Your code works locally but fails on Vercel because:
1. **Dev mode is forgiving** - TypeScript errors don't block development
2. **Missing files** - Files exist locally but aren't in git
3. **Strict type checking** - Production builds are stricter
4. **Different environments** - Local has files/cache that Vercel doesn't

## Solution: Test Production Builds Locally

### 1. Always Test Build Before Pushing

```bash
# Before pushing to GitHub, run:
npm run build

# This will catch:
# - TypeScript errors
# - Missing files
# - Type mismatches
# - Module resolution issues
```

### 2. Add Pre-Push Hook (Recommended)

Create `.husky/pre-push`:
```bash
#!/bin/sh
npm run build
```

Or add to `package.json`:
```json
{
  "scripts": {
    "pre-push": "npm run build",
    "build": "next build --turbopack"
  }
}
```

### 3. Check for Missing Files

Before committing, verify all imported files exist:
```bash
# Search for JSON imports
grep -r "from.*\.json" src/

# Check if files exist
ls -la src/data/toolkit/fundingFlows.json
ls -la src/data/cpc_domain/projects.json
```

### 4. Use Try-Catch for Optional Files

For files that might not exist:
```typescript
// ❌ BAD - Will fail if file doesn't exist
import data from '@/data/file.json';

// ✅ GOOD - Handles missing files gracefully
let data: SomeType;
try {
  data = require('@/data/file.json');
} catch {
  data = { /* fallback */ };
}
```

### 5. Run Type Check Separately

Add a type-check script:
```json
{
  "scripts": {
    "type-check": "tsc --noEmit",
    "build": "next build --turbopack"
  }
}
```

Then run: `npm run type-check` before pushing.

## Common Issues & Fixes

### Issue 1: Missing JSON Files
**Symptom:** `Cannot find module '@/data/file.json'`
**Fix:** Wrap in try-catch or ensure file is committed

### Issue 2: Type Mismatches
**Symptom:** `Type 'X' is not assignable to type 'Y'`
**Fix:** Use type assertions or fix the types

### Issue 3: Private Method Access
**Symptom:** `Property 'getModel' is private`
**Fix:** Use type assertion: `(instance as any).getModel()`

### Issue 4: Missing Required Properties
**Symptom:** `Property 'value' is missing in type`
**Fix:** Add the required property

## Best Practices

1. ✅ **Always run `npm run build` before pushing**
2. ✅ **Commit all files that are imported**
3. ✅ **Use try-catch for optional files**
4. ✅ **Fix TypeScript errors immediately**
5. ✅ **Test in a clean environment** (CI/CD)

## Quick Checklist Before Pushing

- [ ] `npm run build` passes locally
- [ ] All imported files exist in git
- [ ] No TypeScript errors
- [ ] No linting errors (or they're warnings only)
- [ ] Tested in clean environment (optional but recommended)

