# Atlas Troubleshooting Guide

## Internal Server Error

If you're getting an "Internal Server Error", check the following:

### 1. Check Server Logs

Look at your terminal/console where `npm run dev` is running. The error details should be logged there.

### 2. Common Issues

#### Playwright Not Installed
If the error mentions Playwright:
```bash
npm install playwright
npx playwright install chromium
```

#### OpenAI API Key Missing
Make sure `OPENAI_API_KEY` is set in your `.env.local`:
```bash
OPENAI_API_KEY=sk-...
```

#### URL Access Issues
- Some URLs may be blocked or require authentication
- gov.uk URLs should auto-use Playwright
- Very large pages may timeout (30 second limit)

### 3. Check Error Details

The improved error handling now shows:
- **Frontend**: More detailed error messages
- **API Route**: Full error stack in development mode
- **Scraper**: Specific error messages for each failure point

### 4. For gov.uk URLs Specifically

The Jet Zero Strategy URL should:
1. Auto-detect as gov.uk
2. Use Playwright (not Jina)
3. Auto-expand accordions
4. Handle errors gracefully

If it fails:
- Check Playwright is installed
- Check server logs for specific error
- Try a simpler URL first to test

### 5. Debug Steps

1. **Check terminal logs** - Full error details are logged
2. **Try a simple URL** - Test with a basic page first
3. **Check environment variables** - Ensure API keys are set
4. **Verify Playwright** - Run `npx playwright install chromium`
5. **Check network** - Some URLs may be blocked

### 6. Getting More Details

The error should now include:
- Specific error message
- Stack trace (in development)
- Which stage failed (scraping, extraction, classification, etc.)

Check your server console for the full error details!

