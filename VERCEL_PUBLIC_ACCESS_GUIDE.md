# Making Your Vercel Deployment Publicly Accessible

## Why Email/Login is Required

If your colleagues are seeing a Vercel login page when accessing your deployment, it means **Password Protection** is enabled on your Vercel project. This is a Vercel **Pro plan feature** that requires authentication before viewing the site.

## ⚠️ Vercel Pro Plan Required

**Password Protection is a Pro plan feature** ($20/month). If you're on the free Hobby plan, you have these options:

### ✅ Option 1: Use Built-in Password Protection (FREE - Recommended)

We've added a **free password protection solution** using Next.js middleware that works on the free plan!

**How to enable:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add these environment variables:
   - `ENABLE_PASSWORD_PROTECTION` = `true`
   - `SITE_PASSWORD` = `your-secret-password-here`
3. Redeploy your site

**How it works:**
- Users see a password prompt page
- After entering the correct password, they get a cookie (valid for 7 days)
- No Vercel Pro plan needed!

**To disable:** Set `ENABLE_PASSWORD_PROTECTION` = `false` or remove it

### ✅ Option 2: Make It Fully Public (FREE)

Simply **don't enable password protection** - your site will be publicly accessible to anyone with the URL.

## Quick Setup Guide

### To Enable Password Protection (FREE):

1. **Add Environment Variables in Vercel:**
   - Go to: Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add: `ENABLE_PASSWORD_PROTECTION` = `true`
   - Add: `SITE_PASSWORD` = `Innovation`
   - Apply to: **Production**, **Preview**, and **Development** (if needed)

2. **Redeploy:**
   - Push a new commit, or
   - Go to Deployments → Click "Redeploy" on the latest deployment

3. **Share with Colleagues:**
   - Share the deployment URL
   - Share the password separately (via email/Slack)
   - They enter the password once, and it's saved for 7 days

### To Make It Public (No Password):

1. **Remove or disable the environment variable:**
   - Set `ENABLE_PASSWORD_PROTECTION` = `false`, or
   - Delete the `ENABLE_PASSWORD_PROTECTION` variable
   - Redeploy

2. **Result:** Anyone with the URL can access without a password

## How to Share Your Deployment

### Method 1: Production URL (Public)
```
https://your-project-name.vercel.app
```
- Share this URL - it's publicly accessible (if password protection is off)
- This is your main production deployment

### Method 2: Preview Deployment URL
```
https://your-project-name-git-branch-username.vercel.app
```
- Each commit gets a unique preview URL
- Share specific preview URLs for review
- Also publicly accessible (if password protection is off)

### Method 3: Custom Domain
If you've set up a custom domain:
```
https://your-custom-domain.com
```

## Quick Checklist

**For Password Protection (FREE):**
- [ ] Add `ENABLE_PASSWORD_PROTECTION` = `true` in Vercel environment variables
- [ ] Add `SITE_PASSWORD` = `your-password` in Vercel environment variables
- [ ] Redeploy your site
- [ ] Share URL + password with colleagues
- [ ] Test in incognito window to verify password prompt works

**For Public Access:**
- [ ] Set `ENABLE_PASSWORD_PROTECTION` = `false` or remove it
- [ ] Redeploy your site
- [ ] Share URL with colleagues (no password needed)
- [ ] Test in incognito window to verify it's public

## How It Works

The built-in password protection:
- ✅ Works on **Vercel free plan** (no Pro needed!)
- ✅ Uses Next.js middleware (runs on every request)
- ✅ Stores password in secure HTTP-only cookie (7 days)
- ✅ Shows a nice password prompt page
- ✅ Can be enabled/disabled via environment variable
- ✅ No code changes needed - just set env vars

## Security Notes

- Password is stored in environment variable (secure)
- Cookie is HTTP-only (can't be accessed by JavaScript)
- Cookie expires after 7 days (users need to re-enter)
- Works on all routes except API routes and Next.js internals

## Troubleshooting

**Q: I disabled password protection but still see login?**
- Clear your browser cache
- Try an incognito/private window
- Wait a few minutes for changes to propagate

**Q: Can I protect only certain routes?**
- Password protection applies to the entire deployment
- For route-level protection, you'd need to implement authentication in your app code

**Q: How do I know if password protection is on?**
- Check Vercel Dashboard → Settings → Deployment Protection
- If enabled, you'll see a password field

---

**Note:** Your deployment URL is always accessible - the question is whether it requires authentication. For colleague review, disable password protection to make it truly public.

