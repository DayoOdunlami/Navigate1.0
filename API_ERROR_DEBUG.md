# API Error Debug Guide

## Current Error
- "Internal Server Error" when trying to use chat
- Function execution fails silently

## Suspected Issues

### 1. Message Format in Continuation
When building continuation messages, we might be:
- Including duplicate user messages
- Using wrong format for tool_calls
- Missing required fields

### 2. Tool Calls Format
The tool_calls format might not match OpenAI's expectations in continuation requests.

## Next Steps to Fix

1. Check server console logs for actual error
2. Simplify continuation message format
3. Add better error handling
4. Verify tool call format matches OpenAI spec


