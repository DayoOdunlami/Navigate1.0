# Local Build Errors Found

## Summary
Running `npm run build` locally found **6 errors** that would have failed on Vercel:

### Errors Found:
1. **4x Missing `projects.json` file** (warnings - non-blocking)
   - File: `src/components/visualizations/PortfolioTreemap.tsx`
   - Already handled with try-catch, but file should exist or be committed

2. **2x `fs` module errors** (blocking - prevents build)
   - File: `src/lib/atlas/store.ts`
   - Issue: Next.js/Turbopack trying to bundle Node.js `fs` module for client
   - This file is only used in API routes (server-only)

## Why This Happens

The `atlas/store.ts` file uses Node.js `fs` module which is server-only. Even though it's only imported in API routes (which are server-only), Turbopack analyzes all files during build and tries to resolve imports, causing it to fail when it encounters `fs` in the client bundle analysis.

## Solutions

### Option 1: Remove `--turbopack` from build (Quick Fix)
```json
// package.json
"build": "next build"  // Remove --turbopack
```

### Option 2: Move file to server-only location
Move `src/lib/atlas/store.ts` to `src/app/api/atlas/_lib/store.ts` (inside API route directory)

### Option 3: Use dynamic imports (Complex)
Convert static imports to dynamic imports with server checks

### Option 4: Configure Next.js to exclude from client bundle
Add to `next.config.ts`:
```typescript
experimental: {
  serverComponentsExternalPackages: ['fs', 'path'],
}
```

## Current Status
- ✅ Added `serverExternalPackages` to `next.config.ts`
- ✅ Added `serverComponentsExternalPackages` to experimental config
- ⚠️ Still failing - Turbopack may not respect these configs

## Recommendation
**Try Option 1 first** - Remove `--turbopack` from build command. Turbopack is great for dev speed, but standard Next.js build is more stable for production.

