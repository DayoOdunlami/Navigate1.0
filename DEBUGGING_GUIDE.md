# Better Debugging Workflow

## The Problem We Just Experienced

We fixed **20+ TypeScript errors** one-by-one through Vercel build logs. This was inefficient because:
- ❌ Each fix required a push → wait for build → see error → fix → repeat
- ❌ Couldn't see all errors at once
- ❌ Wasted time on multiple build cycles

## The Solution: Test Locally First

### Quick Check (Fast - ~10 seconds)
```bash
# Type check only - catches TypeScript errors quickly
npm run type-check
```

### Full Production Build (Slower - ~1 minute, but matches Vercel exactly)
```bash
# This is what Vercel runs - catches everything
npm run build
```

### Combined Check (Recommended)
```bash
# Type check first (fast), then full build (thorough)
npm run build:check
```

## Why This Works

### `npm run dev` (Development Mode)
- ✅ Fast feedback
- ✅ Hot reload
- ❌ **Forgiving** - TypeScript errors shown but don't block
- ❌ **Different** - Uses different build pipeline than production

### `npm run build` (Production Mode - What Vercel Uses)
- ✅ **Strict** - All TypeScript errors block the build
- ✅ **Same as Vercel** - Uses identical build process
- ✅ **Catches everything** - Missing files, type errors, etc.
- ⚠️ Slower - Takes ~1 minute

## Recommended Workflow

### Before Every Push:
```bash
# 1. Quick type check (10 seconds)
npm run type-check

# 2. If that passes, full build (1 minute)
npm run build

# 3. Only then push
git push
```

### Or Use the Combined Command:
```bash
npm run build:check  # Does both type-check and build
```

## What Each Command Catches

### `npm run type-check`
- ✅ TypeScript type errors
- ✅ Missing type definitions
- ✅ Type mismatches
- ❌ Missing files (JSON imports)
- ❌ Module resolution issues

### `npm run build`
- ✅ **Everything type-check catches**
- ✅ Missing files
- ✅ Module resolution
- ✅ Build-time errors
- ✅ Linting errors (warnings shown, but don't block)

## Example: How We Could Have Caught All Errors

Instead of:
1. Push → Vercel error → Fix → Push → Vercel error → Fix (repeat 20x)

We could have:
1. Run `npm run build` locally
2. See ALL errors at once
3. Fix them all
4. Push once → Success ✅

## Time Comparison

**What we did (inefficient):**
- 20+ pushes × 2 minutes per build = **40+ minutes**
- Plus fix time = **~1 hour total**

**What we should do (efficient):**
- 1 local build = **1 minute**
- Fix all errors = **10-15 minutes**
- 1 push = **2 minutes**
- **Total: ~15-20 minutes** (3x faster!)

## Pro Tips

### 1. Run Build After Major Changes
```bash
# After adding new features, imports, or dependencies
npm run build
```

### 2. Use Type-Check for Quick Feedback
```bash
# While coding, run this frequently
npm run type-check
```

### 3. Clean Build (If Build Cache Issues)
```bash
# If you suspect cache issues
rm -rf .next
npm run build
```

### 4. Check for Missing Files
```bash
# Before committing, verify imported files exist
find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "from.*\.json" | while read file; do
  grep -o "from ['\"]@/[^'\"]*\.json['\"]" "$file" | sed "s/from ['\"]//;s/['\"]//" | while read json; do
    if [ ! -f "src/${json#@/}" ]; then
      echo "⚠️  Missing: $json (imported in $file)"
    fi
  done
done
```

## Automation (Optional)

### Pre-Push Hook (Prevents Bad Pushes)
Create `.husky/pre-push`:
```bash
#!/bin/sh
npm run build:check
```

Or use a simpler approach - just remember to run `npm run build` before pushing!

## Summary

**Always run `npm run build` locally before pushing to catch Vercel build errors early!**

This would have saved us ~40 minutes of back-and-forth with Vercel builds.

