# Atlas Error Fix - JSON Parsing

## Issue
Error: `Unexpected token 'I', "Internal S"... is not valid JSON`

This error occurs when:
1. The scraper returns an error page instead of content
2. The AI returns a response that isn't valid JSON
3. The frontend tries to parse a non-JSON error response

## Fixes Applied

### 1. Frontend Error Handling (`ExtractChallengeForm.tsx`)
- Check `Content-Type` header before parsing JSON
- Handle JSON parse errors gracefully
- Show user-friendly error messages

### 2. Scraper Improvements (`scraper.ts`)
- Better error detection (checks for "Internal Server Error" pages)
- Timeout handling (30 second timeout)
- Empty content detection
- Auto-select Playwright for gov.uk domains (they have accordions)

### 3. JSON Parsing (`extractor.ts`)
- Better JSON extraction from AI responses
- Handles markdown code blocks
- Detailed error messages with response preview
- Try-catch around all JSON.parse calls

### 4. AI Provider (`ai-provider.ts`)
- Error handling for tool call argument parsing
- Better error messages

## For gov.uk URLs

The Jet Zero Strategy URL (`https://www.gov.uk/government/publications/jet-zero-strategy`) should now:
1. Auto-detect as gov.uk domain
2. Use Playwright instead of Jina (better for interactive pages)
3. Auto-expand accordions
4. Handle errors gracefully

## Testing

Try the URL again - it should now:
- Use Playwright for scraping
- Show better error messages if something fails
- Handle JSON parsing errors gracefully

